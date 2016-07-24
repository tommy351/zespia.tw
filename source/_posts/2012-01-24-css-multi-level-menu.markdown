---
layout: post
title: "如何利用 CSS 製作多級選單？"
date: 2012-01-24
comments: true
tags: 
- CSS
---
![一般常見的選單](http://i.minus.com/ibx37Gknqf5wtK.PNG)

選單常見於我們的生活當中，通常用於整理一系列的指令，簡化複雜的程序，使介面看起來更加友善。當應用程式愈複雜，功能愈多時，通常會利用多級選單將類似的指令組織成一個子選單。

一般網頁常見到二級選單，利用 CSS 即可達成，有些會透過 JavaScript 增加更多效果，例如動畫、延遲等。多級選單一般常使用 JavaScript 達成，不過透過 CSS 也能做出簡單的多級選單。

<!-- more -->

###HTML

``` html
<nav>
	<ul>
		<li><a href="">選單 1</a></li>
		<li>
			<a href="">選單 2</a>
			<ul>
				<li>
					<a href="">選單 2-1</a>
					<ul>
						<li><a href="">選單 2-1-1</a></li>
						<li><a href="">選單 2-1-2</a></li>
					</ul>
				</li>
				<li><a href="">選單 2-2</a></li>
				<li><a href="">選單 2-3</a></li>
			</ul>
		</li>
		<li><a href="">選單 3</a></li>
		<li><a href="">選單 4</a></li>
	</ul>
</nav>
```

選單的 HTML 如上，所有的選單物件都是可點選的連結，理論上無限層級。

###CSS

``` css
ul li {
  position: relative; /* 使子選單依照母選單的座標顯示 */
}
/* 設定母選單的連結樣式 */
ul li a{
	background: url(detail.png);
}
/* 當母選單下沒有子選單時，也就是說只有一個連結時，隱藏detail.png */
ul li a:only-child{
	background: none;
}
ul li:hover > ul {
  display: block; /* 滑鼠滑入母選單後，顯示子選單 */
}
/* 二級選單顯示於一級選單的正下方 */
ul ul {
  position: absolute;
  top: 100%;
  list-style: none;
  display: none;
}
/* 三級選單則顯示於二級選單的右方 */
ul ul ul {
  position: absolute;
  left: 100%;
  top: 0;
}
```

這樣就完成了所有步驟，不需要繁複的 JavaScript，是不是很簡單呢？

[範例](http://zespia.tw/demo/css-multi-level-menu/)｜[下載](http://zespia.tw/demo/css-multi-level-menu/example.zip)

##後記

![](http://i.minus.com/ibbaIEKvPdl6Pc.jpg)

寫到最後反而發現詞窮，看來我真不是寫文章的料。總而言之，這是「大概很簡單」教學系列的第二彈，感謝你的收看！