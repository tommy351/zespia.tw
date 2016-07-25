---
title: 用 Elixir 和 hackney 做 proxy
tags:
- Elixir
- hackney
---
{% asset_img 58015555.png hibimegane - おにんぎょうあそび (id=58015555) %}

前幾個月改版時，我決定用 [Elixir] 來實作 OAuth server + Proxy，這是一門結合了 [Erlang] VM 和 [Ruby] 語法的程式語言，可以很容易運用 [Erlang] 的特性做出低延遲、高並發且高容錯度的系統，又不用學習 [Erlang] 比較特殊的 Prolog 式語法（但是你可能還是多少要懂 [Erlang] 語法，因為很多時候你會直接運用 Erlang library）。

Erlang 的這些強大特性拿來做 OAuth server + Proxy 似乎有些大材小用，不過因為我爽，所以就決定用 [Elixir] 來寫了。

<!-- more -->

## OAuth Server

實作 OAuth 的部分很無聊就不在本文贅述了，我強烈推薦 [Yu-Cheng Chuang 大大寫的 OAuth 2.0 筆記](https://blog.yorkxin.org/2013/09/30/oauth2-1-introduction)，搭配 [RFC 6479] spec 很快就能實作出符合規格的 OAuth server。

## Proxy

接著就是今天的重頭戲 Proxy，用 [Elixir] 實作可能不會是你的最佳選擇，所以看看就好，不要模仿。

首先必須先選個 HTTP client，在 Node.js 有個非常強大的 [request]，而 Elixir 有：

- [HTTPoison]: 基於 [hackney]
- [HTTPotion]: 基於 [ibrowse]

或是 Erlang：

- [hackney]
- [ibrowse]
- [lhttpc]
- [fusco]
- [gun]
- [shotgun]: [gun] + Server-sent Events

Elixir 的 library 因為經過封裝而損失了一些比較底層的功能，所以我決定直接使用 Erlang library，這時我就瞭解到學會 Erlang 的重要性，因為有些 library 是沒有寫文件的，必須直接讀原始碼才能瞭解如何運用。

### [hackney]

[hackney] 是我第一個接觸的 library，它是這幾個 library 裡更新最勤勞，而且在 Elixir 中使用也比較不突兀，用起來最順手的 library，但是因為一些已知問題（[#191][hackney-#191], [#267][hackney-#267]，可能會在 [hackney 2.0][hackney-#275] 解決），所以我決定尋求其他 library。

### [ibrowse]

[ibrowse] 是這裡頭第二靠譜的 library，但是運用上比 [hackney] 麻煩一些，要事先把 binary 轉成 list，而且可能是 HTTP 規格實作上的差異導致有些 request 無法正確完成。

### [lhttpc]

已停止維護。

### [fusco]

宣稱還在早期開發階段，然而已經超過兩年沒有任何 commit，而且沒有文件，是給人用的嗎？

### [gun]

與 [cowboy] 系出同門，都是 [Nine Nines] 的作品，感覺相當不錯，可惜的是使用到了 [cowlib] 1.3.0，和 [cowboy] 1 使用的 [cowlib] 1.0 衝突，因此無法使用。

### [shotgun]

因為 [gun] 沒辦法用，所以 [shotgun] 自然也用不了了。

## 調整效能

既然 Erlang 世界裡沒有其他更好的選擇了，那麼我唯一能做的就只有慢慢壓榨出效能，一開始的 proxy 很陽春，在網路上找到的大部分範例都這樣實作：

``` elixir
defmodule Proxy do
  import Plug.Conn

  def init(opts), do: opts
  
  def call(conn, _) do
    {:ok, client} = :hackney.request(method_to_atom(method), make_url(url), conn.req_headers, :stream, [])

    conn
    |> write_proxy(client)
    |> read_proxy(client)
  end
  
  defp method_to_atom(method) do
    method |> String.downcase |> String.to_atom
  end
  
  defp make_url(conn) do
    base = "http://localhost:4000" <> conn.request_path

    case conn.query_string do
      "" -> base
      qs -> base <> "?" <> qs
    end
  end
  
  defp write_proxy(conn, client) do
    case read_body(conn, []) do
      {:ok, body, conn} ->
        :hackney.send_body(client, body)
        conn

      {:more, body, conn} ->
        :hackney.send_body(client, body)
        write_proxy(conn, client)
    end
  end
  
  defp read_proxy(conn, client) do
    {:ok, status, headers, client} = :hackney.start_response(client)
    {:ok, body} = :hackney.body(client)

    %{conn | resp_headers: headers}
    |> send_resp(status, body)
  end
end
```

很明顯有些地方可以改善：

### 靜態 `method_to_atom`

`method_to_atom` 函數雖然簡單，只是把 `method` 改成小寫後再轉為 atom，但如果能夠節省每次的轉換開銷的話就能快些。

``` elixir
for method <- ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] do
  defp method_to_atom(unquote(method)) do
    unquote(method |> String.downcase |> String.to_atom)
  end
end
```

### Stream response

`:hackney.body` 會一次讀完所有 response body，但邊讀邊寫想必更有效率。我的做法是先判斷 `transfer-encoding: chunked` header，如果存在的話就以 chunk 形式回傳。

``` elixir
defp read_body(conn, client) do
  {:ok, status, headers, client} = :hackney.start_response(client)
  
  case List.Keyfind(headers, "transfer-encoding", 0) do
    {_, "chunked"} ->
      conn
      |> send_chunked(status)
      |> stream_body(client)
      
    _ ->
      {:ok, body} = :hackney.body(client)
      conn |> send_resp(status, body)
  end
end

defp normalize_headers(headers) do
  Enum.map(headers, fn {k, v} ->
    {String.downcase(k), v}
  end)
end

defp stream_body(conn, client) do
  case :hackney.stream_body(client) do
    {:ok, body} ->
      {:ok, conn} = chunk(conn, body)
      stream_body(conn, client)
        
    :done -> conn
  end
end
```

### Async response

hackney 加上 `async` 選項後，可以用 `receive` 來一步步的接收到 status, headers 和 body，但實際上使用會碰到許多問題（[#224][hackney-#224], [#267][hackney-#267]），因此作罷。

### 直接使用 Cowboy

看來 hackney 方面已經沒什麼好調整了，只好把觸手伸到 Plug 上了，透過 Plug 送 body 需要額外的開銷，那麼直接使用 Cowboy 說不定會更快？以這樣的想法不斷琢磨後，最後的成品就是 [PlugProxy]。

``` elixir
forward "/v2", to: PlugProxy, upstream: "http://localhost:4000"
```

使用上很簡單，不過實際上浪費了我很多時間，而且效能也真的不算多好，中途遇到一些 hackney 的坑都讓我想另外造一個 HTTP client 的輪子了，用 Node.js 的 [request] 解決可能簡單的多吧哈哈。

``` js
const request = require('request');

req.pipe(request.get('http://localhost:4000')).pipe(res);
```

## 後記

{% asset_img IMAG0135.jpg 小暴君和蘿莉控 %}

在改版完成的一個月後，~~我就回老家種田了~~，就和朋友一起去極上爆音體驗震撼人心（物理）的ガルパン＋聖地巡禮了，旅遊真他媽爽啊！

[Elixir]: http://elixir-lang.org/
[Erlang]: https://www.erlang.org/
[Ruby]: https://www.ruby-lang.org
[RFC 6479]: https://tools.ietf.org/html/rfc6749
[Plug]: https://github.com/elixir-lang/plug
[request]: https://github.com/request/request
[HTTPoison]: https://github.com/edgurgel/httpoison
[HTTPotion]: https://github.com/myfreeweb/httpotion
[hackney]: https://github.com/benoitc/hackney
[ibrowse]: https://github.com/cmullaparthi/ibrowse
[lhttpc]: https://github.com/esl/lhttpc
[fusco]: https://github.com/esl/fusco
[gun]: https://github.com/ninenines/gun
[shotgun]:https://github.com/inaka/shotgun
[hackney-#191]: https://github.com/benoitc/hackney/issues/191
[hackney-#224]: https://github.com/benoitc/hackney/issues/224
[hackney-#267]: https://github.com/benoitc/hackney/issues/267
[hackney-#275]: https://github.com/benoitc/hackney/issues/275
[cowboy]: https://github.com/ninenines/cowboy
[Nine Nines]: http://ninenines.eu/
[cowlib]: https://github.com/ninenines/cowlib
[PlugProxy]: https://github.com/tommy351/plug-proxy