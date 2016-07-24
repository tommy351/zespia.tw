---
layout: post
title: Phase — 史上最漂亮也最吃資源的主題
date: 2012-12-07 18:36:03
comments: true
tags:
- Hexo
- Octopress
- Node.js
---

![](http://i.minus.com/icsKsGRjMpstw.png)

在轉到Hexo之前，我一直都在使用這個[私用主題 Phase](http://zespia.tw/blog/2012/05/02/new-theme-phase/)，曾經承諾過我用膩了就公開發佈，於是今天就有這篇文章了。

這個主題是以 [Slash](http://zespia.tw/Octopress-Theme-Slash/index_tw.html) 為基礎開發的，所以大部分的特性都繼承下來了，除了 Responsive Design 和 Twitter Live Stream 以外。

- Phase Beam 動態背景
- 自動讀取圖片的`alt`屬性，並在圖片下方顯示註解。
- 內建 [Fancybox](http://fancyapps.com/fancybox/)，讓您輕鬆展示您的作品。
- 自動將 HTML5 video、iframe、object等嵌入式影片縮放至頁面寬度。
- [預覽...](http://zespia.tw/hexo-theme-phase)

Phase Beam 動態背景的效果非常絢麗，但是也非常吃資源，電腦或瀏覽器效能不佳的使用者開啟時可能會當機，至於IE8，<del>你何時產生了我曾經積極支援過它的錯覺？</del>

<!-- more -->

## 安裝

Octopress 版本：

```
cd octopress
git clone git://github.com/tommy351/octopress-theme-phase.git .themes/phase
rake install['phase']
rake generate
```

為了推廣 Hexo，順便把主題移植過去了，往後的主題開發都會以Hexo為主，但仍會以MIT License開放原始碼，想要在Octopress使用的人可以自行開發移植版本。

```
cd hexo
git clone git://github.com/tommy351/hexo-theme-phase.git themes/phase
```

Hexo版本安裝後別忘了將`_config.yml`內的`theme`參數調整為`phase`。

## FAQ

###Octopress版和Hexo版有什麼差別？

- Octopress版沒有相簿（photo）和連結（link）兩種布局
- 部分樣式的微妙差別
- <del>Octopress速度比較慢</del>

###如何編輯選單？

- Octopress版本：編輯`source/_includes/custom/navigation.html`。
- Phase版本：編輯`_config.yml`的`menu`參數。

###如何關閉Fancybox？

對於Chrome來說，同時執行Phase Beam和Fancybox的動畫似乎是一件很吃力的事情，所以你也可以選擇關閉Fancybox功能。

- Octopress版本：刪除`source/_includes/after_footer.html`的第1行。
- Hexo版本：`_config.yml`的`fancybox`參數調整為`false`。

###如何關閉Phase Beam？

我覺得用Phase還關閉Phase Beam實在是一件很沒有意義的事情，關閉了Phase Beam的Phase就只是一個背景黑漆漆的Slash而已，沒有任何特色，相較於Slash還少了一些功能，但是我還是稍微說明吧。

- Octopress版本：刪除`source/_includes/after_footer.html`的第2行。
- Hexo版本：刪除`layout/_partial/after_footer.ejs`的最後一行。

如果還有其他問題或想法，歡迎在下方留言。