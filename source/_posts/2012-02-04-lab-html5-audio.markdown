---
layout: post
title: "HTML5 audio 實驗"
date: 2012-02-04 13:29
comments: true
tags: 
- JavaScript
- HTML5
---
![](http://i.minus.com/inE9d4C1xPbYD.png)

寒假即將結束，不巧膝蓋突然中了一箭，便決定實驗 HTML5 `audio`標籤的效果，雖然已有 [jPlayer] 這款輕便好用的播放器，但不折騰一下就沒辦法消磨時間了，所以本次的實驗品完全由我操刀。

<!-- more -->

##開始之前

首先必須了解`audio`標籤的使用方式：

``` html
<audio controls>
	<source src="music.mp3">
	<source src="music.ogg">
</audio>
```

輸入以上代碼後，便可在網頁中看到瀏覽器內建的播放器。每種瀏覽器支援的播放類型不一，最保險的方法是備妥`mp3`、`ogg`。

為了浪費時間，當然不可能用瀏覽器的預設介面，所以刪除`controls`屬性，透過 JavaScript 操作：

``` js
var audio = document.getElementsByTagName('audio')[0];
// 播放
audio.play();
// 暫停
audio.pause();
```

只需要懂這兩個函數，就可製作最基礎的播放器了，其他複雜的指令可參閱文末的參考出處。

##介面

寫網頁時，比起最重要的 JavaScript，我習慣先寫 CSS，最初的參考範本是 Mac 的 [CoverFlow]。

![](http://i.minus.com/ibtVhj6FYs9Hvw.png)

經過一連串絞盡腦汁，寫了一堆亂七八糟的 CSS 之後，成品如下。

![](http://i.minus.com/iXoN5AU2JBOHU.png)

無論是倒影、中間的圓圈進度表都與 [CoverFlow] 非常相像，但這種樣式實在 <del>太麻煩了</del> 不便使用者操作，所以從 [Premium Pixels](http://www.premiumpixels.com/freebies/compact-music-player-psd/) 偷點子過來，稍微加油添醋一下，完成了播放器介面 Ver. 2。

![Ver.2 與 Ver.1 完全不像？這種事情不重要啦！](http://i.minus.com/imrTH5W7km1vj.png)

##核心

介面完成自爽一下之後，就得面對麻煩的 JavaScript 了，播放、暫停非常簡單，按鈕按下去執行鄉對應的動作即可，然而音量調整與進度條該如何處理呢？

雖然本次的重點是**消磨時間**，但再去造一個輪子實在他媽的太累了，於是 <del>聰明如我</del> 請到了 [jQuery UI]，Slider 功能壓縮後需要約 20KB 的空間，有點龐大不過方便就好。

時間的控制方式如下，單位為秒數，例如跳至第 100 秒的位置：

``` js
audio.currentTime = 100;
```

音量的控制方式如下，範圍為 0~1，例如將音量調整至一半大小：

``` js
audio.volume = 0.5;
```

`audio`可綁定`play`, `pause`, `ended`, `progress`, `canplay`, `timeupdate`等事件。`play`與`pause`如字面上意思，分別為播放、暫停後生效。

``` js
audio.addEventListener('play', function(){
	play.title = 'pause';
}, false);

audio.addEventListener('pause', function(){
	play.title = 'play';
}, false);
```

`ended`為結束後生效，當音樂結束後，可透過此事件讓時間歸零。

``` js
audio.addEventListener('ended', function(){
	this.currentTime = 0;
}, false);
```

當音樂檔案開始載入後，便會啟動`progress`事件，可透過此事件監測下載進度。Firefox 可能會發生問題，建議搭配`durationchange`事件使用。

``` js
audio.addEventListener('progress', function(){
	var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
	buffer.style.width = (100 / (this.duration || 1) * endVal) + '%';
}, false);
```

當音樂下載到一定程度後，`canplay`事件便會生效，一般會透過此事件初始化播放器。相同類型的事件還有很多，依照啟動順序分別為：`loadstart`, `durationchange`, `loadeddata`, `progress`, `canplay`, `canplaythrough`。

`timeupdate`會在音樂播放時不斷生效，可透過此事件更新時間。

``` js
audio.addEventListener('timeupdate', function(){
	progress.style.width = (this.currentTime / this.duration) * 100 + '%';
}, false);
```

##播放列表

一個播放器的基礎功能就此完成，能夠播放、暫停、調整音量、調整時間。但這顯然還不夠，播放列表對於播放器而言相當重要。*（大概啦）*

![不要吐槽為啥播放列表裡全是動漫歌，林北就是宅啦...](http://i.minus.com/inE9d4C1xPbYD.png)

與自己的邏輯奮戰大約一晚後，有播放列表、隨機播放、重複播放（單首、全部）功能的播放器於焉完成。只需要 214 行、約 6KB 的代碼*（未壓縮）*即可完成，應該能算是輕便簡易了。

##後記

播放列表的製作過程有點髒，中途還重構了幾次，所以直接看範例應該會比較快，若對於範例內的程式碼感到疑惑，可在下方留言。

範例內已設定了一些參數，可在`js/script.js`內更改。第 5 行的`continous`參數為連續播放，第6行的`autoplay`參數為自動播放，第7行的`playlist`陣列請自行設定，壓縮檔內**不會**附帶範例內的音樂檔案。`playlist`陣列的格式如下：

``` js
var playlist = [
	{
		title: 'Tell Your World',
		artist: 'livetune feat.初音ミク',
		album: 'Tell Your World',
		cover: 'cover/tell_your_world.jpg',
		mp3: 'music/tell_your_world.mp3',
		ogg: 'music/tell_your_world.ogg'
	}
];
```

`title`為標題，`artist`為演出者，`album`為專輯名稱，`cover`為專輯封面的路徑，`mp3`、`ogg`分別為音樂檔案的路徑，建議備妥兩種格式的檔案，<del>要不然 Firefox 和 Opera 不就只能去死了嗎？</del>

因為做到最後頭腦快爆炸了，懶得做 Flash fallback，<del>IE 請去死一死吧。</del>

[範例](http://zespia.tw/lab/coverart)｜[下載](http://zespia.tw/lab/coverart/example.zip)

##參考出處

- [jPlayer]
- [小試HTML 5 audio - 黑暗執行緒](http://blog.darkthread.net/post-2011-05-15-html5-audio.aspx)
- [Using HTML5 audio and video - MDN](https://developer.mozilla.org/en/Using_HTML5_audio_and_video)
- [HTML5 Audio and Video: What you Must Know | Nettuts+](http://net.tutsplus.com/tutorials/html-css-techniques/html5-audio-and-video-what-you-must-know/)
- [Free PSD: Compact Music Player | Premium Pixels](http://www.premiumpixels.com/freebies/compact-music-player-psd/)

[jPlayer]: http://jplayer.org/
[CoverFlow]: http://zh.wikipedia.org/wiki/Cover_Flow
[jQuery UI]: http://jqueryui.com/