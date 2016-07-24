---
layout: post
title: "Node.js 初試 ─ Nyanko"
date: 2012-07-14 0:14
comments: true
tags: 
- Node.js
- JavaScript
---

![](http://i.minus.com/iKst8nFEGcU8A.png)

數個月前，接到了來自 [卡梅爾 Anime] 的委託，請我重新設計一個 [WordPress] 主題，因為我當時正忙著準備備審資料，因此而暫時擱置了一段時間。

又過了一個月，我加入了畢籌會（畢業典禮籌劃會），忙著 <del>和妹子聊天</del> 製作畢業影片，而完全忽略了這回事。

直到畢業後，我突然想起這件事，便決定開始著手進行；然而因為去年提交 [WordPress] 主題一直被退件令我一直懷恨在心，我毅然決定捨棄 [WordPress]，自己從頭打造一個類似於 [WordPress] 的 CMS 系統。

<!-- more -->

##序章

![](http://i.minus.com/iEfVZ8aIjqOKG.png)

在進入本文之前，先說明一下何謂 [Node.js] 吧：

[Node.js] 是一個 JavaScript 函式庫，使用了 [V8 引擎] 讓 JavaScript 能在伺服器上執行，其事件驅動、非阻塞式 I/O 的形式使 [Node.js] 能夠高效運作，模組化的規格使其便於開發。（有錯請鞭）

總而言之，**[Node.js] 很好用**。

##安裝

[Node.js] 的安裝非常簡單，只要安裝 [nvm] 及 [npm] 即可。（以下以 Mac 為例）

[nvm] 就是類似於 [rvm] 的版本管理工具，可隨意安裝、替換不同的 [Node.js] 版本。

```
$ git clone git://github.com/creationix/nvm.git ~/nvm
```

安裝完後必須在 `.bash_profile` 加入以下內容才可直接使用。

```
. ~/.nvm/nvm.sh
```

而 [npm] 則是類似於 [gem] 的模組管理工具，只要安裝 [Node.js] 就會附贈，不需要另外安裝。

##模組

[Node.js] 雖然還是個剛起步的應用，不過已有很多的現成模組可供使用。以下是我用到的模組：

- [Express]：處理瀏覽器請求，用它做出 [REST] 架構簡直小菜一碟。
- [Connect]：[Express] 的基礎，[Express] 的許多功能都是從 [Connect] 借來的，不過我只是要用它的 Gzip middleware 而已。
- [EJS]：模版引擎之一，[Node.js] 預設使用 [Jade]，但是 [Jade] 實在簡潔到讓人看不懂，所以決定使用 [EJS]。
- [Stylus]：本來想繼續使用 [Sass]，後來發現 [Stylus] 的語法更加簡潔，而且與 [Express] 的配合度極加！
- [Nib]：[Stylus] 之於 [Nib] 猶如 [Sass] 之於 [Compass]，[Nib] 內建許多方便的 CSS3 工具。
- [Mongoskin]：使用簡易的 [MongoDB] 工具，大部分的函數都和原本的 [MongoDB] 很像，但是可以省掉開啟和關閉連結這些麻煩的動作。原本要用 [Mongoose]，但是發現它還得先設定 Scheme，這實在有夠麻煩，而且完全與 [MongoDB] 的設計相違背，所以果斷放棄。
- [Marked]：Markdown 解析器。
- [Bcrypt]：聽說 [Bcrypt] 是目前最安全的密碼儲存方式。
- [Nodemailer]：能夠輕鬆與 Gmail 整合的寄信模組。
- [Async]：[Node.js] 中有很多工作都是異步進行，因此造成嵌套嵌不完的窘境，我程式寫了一週才發現有這麼好用的模組 orz。
- [Moment]：日期解析模組。
- [UglifyJS]：JavaScript 壓縮 / 美化模組，效能和 [Google Closure Compiler] 有得拼。
- [Socket.io]：超讚的 WebSocket 模組，瀏覽器支援度超讚！
- [connect-mongo]：本來 Session 我都儲存在記憶體，但這樣似乎不適合 production 環境，所以改把 Session 儲存在 [MongoDB]。

另外附贈超好用除錯工具：

- [node-dev]：偵測檔案更改，自動重啟伺服器。

##存放空間

基本上寫程式還是和之前一樣，都是 SAN 值不斷乘著雲霄飛車高低起伏的過程，隨著 Bug 愈來愈多，愈來愈厭惡過去的自己怎麼笨到會犯這種智障級的錯誤。

**不過這些都不是重點。**

網站寫好了重點就是要有地方存放。

PHP 遍地都有等著你蹂躪的免費空間。

但是 Node 能用的就只有這些啊！<https://github.com/joyent/node/wiki/Node-Hosting>

- [Nodester]：雖然免費但是一直 deploy 失敗，沒辦法安裝 [bcrypt]。
- [NAE]：速度好慢，而且很常掛點。
- [Cloud Foundry]：沒辦法安裝 [bcrypt]。
- [DotCloud]：不知道為啥總是 deploy 失敗。
- [Nodejitsu]：只要一行 `jitsu deploy` 就能 deploy 了，但是下個月就要收費了哭哭。
- [Heroku]：雖然沒辦法玩 WebSocket（30 秒連線限制），但是最穩定。

身為窮學生的我只能選慢吞吞的 [Heroku] 哭哭喔！

> 截稿前發現了 [AppFog]，是一個建構於 [Cloud Foundry] 的服務，介面很漂亮，不過還沒試用。

相較於 Node 而言，MongoDB 就不用煩惱了，目前我所知有兩個免費的服務。

- [MongoHQ]：免費 16 MB
- [MongoLab]：免費 240 MB

明眼人都知道要選 [MongoLab] 啊啊啊啊啊！！！！<del>就像胸部一樣，大一點的總是比較好啊啊啊啊啊！！！！</del>

##外觀

因為代碼很髒而且 Bug 一堆，所以就不在這裡獻醜了。

![](http://i.minus.com/icykBz9L04Ydf.png)

後台很普通，很明顯就是抄襲 [WordPress] 的沒特色主題。

![](http://i.minus.com/iiCgTOcyLp2Km.png)

前台本來想做成這樣，但圖片處理實在太麻煩，這種也許比較適合平板使用？

![](http://i.minus.com/iCuLiRAi4Birx.png)

因此只能改成這個樣子了，可以很明顯的看出，就跟 [Google+] 一樣，頁面主體很明顯的往左偏，右邊一大片空白什麼也沒有，<del>以後可以拿來放廣告</del>。

![](http://i.minus.com/illxd31CdxXIq.png)

不過這也是有原因的，搜尋列和聊天室都會從左邊滑出。

##未來

目前 0.0.7 版已經完成，不過尚未 deploy 至 [Heroku]，主要是強化快取的部分，事先儲存已渲染過的網頁，就不用在每次瀏覽時都讀取資料庫。

等到 Bug 都除完之後，大概就會發佈原始碼了，我能看到那一天的到來嗎......？

##後記

![對不起，圖片下載不完全，想看紗羽ㄋㄟㄋㄟ的請自己找吧。(id=28562767)](http://i.minus.com/ibqU7BQBnIPo5u.png)

因為最近一個月都在忙這東西，所以網誌都放到生菇了，之後還會在寫一篇愛夏的文章，敬請期待！

[Nyanko] 目前正在封測中，也許會有很多 Bug，如果找到 Bug 的話麻煩透過左側工具列上的「意見反饋」向我回報。

[卡梅爾 Anime]: http://caramel623.k2-ani.com/
[WordPress]: http://wordpress.org/
[Node.js]: http://nodejs.org/
[V8 引擎]: http://zh.wikipedia.org/wiki/V8_%28JavaScript%E5%BC%95%E6%93%8E%29
[nvm]: https://github.com/creationix/nvm/
[npm]: http://npmjs.org/
[rvm]: https://rvm.io/
[gem]: http://rubygems.org/
[Express]: http://expressjs.com/
[REST]: http://zh.wikipedia.org/wiki/REST
[Connect]: http://www.senchalabs.org/connect/
[EJS]: https://github.com/visionmedia/ejs
[Jade]: http://jade-lang.com/
[Stylus]: https://github.com/LearnBoost/stylus
[Sass]: http://sass-lang.com/
[Nib]: https://github.com/visionmedia/nib
[Compass]: http://compass-style.org/
[Mongoskin]: https://github.com/kissjs/node-mongoskin
[MongoDB]: http://www.mongodb.org/
[Mongoose]: https://github.com/LearnBoost/mongoose
[Marked]: https://github.com/chjj/marked/
[Bcrypt]: https://github.com/ncb000gt/node.bcrypt.js/
[Nodemailer]: https://github.com/andris9/Nodemailer/
[Async]: https://github.com/caolan/async/
[Moment]: http://momentjs.com/
[UglifyJS]: https://github.com/mishoo/UglifyJS
[Google Closure Compiler]: https://developers.google.com/closure/compiler/
[Socket.io]: http://socket.io/
[connect-mongo]: https://github.com/kcbanner/connect-mongo/
[node-dev]: https://github.com/fgnass/node-dev
[Nodester]: http://nodester.com/
[NAE]: http://cnodejs.net/
[Cloud Foundry]: http://www.cloudfoundry.com/
[DotCloud]: http://www.dotcloud.com/
[Nodejitsu]: http://nodejitsu.com/
[Heroku]: http://heroku.com/
[AppFog]: http://www.appfog.com/
[MongoHQ]: https://mongohq.com/
[MongoLab]: https://mongolab.com/
[Google+]: https://plus.google.com/
[Nyanko]: http://nyanko.herokuapp.com/