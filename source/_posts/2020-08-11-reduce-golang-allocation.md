---
title: 減少 Go 的 allocation 改善 rdb-go 的效能
tags:
  - Go
  - Redis
comment_service: utterances
---
上個月因為工作需要掃描 Redis RDB 檔案，所以用 Go 自幹了一個 parser。雖然已經有各種現成的 library，其中以 Python 實作的 [redis-rdb-tools] 為主，[其他 library](https://github.com/sripathikrishnan/redis-rdb-tools/wiki/FAQs#i-dont-like-python-is-such-a-parser-available-in-language-x) 大都以 [redis-rdb-tools] 的邏輯來實作，文件中 Go 的連結已失效，然而我的 codebase 以 Go 為主，所以我決定自己用 Go 實作一個 RDB parser。

<!-- more -->

RDB parser 本身其實不會太複雜，[redis-rdb-tools] 的作者很貼心地提供了[詳細的文件](https://github.com/sripathikrishnan/redis-rdb-tools/wiki/Redis-RDB-Dump-File-Format)說明 RDB 的格式。在 RDB 裡，每個 key 大概會長得像這樣：

```plain
FD/FC $ttl
$value-type
$string-encoded-key
$encoded-value
```

整個 RDB 檔案除了開頭和結尾的一些 metadata 以外，大致上都是由這樣的 key 組成的，所以讀取起來很輕鬆，所有值前面都會標明長度，看到特定的 byte 就停下來，我大概花一週左右把初版的 RDB parser 寫完，API 長得像這樣：

```go
parser := NewParser(file)

for {
  data, err := parser.Next()

  if err == io.EOF {
    break
  }

  if err != nil {
    panic(err)
  }

  // do something
}
```

就是一個很典型的 iterator 的形狀，這樣就不需要等到整個檔案都 parse 完才回傳結果。

## 初次測試

測試時拿一些小型的 RDB 檔案（小於 1 MB）來 parse 的話大概都沒什麼問題，但實際上正式環境是由 16 個大約 1.7 GB 的 RDB 組成的，初版的 parser 大約需要花一分鐘左右才能 parse 完一個檔案，如果要每個 RDB 都 parse 的話就需要大約 15 分鐘。

雖然說實際上這個 parser 每天只會在半夜跑一次，就算讓它放著跑也無所謂，但我還是很好奇究竟為何這麼耗時，單檔 1.7 GB 照理來說應該不需要花這麼多時間來 parse。

## Key Filtering

我一開始以為原因是因為每個 key 都 parse 的話會很花時間，如果我只需要其中 20% 的資訊，卻花了其他沒必要的功夫來處理其他 key 的話，很顯然會浪費很多時間，所以我做了一個 key 的過濾機制，API 大概像這樣：

```go
parser := NewParser(file)

parser.KeyFilter(func(key string) bool {
  return key == "example"
})
```

使用者可以自訂 `KeyFilter` 函數，如果 return `false` 的話就會直接跳過那個 key 長度的 bytes。

我原本以為這樣就能解決效能問題了，但事情卻不如我想像，即便 `KeyFilter` 永遠 return `false`，也就是 filter 所有 key，速度還是沒差多少，這令我更好奇背後的原因了。

## 重複利用 `[]byte`

就在這時我看到了 Dave Cheney 寫的 [Building a high performance JSON parser](https://dave.cheney.net/high-performance-json.html)，這篇文章描述了如何從頭開始做一個高效能的 JSON parser，讓我收穫最多的就是關於[讀取](https://dave.cheney.net/high-performance-json.html#_reading)的這段。

我在這邊大概介紹一下概念，詳細可以參考那篇文章或是 [github.com/pkg/json](https://github.com/pkg/json)。

Go 的 [`io.Reader`](https://golang.org/pkg/io/#Reader) interface 長得像這樣。

```go
type Reader interface {
  Read(p []byte) (n int, err error)
}
```

使用方式很簡單，給 `Read` 方法一個 `[]byte`，Reader 就會讀取資料並把資料塞到 `[]byte` 裡，並回傳它塞了多少個 byte 進去。

初版 RDB parser 的寫法很無腦，就是需要多少長度我就分配多少長度的 `[]byte`。

```go
buf := make([]byte, 1)
n, err := reader.Read(buf)
```

這種寫法一般來說沒什麼問題，只是比較沒有效率，需要頻繁的 allocate。例如說 RDB 裡長度多半會是 1~4 bytes，長度在每個 key 或是各種 data type 裡都會出現，那麼我就必須每次都 allocate 這種長度非常小的 `[]byte`。

文章裡提到的解決方法就是一次分配一塊 buffer，一次讀取更多資料，然後自己維護 buffer 裡資料的 offset 和 length，視情況需要擴張 buffer 的長度，這樣就不需要每次都 allocate 新的 `[]byte`，只有在 `[]byte` 擴張或是 `[]byte` 轉 `string` 的時候才會 allocate。

## 實作 Buffer

首先先把 `[]byte` 切成三個區塊，從 0 到 Offset 之間是已經消化完的資料，從 Offset 到 Length 是已經從 `io.Reader` 讀取但尚未使用的資料，最後從 Length 到 Capacity 則是 `[]byte` 的剩餘空間。

{% asset_img buffer-01.svg %}

每次從這塊 buffer 讀取資料時，都會把 Offset 往右推進，如果 Offset 超過 Length 的話，則會從 `io.Reader` 讀取新的資料，這時會有四種狀況。

如果資料還能夠塞得進剩餘空間，那就會直接從 `io.Reader` 讀取資料，並更新 Length。

{% asset_img buffer-02.svg %}

如果資料塞不下剩餘空間了，但小於 Capacity 的話，就會把 Offset 歸 0，然後讀取資料。

{% asset_img buffer-03.svg %}

如果資料比 Capacity 還大的話，就會擴充 buffer 的空間。

{% asset_img buffer-04.svg %}

我把 buffer 的擴充上限設定為 4096 bytes，如果資料大於這個大小的話，我就會直接 allocate 新的 `[]byte`，不會把資料放到 buffer 裡，這樣能避免某些太大的 value 把 buffer 撐得太大。

具體實作可以參考 [`rdb-go` 的 `byte_reader.go`](https://github.com/tommy351/rdb-go/blob/92a904e/byte_reader.go)，或是 [`pkg/json` 的 `reader.go`](https://github.com/pkg/json/blob/319c2b1/reader.go)。

## Benchmark

最後來比較一下改用 buffer 前後的差異，機器規格如下：

- CPU: AMD Ryzen 5 3400G
- Memory: 32 GB
- OS: Ubuntu 18.04 on Windows 10 (WSL 2)

Benchmark 有兩個部分，一個是測試用的小檔案：

- `empty_database` - 完全空的 RDB（10 B）
- `parser_filters` - 包含各種資料型態（1.2 KB）
- `linked_list` - 一個 1000 個元素的 list（50 KB）

另一個部分則是正式環境的 RDB，大約 1.7 GB。

首先是初版 RDB parser：

```plain
BenchmarkParser/empty_database-8                 4782122               258 ns/op              64 B/op          5 allocs/op
BenchmarkParser/parser_filters-8                   13935             85142 ns/op           37856 B/op       1441 allocs/op
BenchmarkParser/linkedlist-8                        3426            355550 ns/op          274337 B/op       6025 allocs/op
```

```plain
1m0.3905848s
Alloc = 0 MiB   TotalAlloc = 11105 MiB  Sys = 139 MiB   NumGC = 3053
```

改用 buffer 後的結果：

```plain
BenchmarkParser/empty_database-8                 2588905               388 ns/op           632 B/op          5 allocs/op
BenchmarkParser/parser_filters-8                   17988             67288 ns/op         38640 B/op        877 allocs/op
BenchmarkParser/linkedlist-8                        3628            329772 ns/op        274921 B/op       5020 allocs/op
```

```plain
18.9372338s
Alloc = 3 MiB   TotalAlloc = 11542 MiB  Sys = 206 MiB   NumGC = 3171
```

從小檔測試的部分可以看出雖然在 `empty_database` 的部分改用 buffer 後反而會更差，但是在其他情況下會好很多，原因是因為 buffer 的初始大小是 512 bytes，所以如果 RDB 小於 512 bytes 的話反而會 allocate 多餘的空間，但實際上不可能用在這麼小的 RDB，所以可以忽略。

在正式環境測試中，可以看到時間從一分鐘縮減到只需要 18 秒，改用 buffer 的效果十分顯著，雖然 `TotalAlloc`（總共 allocate 的大小）和 `NumGC`（GC 次數）沒差多少，推測大概是因為 `[]byte` 轉 `string` 的 allocation。

除了自己實作 buffer 以外，利用 Go 內建的 [bufio.Reader](https://golang.org/pkg/bufio/#Reader) 也是一種選擇，但使用時必須要謹慎，我在測試時雖然能夠得出和上面差不多的效能，但是 `TotalAlloc` 和 `NumGC` 會暴增三倍，所以還是決定自己實作了。

## 結論

在反覆嘗試的時候讓我學到了一些關於 Go 的效能最佳化的方法，推薦大家可以去看看文章內提到的原文，以及原文作者引用的一些相關連結。

- [Building a high performance JSON parser](https://dave.cheney.net/high-performance-json.html)
- [[]byte versus io.Reader](https://philpearl.github.io/post/reader/)

如果剛好像我一樣有 RDB parser 的需求的話，歡迎試用看看我寫的 [rdb-go](https://github.com/tommy351/rdb-go)。

[redis-rdb-tools]: https://github.com/sripathikrishnan/redis-rdb-tools
