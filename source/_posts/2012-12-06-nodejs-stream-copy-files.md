---
layout: post
title: 使用 Stream 來拷貝檔案
date: 2012-12-06 00:14:46
comments: true
tags:
- Node.js
- JavaScript
---

![K子 - ぬれ早苗 (id=16398495)](http://i.minus.com/iFFlrSnC6IrC8.jpg)

> **Stream** [strim] n. [C] 小河、溪流

因為Stream有這樣的意思，所以找了一張有溪流的圖片當做頁首圖片，<del>要在Pixiv上找一張非R-18的濕身圖片真難</del>。

雖然 [Hexo] 本來就很快了，不過在 [0.1.8](https://github.com/tommy351/hexo/commit/1bfc6324285d7cadeb30f2c4bf4e8ea5fc451d5e) 使用 [Stream] 代替原本的檔案複製方法，使靜態檔案的生成速度更加快速。

<!-- more -->

原本的檔案複製方式是：

```
function copy(source, destination, callback){
	fs.readFile(source, function(err, file){
		if (err) throw err;
		fs.writeFile(destination, file, callback);
	});
}
```

非常簡單，就是檔案讀取完後再將檔案寫入到目的地。這種方法必須將所有檔案讀取完成後才能寫入，將對地沒有效率多了，使用 [Stream] 則是邊讀取邊寫入，當讀取完成後，寫入也差不多完成了，在處理大檔案時，差別更加明顯。

除了檔案讀寫以外，[Stream] 也常用於靜態檔案伺服器，例如 [Connect] 就是用這種方式來處理靜態檔案的。

用 [Stream] 的方式來複製檔案，相較於原本的方式，也只不過是多了幾行程式碼而已，如下：

```
function copy(source, destination, callback){
	var rs = fs.createReadStream(source),
		ws = fs.createWriteStream(destination);
		
	rs.pipe(ws).on('error', function(err){
		if (err) throw err;
	});
	
	ws.on('close', callback).on('error', function(err){
		if (err) throw err;
	});
}
```

首先建立讀取 Stream `rs` 和寫入 Stream `ws`，使用 `rs.pipe` 讀取資料同時將資料寫入至 `ws`。

Stream 使用 [EventEmitter]，當結束或發生錯誤時會觸發事件，必須利用 `rs.on` 和 `ws.on` 來監聽事件。

這種方式實在有點麻煩，如果能寫成 `rs.pipe(ws, function(err, callback){})` 的形式就好了。

![](http://i.minus.com/iwucHChl9EUD0.png)

根據這種方式實作的 Hexo 0.1.8，實測出來的速度是 1007 ms，而舊版為 2038 ms，平均大約快了 1.5~2 倍左右，只要改寫一點程式碼就能獲得這麼高的效能提昇，非常值得。

[Hexo]: http://zespia.tw/hexo
[Stream]: http://nodejs.org/api/stream.html
[Connect]: http://www.senchalabs.org/connect/
[EventEmitter]: http://nodejs.org/api/events.html