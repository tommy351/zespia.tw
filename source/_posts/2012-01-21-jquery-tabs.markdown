---
layout: post
title: "如何利用 jQuery 製作頁籤？"
date: 2012-01-21 18:10
comments: true
tags: 
- JavaScript
---
![在文章中放入不相干的圖片好像已經成為定番？隨便啦](http://i.minus.com/i3hFGFugcShjF.jpg)

最近花了一週的時間，終於完成 Octopress 的佈景主題，並搬移舊站（zespia.twbbs.org）的文章及留言，發現自已以前的文章實在有夠中二，看得連自己都想揍螢幕，於是偷偷撤下了部分文章。

為了慶祝新站落成，便決定寫一篇超級簡易（大概啦）的 jQuery 頁籤製作教學，<del>懷著感恩的心看吧！</del>

<!-- more -->

**本文以 jQuery 1.7.1 為例。**

##基礎

###HTML

``` html
<ul id="tabs">
	<li class="enable">頁籤 1</li>
	<li>頁籤 2</li>
	<li>頁籤 3</li>
	<li>頁籤 4</li>
</ul>
<div id="contents">
	<div>頁籤 1 的內容</div>
	<div>頁籤 2 的內容</div>
	<div>頁籤 3 的內容</div>
	<div>頁籤 4 的內容</div>
</div>
```

以`ul#tabs`當作標籤，而`#contents`內則是頁籤內容。我盡可能簡化 HTML 中不必要的欄位，其他功能都將在 JS 中實現。

###CSS

``` css
#tabs li{
	background: #ddd;
	border: 1px solid #ccc;
	border-bottom: none;
	display: inline-block;
	margin-right: 5px;
	padding: 5px 10px;
	color: #999;
	cursor: pointer;
}
#tabs li:hover{
	color: #666;
}
#tabs li.enable{
	border-bottom: 1px solid #ddd;
	margin-bottom: -1px;
	color: #333;
}
#contents{
	background: #ddd;
	border: 1px solid #ccc;
	box-shadow: 0 0 16px #ccc;
}
#contents > div{
	display: none;
	text-align: justify;
	padding: 10px 15px;
}
#contents > div:first-of-type{
	display: block;
}
```

###JS

``` js
(function($){
	// 用each遍歷頁籤
	$('#tabs li').each(function(i){
		var _i = i;

		// 綁定click事件到頁籤上，若要改為滑鼠移入切換頁籤的話，將click改為mouseenter
		$(this).click(function(){
			// 移除其他頁籤的class，並將class新增至所選頁籤
			$(this).parent().children().removeClass('enable').eq(_i).addClass('enable');
			// 隱藏其他頁籤的內容，並顯示所選頁籤的內容
			$('#contents').children('div').hide().eq(_i).show();
		});
	});
})(jQuery);
```

首先透過`each`遍歷所有頁籤（`#tabs li`），並在所有頁籤上綁定事件。

當事件觸發時，移除其它頁籤的`class`，隱藏其他頁籤的內容，並將`class`新增至所選頁籤，顯示所選頁籤的內容。

建議把JS放在頁尾（footer），可使頁面載入完成後才載入 JS，避免出現錯誤。

[範例](http://zespia.tw/demo/jquery-tabs/basic/)｜
[下載](http://zespia.tw/demo/jquery-tabs/basic/example.zip)

##進階

只有單純的顯示隱藏似乎太無趣了？那就加點動畫吧！只要稍微變更基礎結構，就能讓頁籤看起來更加華麗！

###HTML

``` html
<ul id="tabs">
	<li class="enable">頁籤 1</li>
	<li>頁籤 2</li>
	<li>頁籤 3</li>
	<li>頁籤 4</li>
</ul>
<div id="container">
	<div id="contents">
		<div>頁籤 1 的內容</div>
		<div>頁籤 2 的內容</div>
		<div>頁籤 3 的內容</div>
		<div>頁籤 4 的內容</div>
	</div>
</div>
```

進階篇的 HTML 結構與基礎篇只有一點小差別，僅在原本的`#contents`的區塊外又包了一層`#container`。

###CSS

``` css
#tabs{
	position: relative;
	z-index: 1;
}
#tabs li{
	background: #ddd;
	border: 1px solid #ccc;
	border-bottom: none;
	display: inline-block;
	margin-right: 5px;
	padding: 5px 10px;
	color: #999;
	cursor: pointer;
}
#tabs li:hover{
	color: #666;
}
#tabs li.enable{
	border-bottom: 1px solid #ddd;
	margin-bottom: -1px;
	color: #333;
}
#container{
	background: #ddd;
	border: 1px solid #ccc;
	box-shadow: 0 0 16px #ccc;
	width: 500px;
	position: relative;
	overflow: hidden;
}
#contents{
	position: absolute;
	left: 0;
	width: 2000px; /* 內容寬度 * 頁籤數 */
}
#contents > div{
	padding: 10px 15px;
	text-align: justify;
	float: left;
	width: 470px; /* 內容寬度 - 左右padding */
}
```

`#contents`改為`absolute`（絕對定位），並設定寬度為「內容寬度 × 頁籤數量」。`#contents`內的`div`別忘了加上`float: left;`，如此一來頁籤內容才會排成一橫列，將寬度設為「內容寬度 － 左右 padding」。

進階篇若少了 JS 的輔助，則無法正常顯示，除非事先設定`#container`的高度。

###JS

``` js
(function($){
	var trigger = false;

	// 使內容高度等於第一頁籤內容高度 + 上下padding
	$('#container').css('height', $('#contents div').eq(0).height() + 20);

	// 用each遍歷頁籤
	var tabs = $('#tabs li').each(function(i){
		var _i = i;

		// 為每個頁籤新增tabid屬性
		// 綁定click事件到頁籤上，若要改為滑鼠移入切換頁籤的話，將click改為mouseenter
		$(this).attr('tabid', i).click(function(){
			// 當trigger為false時才作用，避免重複點按造成瀏覽器crash
			if (trigger == false){
				// 取得目前的tabid，以計算動畫的間距值（內容寬度 * 頁籤間距）
				var now = parseInt($(this).parent().children('.enable').attr('tabid')),
					gap = 500 * (_i - now);
					trigger = true;

				// 移除其他頁籤的class，並將class新增至目前頁籤
				$(this).parent().children().removeClass('enable').eq(_i).addClass('enable');
				// 使內容移動一定間距
				$('#contents').animate({left: '-='+gap}, 500);
				// 使內容高度符合所選頁籤內容的高度（所選頁籤內容高度 + 上下padding），動畫全部結束後，使trigger值返回false
				$('#container').animate({height: $('#contents').children().eq(_i).height() + 20}, 500, function(){
					trigger = false;
				});
			}
		});
	});
})(jQuery);
```

原理與基礎篇有些差別，必須在頁籤上新增`tabid`屬性，不過透過 JS 代勞即可。

首先使`#container`的高度符合第一頁籤的高度，接著同樣遍歷所有頁籤（`#tabs li`），在所有頁籤上新增`tabid`屬性，順便綁定事件。

當事件觸發時，確認使用者是否正在操作頁籤（`trigger == false`），若頁籤操作速度過於頻繁，可能會使得動畫錯亂。接著計算動畫間距，使內容依照間距左右移動，並使其高度符合所選頁籤內容的高度。

當動畫全部結束後，返回`trigger = false`，讓使用者能夠再度操作頁籤。

如此一來，平凡樸素的頁籤便多了左右滑動的動畫，如果想要更加華麗的話，可以使用[jQuery Easing Plugin](http://gsgd.co.uk/sandbox/jquery/easing/)。

[範例](http://zespia.tw/demo/jquery-tabs/advanced/)｜
[下載](http://zespia.tw/demo/jquery-tabs/advanced/example.zip)

##後記

![](http://i.minus.com/ibiEDX70iCDveF.PNG)

最後的成果如上圖，當然細部的樣式、動畫請自行設定。希望這篇文章簡單易懂（？）的文章能夠幫助到你。最近預計再寫一篇 CSS Only 的多級選單教學，請拭目以待吧！