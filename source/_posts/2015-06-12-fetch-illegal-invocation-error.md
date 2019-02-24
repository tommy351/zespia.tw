---
title: Fetch 壓縮後會在 Chrome 上發生 Illegal Invocation 錯誤
tags:
  - JavaScript
---

{% asset_img 50392856.jpg wara - れっつごー シアン ♪ (id=50392856) %}

最近在寫專題時，嘗試了許多新東西，例如改用 Go 來寫 API Server，還試了最近很潮的 Isomorphic JavaScript，如果未來有時間的話可能會針對這個主題再另外寫一篇文章，今天先寫最近遇到的一個怪問題。

<!-- more -->

各位可能有聽過 [Fetch] 這個新一代的標準，它簡化了瀏覽器麻煩的 XMLHttpRequest API，而且支援 Promise。

在開發時，[Fetch] 運行順利，然而上線後卻會發生 Illegal Invocation 錯誤，更弔詭的是，這種錯誤只在 Chrome 上發生。（我沒有在 Safari 或 Opera 上試過）

{% asset_img illegal-invocation-error.png Uncaught TypeError: Illegal invocation %}

我把原始碼都翻過了遍，上網搜尋關於 Illegal Invocation 也大都是關於 jQuery 的解答，在苦心搜尋幾小時就快放棄時，終於在 GitHub 上解答：[matthew-andrews/isomorphic-fetch#20](https://github.com/matthew-andrews/isomorphic-fetch/pull/20)

解決方式非常簡單，就是把原本的：

``` js
import fetch from 'isomorphic-fetch';
```

改成：

``` js
import fetch_ from 'isomorphic-fetch';
const fetch = fetch_.bind(this);
```

只要把 import 進來的 `fetch` 綁定 `this`，就能解決這個詭異的問題了。

## 後記

題圖是本季新番「[Show By Rock]」，雖然一開始的展開很腦殘，不過之後的劇情卻非常有趣，重點是，**每個角色都好可愛啊**！

[Fetch]: https://fetch.spec.whatwg.org/
[Show By Rock]: http://showbyrock-anime.com/
