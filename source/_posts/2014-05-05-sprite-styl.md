---
title: sprite.styl — 利用 Stylus 自動製作 Sprite
date: 2014-05-05 16:53:39
tags:
- JavaScript
- Stylus
---

{% asset_img 43049066.jpg 駒野・C・ローサ - ほの綺羅 (id=43049066) %}

上週因為 ~~懶得更新~~ 期中考而沒寫新文章，本週的內容同樣是技術性質的文章，而主題就是「**利用 Stylus 自動製作 Sprite**」，為了避免各位感到無聊，我特地在文章開頭放了一張毫無關聯的圖片，~~就是為了騙點閱率~~。

<!-- more -->

## Sprite 是啥？

有些人可能會對「Sprite」這詞感到疑惑，它並非飲料名稱，而是一種將數張圖片合併為一張圖片的技術，常見於網頁與遊戲設計中。在網頁設計中使用 Sprite 可以大幅降低網路請求的數量，如果有用到圖片按鈕的話，使用 Sprite 可避免圖片按鈕的閃動效果。

過去我用 [Sass] 時，一定會搭配 [Compass] 使用，而 [Compass] 最實用的功能之一就是自動製作 Sprite，它可以從指定資料夾中的所有圖片中，自動建立 Sprite，然而為人詬病的就是：

- 速度頗慢
- Retina Sprite 處理麻煩
- ~~林北現在只用 [Stylus] 啦！~~

然而，[Stylus] 目前還沒有一個好用的 Sprite 工具能用，所以我一直以來都用 [Font Awesome] 來避免這種煩惱。日前剛好在公司研究如何使用 [Compass] 製作 Retina Sprite，所以就花了點時間做了專為 [Stylus] 設計的 Sprite 工具：**[sprite.styl]**。

## 開發過程

[sprite.styl] 是一個用起來與 [Compass] 很相似的 Sprite 工具，只不過是為 [Stylus] 設計的，使用方式很簡單，自己去看說明和範例，本文就不詳細說明了，下面將說明此工具的開發過程。

要製作一個 Sprite 工具，首先最重要的就是一個高效的圖片處理工具，在 Node.js 常見的是：

- **[imagemagick]** - 使用 [ImageMagick]
- **[gm]** - 使用 [GraphicsMagick] 或 [ImageMagick]
- **[canvas]** - 使用 [Cairo]

第一個 [node-imagemagick] 因為效能太爛所以不考慮；而第二個 [gm] 雖然非常高效，但是非同步寫起來很麻煩，而且似乎只有圖片解析比較好用，圖片處理看起來較為麻煩。

因此，只剩下最後一個選擇 [canvas]，[canvas] 可支援同步處理，而且支援 HTML5 的 Canvas API，比起 [gm] 來說好用多了，然而缺點就是 [Cairo] 這鬼東西有夠難裝，我安裝時不知為何碰到一堆鬼問題。

挑選出適合的圖片處理工具後，剩下的問題便相當簡單了，~~只要照搬 [Compass] 的內容就好~~。

## 結語

[sprite.styl] 只是一時興起而寫的工具，我實際上還未使用過，畢竟我大部分時間都使用 [Font Awesome]，在公司則是用 [Compass]。目前還有些問題需要解決：

- 支援 Smart Selector
- 圖片壓縮
- 更高效的 Sprite 演算法（[Binary Tree Bin Packing Algorithm](http://codeincomplete.com/posts/2011/5/7/bin_packing/)）

如果有興趣的人歡迎撿去用，~~有問題的話本人一概不負責~~。在連續兩篇的技術性文章後，接下來大概會是兩篇遊戲文章：[勇者有點太囂張 G] 及 [超級槍彈辯駁 2]，敬請期待！

[Sass]: http://sass-lang.com/
[Compass]: http://compass-style.org/
[Stylus]: http://learnboost.github.io/stylus/
[Font Awesome]: http://fortawesome.github.io/Font-Awesome/
[sprite.styl]: https://github.com/tommy351/sprite.styl
[imagemagick]: https://github.com/rsms/node-imagemagick
[ImageMagick]: http://www.imagemagick.org/
[gm]: https://github.com/aheckmann/gm
[GraphicsMagick]: http://www.graphicsmagick.org/
[canvas]: https://github.com/LearnBoost/node-canvas
[Cairo]: http://cairographics.org/
[勇者有點太囂張 G]: http://www.jp.playstation.com/software/title/jp9000pcsc00047_000000000000000001.html
[超級槍彈辯駁 2]: http://www.danganronpa.com/2/
