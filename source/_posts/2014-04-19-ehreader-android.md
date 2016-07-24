title: E-Hentai 閱讀器 for Android
date: 2014-04-19 18:14:10
tags:
- Android
- E-Hentai
---
{% asset_img iXV0rlAP1H4xI.jpg %}

想必許多紳士都是 [E-Hentai] 的常客，我這邊就不細談這網站的內容了，這篇文章是久違的技術文，主要是來說明 [E-Hentai 閱讀器] 的 ~~發牢騷~~ 製作過程。

<!-- more -->

## 編輯器

{% asset_img 140420-0004.png %}

Android 開發實在不是件簡單的事，一開始開發時使用 [Eclipse]，恰好時逢 Android SDK 推出，結果一更新 SDK，林北的專案就爆炸惹，我也不知道到底該怎麼救，於是一氣之下怒換到 [Android Studio]，[Android Studio] 基於 [IntelliJ IDEA]，速度比 [Eclipse] 快多了，介面也比 [Eclipse] 美觀許多，而且預設採用 [Gradle] 做為建置工具。

{% asset_img 140420-0002.png 使用 Genymotion 運行 Android 4.4.2 %}

之前就聽說過 iOS 開發友善許多，實際體驗後深深了解此言絕非虛假，Android 模擬器的效能實在不是一般的慢，光開機就需要數分鐘，而且一切的操作都比實機慢上許多倍，根本無法使用，根本逼人買一台 Nexus，後來改用 [Genymotion]，才終於找回正常模擬器該有的速度，iOS 的開發環境就好多了，從 Build 到 Deploy 只要半分鐘即可在模擬器上操作。

一般來說，開發專案絕對會用到很多 Library，因此需要有個 Dependency Manager 來管理套件之間的相依性問題，Java 因為歷史悠久，因此有許多選擇，使用 [Eclipse] 時，我本來選用 [Maven]，但是它使用 XML 檔實在令人討厭，舉例來說：

``` xml
<dependencies>
    <dependency>
        <groupId>com.jakewharton</groupId>
        <artifactId>butterknife</artifactId>
        <version>4.0.1</version>
    </dependency>
</dependencies>
```

倒也不是討厭 XML 本身，我認為 XML 是一個規範良好的標記語言，但在上面的程式碼中，僅僅要引入一個套件就得寫這麼長的代碼也未免太囉嗦了，而 [Gradle] 採用 [Groovy]，讓一切變得更簡單：

``` groovy
dependencies {
    compile 'com.jakewharton:butterknife:4.0.1'
}
```

如上，只要寫一行代碼就能引入一個套件，再也不用寫一長串的 XML，而且 Gradle 也能支援 [Maven Central]，因此不用擔心沒有 Library 能用。

## E-Hentai API

一開始我根本不知道有 API 的存在，所以使用 [jsoup] 來爬網站，[jsoup] 能在 Java 上用類似 [jQuery] 的語法來遍歷資料，但是效能實在不佳。我曾有想過用 Node.js 做為後端伺服器，但為了避免流量過大被 E-Hentai 封鎖，放棄了這個想法。

之後某天，在瀏覽時偶然開啟 Firebug，發現到瀏覽圖片時會使用 Ajax 與伺服器取得資料，才了解到原來有 [E-Hentai API]。雖然有 API 是好事，但這 API 實在寫得太爛了，舉例來說，若要取得一個相簿的資料，我們必須先了解 E-Hentai 的網址結構：

``` plain
http://g.e-hentai.org/g/{gallery_id}/{gallery_token}/
```

`gallery_id` 代表 Gallery ID，是一個唯一的有序整數，而 `gallery_token` 是一個隨機的字串。若要取得相簿資料，這兩個欄位是必須的。但是在一開始，根本無從得知 `gallery_token`，只能從首頁中把網址抓出來。

接下來是圖片資料，E-Hentai API 並沒有提供「相片列表」的 API，因此，我們又必須利用從相簿頁面中把圖片網址抓出來，而圖片的網址結構如下：

``` plain
http://g.e-hentai.org/s/{page_token}/{gallery_id}-{pagenumber}
```

`page_token` 代表相片的 token，推測是原始檔案 SHA1 checksum 的前 10 碼，`gallery_id` 是相簿 ID，`pagenumber` 則是頁數。**注意**，`page_token` **不等於** `gallery_token`，使得取得相片資料變得更加困難。

在 [wiki][E-Hentai API] 中，並沒有提到如何透過 API 取得圖片網址，我們無法單從 `page_token` 推測出圖片網址，只能從圖片頁面中找到蛛絲馬跡，後來我發現到圖片頁面中會使用如下指令取得資料：

``` json
{
  "method": "showpage",
  "gid": 618395,
  "page": 1,
  "imgkey": "1463dfbc16",
  "showkey": "387132-43f9269494"
}
```

`gid` 等於 `gallery_id`，`page` 等於 `pagenumber`，`imgkey` 等於 `page_token`，但是 `showkey` 呢？`showkey` 是每 24 小時就會隨機變換的 token，同樣藏在圖片頁面中，只能自己爬資料。

綜上所述，這個 API 真的么壽難用，有很多資料是無法從 API 取得的，只能自己爬資料，令我覺得 Android 開發與之相比簡單多了，各位如果想知道更多關於 [E-Hentai API] 的資料的話，可參考我做的 [整理](https://github.com/tommy351/ehreader-android/wiki/E-Hentai-JSON-API)。

## 介面

Android 雖然提供了所見即所得的介面編輯器，但若要進行進一步的調整還是得自己編輯 XML 檔，更不用說預覽畫面常與實際畫面不符，根本所見非所得。

網頁開發與 Android 的介面設計有很多相似之處，但是有些介面元素在 CSS 上很容易實現，在 Android 上卻麻煩許多，例如：圓角、陰影等，在 CSS 中分別只要透過 `border-radius`, `box-shadow` 即可達成，在 Android 上卻麻煩許多。

## 結語

{% asset_img iKXI5aMhSXYFB.png %}

其實這專案從去年 5 月就已經開始計畫了，不過因為 ~~中途一直碰壁很不爽~~ 時間不夠，所以直到今年，才用了春節兩週的時間將舊有程式碼完全翻新，開發出了 0.1.0 版。雖然現在已經 0.4.0 版了，還是很多 bug，每天仍有 400 多名活躍使用者實在太感謝了。

如果各位在使用時發現任何問題或建議，請到 [GitHub](https://github.com/tommy351/ehreader-android/issues) 發表，也歡迎各位加入開發讓這個程式變得更加好用。

- [GitHub][E-Hentai 閱讀器]

[E-Hentai]: http://e-hentai.org/
[E-Hentai 閱讀器]: https://github.com/tommy351/ehreader-android
[Hexo]: http://hexo.io/
[Eclipse]: https://www.eclipse.org/
[Android Studio]: http://developer.android.com/sdk/installing/studio.html
[IntelliJ IDEA]: http://www.jetbrains.com/idea/
[Gradle]: http://www.gradle.org/
[Genymotion]: http://www.genymotion.com/
[Maven]: http://maven.apache.org/
[Groovy]: http://groovy.codehaus.org/
[Maven Central]: http://search.maven.org/
[jsoup]: http://jsoup.org/
[jQuery]: http://jquery.com/
[E-Hentai API]: http://ehwiki.org/wiki/API