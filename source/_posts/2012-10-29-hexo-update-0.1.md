---
layout: post
title: Hexo 更新至 0.1
date: 2012-10-29 00:25:37
comments: true
tags:
- Node.js
- JavaScript
- Hexo
---

![らぐほのえりか - モリサマー (id=31068919)](http://i.minus.com/ibn0sBufi4xK4S.jpg)

**森夏的ㄋㄟㄋㄟ讚！**<del>有沒有最近作者都用圖片來騙人的八卦</del>

Hexo 發佈大約兩週之後，你可能會懷疑 Hexo 怎麼都沒有任何新消息，說好要補完的文件也毫無動靜。

其實是因為這兩週我都在製作 0.1 版的更新，主要是為了修改之前的 bug，並增加擴充性。

<!-- more -->

## 0.0 → 0.1

我盡量不讓使用方式的變更幅度太大，不過為了擴充性，還是得稍微改變一下，那麼，該如何從 0.0.6 升級到 0.1 呢？

1. 透過 [npm] 將 Hexo 升級至 0.1。

		npm update -g
  
2. 升級內建的 [Light] 主題。

		cd themes/light
		git pull
  
3. 更新 `_config.yml`，以下是0.1版的預設配置，請依照個人需求自行調整。

4. 修改 `package.json`。

5. 若你之前有設定過佈署的話，請調整 `_config.yml` 中 `deploy` 的設定。

**以上步驟完成後，即可使用 0.1 的 Hexo 了！**

## 新功能

0.1 當然不是白升級的，我加入了一些 <del>無關緊要的</del> 新功能。

### Heroku 佈署

除了 [GitHub] 之外，0.1 新增了 [Heroku] 的支援，雖然 [Heroku] 的使用本來就非常簡易，但身為一名 <del>懶人</del>，能夠輕鬆設定當然是再好也不過了。

我將佈署寫成了附加元件（Extension）的形式，因此日後所有的佈署方式應該都只需要三個步驟便能完成設定。

1. 設定

  修改 `_config.yml` 中 `deploy` 的設定，`repository` 填入 Heroku repo 的連結。

2. 建立

  執行以下指令。

		hexo setup_deploy

  Hexo 便會在資料夾中建立 `Procfile` 和 `app.js` 兩個檔案。Hexo 使用 [Connect] 處理靜態檔案。

3. 佈署

  執行以下指令。

		hexo deploy

  然後就可以去泡杯咖啡等佈署完成了！

### 附加元件

0.1 新增了更多種的附加元件（Extension），所有能夠分離的模組幾乎都成為了附加元件，目前總共有 7 種附加元件，分別是：

- **Generator**：負責建立靜態檔案
- **Renderer**：負責處理模版檔案
- **Helper**：模版檔案內的函數
- **Deployer**：負責佈署靜態檔案
- **Processor**：負責處理原始檔案
- **Tag**：文章檔案內的函數
- **Console**：命令列介面（CLI）

Hexo 使用以上的附加元件來建立靜態檔案，而執行步驟大致上為：

Processor (with Tag) → Renderer (with Helper) → Generator

Hexo 已事先內建了一些必須的附加元件：

- **Generator**：負責建立靜態檔案
  - home：首頁
  - post：文章
  - page：分頁
  - category：分類彙整
  - tag：標籤彙整
  - archive：文章彙整（所有文章、每年文章、每月文章）
- **Renderer**：負責處理模版檔案
  - ejs：處理 [EJS] 檔案（.ejs）
  - markdown：處理 [Markdown] 檔案（.md, .markdown, .mkd, .mkdn, .mdwn, .mdtxt, .mdtext）
  - stylus：處理 [Stylus] 檔案，內含 [nib]（.styl, .stylus）
  - swig：處理 [Swig] 檔案（.swig）
  - yaml：處理 [Yaml] 檔案（.yml, .yaml）
- **Helper**：模版檔案內的函數
  - css：快速加入 CSS 檔案
  - js：快速加入 JS 檔案
  - escape：過濾 `<`, `>`, `'`, `"` 等符號
  - trim：過濾空白
  - strip：過濾 HTML 標籤
  - partial：載入其他模版檔案（使用方式與 [express-partials] 相同）
  - titlecase：將標題轉為合適的大小寫
  - tagcloud：標籤雲
- **Deployer**：負責佈署靜態檔案
  - github
  - heroku
- **Processor**：負責處理原始檔案
  - clear：清理上次建立的靜態檔案（清理 `public` 資料夾）
  - load：載入原始檔案
  - analyze：分析原始檔案
  - theme：安裝主題
- **Tag**：文章檔案內的函數（使用方式都和 [Octopress] 差不多）
  - blockquote：插入 Block quote。
  - code：插入程式碼。
  - gist：插入 [Gist] 程式碼。
  - jsfiddle：插入 [jsFiddle] 程式碼。
  - pullquote：插入 [Pull quote](http://en.wikipedia.org/wiki/Pull_quote)
  - youtube：插入 [Youtube] 影片
  - vimeo：插入 [Vimeo] 影片 
- **Console**：命令列介面（CLI）
  - init：初始化
  - config：顯示 `_config.yml` 的內容
  - generate：建立靜態檔案
  - server：開啟伺服器
  - deploy：佈署
  - new：建立新的文章

有些附加元件因為需要另外安裝模組，所以沒有放進主程式內：

- [hexo-generator-feed]：建立 RSS Feed
- [hexo-generator-sitemap]：建立 Sitemap
- [hexo-renderer-coffeescript]：處理 [CoffeeScript] 檔案（.coffee）
- [hexo-renderer-haml]：處理 [Haml] 檔案（.haml）
- [hexo-renderer-jade]：處理 [Jade] 檔案（.jade）
- [hexo-renderer-less]：處理 [Less] 檔案（.less）

使用 `npm install <plugin>` 安裝完畢之後，在 `_config.yml` 的 `plugins` 新增外掛名稱即可使用。

附加元件的寫法可以參照 [原始碼](https://github.com/tommy351/hexo/tree/master/lib)。

## 小改變

### 伺服器新增記錄功能

Hexo 利用 [Connect] 內建的 [logger](http://www.senchalabs.org/connect/logger.html) 功能來顯示記錄，使用方式非常簡單，修改 `_config.yml` 即可開啟。

``` yaml
logger: true
logger_format:
```

記錄的格式 `logger_format` 可參考 Connect 的 [文件](http://www.senchalabs.org/connect/logger.html) 自行修改。

### i18n

雖然相關的程式碼已經寫好了，不過還沒有寫出「載入語言檔」的功能，目前僅能套用於 [Moment.js]，也就是 Hexo 用來解析、顯示時間的模組上。修改 `_config.yml` 中的 `language` 即可使用此功能（請使用 [IETF 格式]，例如正體中文即為 `zh-TW`）。

## 改進

Hexo 發佈後，立刻就有很多評論指出我沒有發現到的 Bug，非常感謝各位 <del>白老鼠</del> 大大的支持，0.1 修復了以下的問題。

- 無文章時無法建立檔案
- 有時執行 `hexo generate` 會莫名其妙中斷的情況
- 以字串當作文章標籤會導致誤判的問題
- 在 Windows 環境下，路徑的分隔字元從 `/` 改為 `\`
- 以及一些修到一半忘記了的 Bug...

如果還有任何問題的話，歡迎在 GitHub 上開 [issue](https://github.com/tommy351/hexo/issues) 或提交 [pull request](https://github.com/tommy351/hexo/pulls)。

## 結論

0.1 似乎僅完成了上篇文章中開發目標的其中三項，看來未來仍有一段路要走。我最近發現，Render 似乎占了 Generate 很大一部分的時間，如果把模版改為 [Swig] 不知道會不會好些。

[npm]: https://npmjs.org/
[Light]: https://github.com/tommy351/hexo-theme-light
[GitHub]: https://github.com
[Heroku]: http://www.heroku.com/
[Connect]: http://www.senchalabs.org/connect/
[EJS]: https://github.com/visionmedia/ejs
[Markdown]: http://daringfireball.net/projects/markdown/
[Stylus]: http://learnboost.github.com/stylus/
[nib]: http://visionmedia.github.com/nib/
[Swig]: http://paularmstrong.github.com/swig/
[Yaml]: http://www.yaml.org/
[express-partials]: https://github.com/publicclass/express-partials
[Octopress]: http://octopress.org
[Gist]: https://gist.github.com/
[jsFiddle]: http://jsfiddle.net/
[Youtube]: https://www.youtube.com/
[Vimeo]: http://vimeo.com/
[hexo-generator-feed]: https://github.com/tommy351/hexo-plugins/tree/master/generator/feed
[hexo-generator-sitemap]: https://github.com/tommy351/hexo-plugins/tree/master/generator/sitemap
[CoffeeScript]: http://coffeescript.org/
[Haml]: http://haml.info/
[Jade]: http://jade-lang.com/
[Less]: http://lesscss.org/
[hexo-renderer-coffeescript]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/coffeescript
[hexo-renderer-haml]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/haml
[hexo-renderer-jade]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/jade
[hexo-renderer-less]: https://github.com/tommy351/hexo-plugins/tree/master/renderer/less
[Moment.js]: http://momentjs.com/
[IETF 格式]: http://www.w3.org/International/articles/language-tags/