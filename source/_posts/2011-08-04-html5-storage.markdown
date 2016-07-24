---
layout: post
title: "HTML5 Storage 的使用彙整"
date: 2011-08-04 18:01
comments: true
tags: 
- HTML5
---
![找不到相關的圖，各位就把小惡魔胸前的脂肪塊當做Storage吧！（id=21000433）](http://i.minus.com/ich1TucSOe08P.jpg)

當初寫 Google+ Hover Zoom 這腳本時，壓根沒想過可以用 Greasemonkey 內建的參數來儲存資料，於是就選用 HTML5 的 Storage 功能來儲存資料，然而此功能僅能儲存字串（String），讓我花了好些時間上網找資料才能掌握此功能的使用方式。

<!-- more -->

Storage 的功能基本上與 cookie 大致相同，然而儲存空間比 cookie 大多了，cookie 僅有 4KB 的空間，Storage卻有5MB的空間，讓開發者能夠好好善用。此功能的使用方式非常簡單，分為：Local Storage 與 Session Storage，顧名思義，兩者都是將資料儲存於用戶端的功能，然而前者能儲存的時間較長，直到使用者清除快取前都不會被刪除，而後者在使用者關閉分頁後資料就會被刪除；兩者的使用方式完全相同，以下皆以 Local Storage 作為示範。

下文皆使用 jQuery 1.7.1。<del>（因為我只會 jQuery）</del>

##基礎
###設定資料

以下三種方式擇一即可，下文亦同。

``` js
localStorage['test'] = testValue;
localStorage.setItem('test', testValue);
localStorage.test = testValue;
```
###取得資料

``` js
localStorage['test'];
localStorage.getItem('test');
localStorage.test;
```

###刪除資料
``` js
localStorage.removeItem('test');
```

###資料全部清除
``` js
localStorage.clear();
```

##勾選框（checkbox）
###設定資料

由於 Storage 僅支援字串，必須使用`toString()`函數，將 Boolean 值轉為字串才可儲存。

``` js
localStorage['test'] = $('#test').prop('checked').toString();

// 若jQuery版本低於1.6
localStorage['test'] = $('#test').attr('checked').toString();
```

###取得資料

使用`===`判斷資料。

``` js
if ( localStorage['test'] === 'true' ) {
    // Do something
}
```
##下拉式選單（select）
###設定資料

取得選單中`:selected`的值，並儲存即可。

``` js
localStorage['test'] = $('#test').find(':selected').val();
```

##陣列（array）
###設定資料

陣列大概是讓我最頭痛的部份，同前文所述，Storage 僅支援字串，所以必須先以特殊的分隔符號來隔開每個元素。*（如|, $, ;等符號，隨你喜歡）*

如果你在下面的陣列中看到德文，那只是我突然中二病發作而已，<del>如果你看得懂的話代表你也是個廚二</del>。

``` js
// 一維陣列
var storage = ['one', 'two', 'three', 'four'];
localStorage['test'] = storage.join('|||');

// 二維陣列（多維陣列亦同）
var storage = {['one', 'eins'], ['two', 'zwei'], ['three', 'drew'], ['four', 'vier']};
for (var i=0; i<storage.length; i++){
	storage[i] = storage[i].join(';');
}
localStorage['test'] = storage.join('|||');
```

###取得資料

利用`split`函數分割字串。

``` js
// 一維陣列
var storage = localStorage['test'].split('|||');
for (var i=0; i<storage.length; i++){
	// do something
}

// 二維陣列（多維陣列亦同）
var storage = localStorage['test'].split('|||');
for (var i=0; i<storage.length; i++){
	var item = storage[i].split(';');
	for (var j=0; j<item.length; j++){
		// do something
	}
}
```

##後記

最近因為課業繁忙，網誌都放著生灰超過一個月了，於是心血來潮將最近寫腳本的心得寫成文章，可能會有錯誤，請多見諒。