---
layout: post
title: "私用主題 Phase"
date: 2012-05-02 9:35
comments: true
tags: 
- Octopress
- 主題
---

![](http://i.minus.com/iMujOkELjjcra.png)

一段時間沒更新網誌了，最近大學有了著落之後，便決定抽空寫篇文章。自從 [Slash] 發佈之後，使用者日漸增多，不時會有 Pull Request，大概已經有數十個網誌都選用 [Slash] 作為佈景主題，雖然獲得了極大的成就感，不過林北不爽「撞主題」的感覺，所以決定再製作一個屬於自己的佈景主題。

[Slash]: http://zespia.tw/Octopress-Theme-Slash/index_tw.html

<!-- more -->

![](http://i.minus.com/iYr8rVrPO07gr.jpg)

起初決定以星辰、銀河作為主題，但就是找不到想要的那種感覺，而我又是 Photoshop 苦手，要我自己用 Photoshop 畫出想要的那種感覺實在有點困難。

<div class="video-container"><iframe width="420" height="315" src="http://www.youtube.com/embed/RiekCHOivVE" frameborder="0" allowfullscreen></iframe></div>

之後，偶然發現了一套 Android Live Wallpaper「Phase Beam」，這配色，這流暢滑順的動畫，就是我要的感覺，但是網路上只能找到 1440x1080 的圖片，作為背景圖片有點太迷你了，於是我便決定利用 HTML5 Canvas 來繪製類似 Phase Beam 的背景。

##背景

HTML5 Canvas 的運作方式不如想像中簡單，我花了好幾小時才勉強用得上來，特別是輻射漸層（Radial Gradient），我搞了好久才終於搞懂這鬼東西的運作方式，天殺的是哪個傢伙想出`createRadialGradient(x1,y1,r1,x2,y2,r2)`這種奇怪的鬼函數的。

![](http://i.minus.com/ibnLcNP2voPZTx.png)

使用方法搞定之後，其他便簡單許多了，只要記得繪製下一格動畫前，必須先使用`clearRect(x,y,width,height)`清空 Canvas，否則便會出現如上圖的慘狀。

###參考資料

- [Canvas tutorial - MDN](https://developer.mozilla.org/en/Canvas_tutorial)

##字體

![Pontano Sans v.s. Helvetica Neue v.s. Helvetica Neue Light](http://i.minus.com/iizFaxHHCWTjT.png)

整個佈景主題全都是 [Helvetica Neue Light] 似乎會讓人有些視覺疲勞，於是這次加入了 [Pontano Sans] 作為標題字體，[Pontano Sans] 的粗細與 [Helvetica Neue Light] 大致相同，不過小寫字母更窄了些。

![](http://i.minus.com/ibf2JncEj5mdzJ.png)

這次除了 Logo 以外，完全改用 [Font Awesome](http://fortawesome.github.com/Font-Awesome/) 字體作為圖示，相容性什麼的我也沒在管了，反正能支援到 IE 8+ 就夠了。

[Helvetica Neue Light]: http://en.wikipedia.org/wiki/Helvetica#Neue_Helvetica_.281983.29
[Pontano Sans]: http://www.google.com/webfonts/specimen/Pontano+Sans

##後記

<div class="video-container"><iframe width="560" height="315" src="http://www.youtube.com/embed/ZMhwixvwMUs" frameborder="0" allowfullscreen></iframe></div>

Phase 還有一些部分尚未完成，不過我已經迫不及待想用了，餘下的部份就等之後慢慢補完吧。

最近大學終於有了著落，空閒的時間變得更多了，也許該找份兼職來做，如果想找我設計佈景主題的話，可透過 Twitter 或 tommy351[at]gmail.com 與我洽談。最後就來一部氷菓 ED 吧，可見京阿尼砸了很多錢在賣肉上，明明只是兩位高中女生在滾床而已，卻能這麼嫵媚......。える好胸，摩耶花好腋啊。