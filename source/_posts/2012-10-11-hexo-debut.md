---
layout: post
title: Hexo 颯爽登場！
date: 2012-10-11 15:22:47
comments: true
tags:
- JavaScript
- Node.js
- Hexo
---

![ちり - Super sonic Child (id=29663134)](http://i.minus.com/ibpMKNkpRxVwsK.jpg)

我想每個 [Octopress] 的使用者一定都有這樣的煩惱──隨著文章數量愈來愈多，檔案建立的速度愈來愈慢。本站目前已累積至 54 篇文章，每次建立檔案時，至少都需要花費一分鐘以上的時間。

或許是因為 Ruby 天生就比較慢，而這種問題未來似乎也不會改善，[Jekyll] 和 [Octopress] 已經一段時間沒有更新，那麼唯一的解決方案只有另覓其他 Blog Framework 了。

<!-- more -->

## 尋覓

由於最近都在玩 Node.js，便決定從它開始下手，我試著在網路上找了一下，然而現有的 Blog Framework 看來都過於簡單；只有一個除外：[DocPad]。

[DocPad] 擴充性十足，而且一直有在更新，但是 [DocPad] 又令人感覺過於複雜，難以上手。

**參考資料**：[Node based static site generators - Boris Mann](http://blog.bmannconsulting.com/node-static-site-generators/)

## 造輪子

![](http://i.minus.com/iUuOEU0Yw0JbB.png)

那麼唯一的方式，大概只剩自造輪子了。

Prototype 的速度相當不錯，在 2 秒內即可將全站的資料都建立完成。之後的一個月，便以此為基礎擴充、加強，最後的成品即是──Hexo！

你或許會好奇這篇文章的開頭為何要放一張與內容毫不相關的圖片，雖然放不相關圖片是傳統，不過這次的開頭圖片可是有關聯性的！

我想 [Octopress] 的名稱來源也許是 Octal*（八進制）* + Press，因此我便以十六進制*（hexadecimal，縮寫為 hex）*來取名。

而為啥會扯上這張圖片呢？因為 Hexo 的發音很類似於へそ*（肚臍）*。

## Hexo

前面扯了那麼多廢話，該來談談 Hexo 的細節了。

Hexo 和 [Jekyll]、[Octopress] 有許多相似點，大部分的使用都和其無異。

### 安裝

前提是必須先安裝 Node.js，至於怎麼安裝自己 Google 吧

``` bash
npm install hexo -g
```

僅需一步就把 Hexo 本體和所有相依套件安裝完畢，很簡單吧？

### 初始化

``` bash
hexo init <folder>
```

如果指定 `<folder>`，便會在目前的資料夾建立一個名為 `<folder>` 的新資料夾；否則會在目前資料夾初始化。

設定請參閱 [Wiki](https://github.com/tommy351/hexo/wiki/Configure)，我還不太會寫文件，如果看不懂的話請不要鞭太大力。

### 佈署

0.1.0 版後，佈署方式有所調整，請參見 <https://github.com/tommy351/hexo/wiki/Deploy>。

### 建立文章、分頁

``` bash
hexo new_post <title>
hexo new_page <title>
```

Hexo 已經內建一些外掛了，你可以用這些外掛快速插入元素：

- Block Quote
- Code Block
- Gist
- jsFiddle
- Pull Quote
- Vimeo
- Youtube

外掛的詳細使用方式之後會在 [Wiki](https://github.com/tommy351/hexo/wiki) 補完。

### 生成檔案

``` bash
hexo generate
```

依照環境不同，速度可能會有差別，在我的電腦上需要大約 4 秒鐘。

### 伺服器

``` bash
hexo server
```

伺服器會跑在 `http://localhost:port` （`port` 預設為 `4000`，可在 `_config.yml` 設定），也可以搭配 [Pow](http://pow.cx/) 使用：

``` bash
cd ~/.pow
ln -s /path/to/myapp
```

基本使用差不多就是這樣子，非常簡單。至於外掛和主題的撰寫方法，我之後會在 [Wiki](https://github.com/tommy351/hexo/wiki) 補完，你也可以嘗試看看[原始碼](https://github.com/tommy351/hexo)。

## 結論

[Octopress] 還是很棒，只是速度不夠快，我未來將會轉換到 Hexo，以下是未來的開發目標：

- Windows 測試（我現在只有在 Mac 上使用過，其他平台壓根不知道能不能運作）
- 完成 [Light](https://github.com/tommy351/hexo-theme-light) 主題（就是你目前看到的這個主題，之後我會把 Phase 移植過來並順便釋出）
- FTP Deploy
- 後台管理功能
- 預覽伺服器
- 檔案監看
- 增加擴充性（目前僅有三種外掛：Generator、Helper 和 Renderer，未來將會增加 Preprocessor 和 Tag）

如果你有興趣的話，歡迎試用看看，有任何問題的話歡迎留言。

<iframe src="http://ghbtns.com/github-btn.html?user=tommy351&repo=hexo&type=watch&count=true"
  allowtransparency="true" frameborder="0" scrolling="0" width="62px" height="20px"></iframe>

[Octopress]: http://octopress.org/
[Jekyll]: https://github.com/mojombo/jekyll
[DocPad]: https://github.com/bevry/docpad