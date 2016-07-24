---
layout: post
title: "Slash — 專為 Octopress 設計的極簡主題"
date: 2012-01-25 16:27
comments: true
tags: 
- 主題
- Octopress
---
![](http://i.minus.com/i8oyJmY5lRJEJ.png)

[Octopress] 雖然預設主題相當漂亮，支援眾多 HTML5 的新特性，但每個網誌都是同一個主題，令人有些厭煩。在決定轉移到 [Octopress] 的第一刻起，我就開始著手設計適用於 [Octopress] 的主題，在今天終於把檔案整理完畢，集合成一個獨立的 repo。

<!-- more -->

做為一個 [Octopress] 主題，當然不能輸給原本的預設主題，Slash 擁有以下特性：

- 自動讀取圖片的`alt`屬性，並在圖片下方顯示註解。
- 內建 [Fancybox](http://fancyapps.com/fancybox/)，讓您輕鬆展示您的作品。
- 自動將 HTML5 `video`、`iframe`、`object`等嵌入式影片縮放至頁面寬度。
- 支援 responsive layouts，無論電腦、手機、平板都能獲得極佳的使用體驗。
- [更多介紹…](http://zespia.tw/Octopress-Theme-Slash/index_tw.html)

##安裝

只需在終端機輸入以下指令，即可完成安裝：

	$ cd octopress
	$ git clone git://github.com/tommy351/Octopress-Theme-Slash.git .themes/slash
	$ rake install['slash']
	$ rake generate

使用 zsh 時發生問題嗎？試試看`rake install\['slash'\]`。

##Q&A

###如何顯示右上角的Facebook連結？

在`_config.yml`新增`facebook_user`參數，並填入您的 Facebook ID。

###如何編輯選單？

編輯`slash`→`source`→`_includes`→`custom`→`navigation.html`。

###如何隱藏頁首的Twitter訊息串？

刪除`slash`→`source`→`_layouts`→`default.html`的第 6 行。

###如何關閉Fancybox？

1. 刪除`slash`→`source`→`_includes`→`after_footer.html`的第 4 行。
2. 刪除`slash`→`source`→`javascripts`→`caption.js`第 14 行。

如果還有其他問題或建議，歡迎在以下留言。

[Octopress]: http://octopress.org/