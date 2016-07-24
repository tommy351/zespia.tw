---
layout: post
title: "Hello Octopress!"
date: 2012-01-14 15:52
comments: true
tags: 
- Octopress
- Ruby
---
![](http://i.minus.com/i4CFI4qZAFEct.png)

[ACSite](http://www.acsite.net/tw/) 的空間即將在2012/1/31到期，而我又懶得續約，這時看到愈來愈多部落客都從 [WordPress] 轉移到 [Octopress]，便開始試用 [Octopress]。

[Octopress] 與 [WordPress] 同樣身為部落格系統，卻有相當大的不同：

- **[WordPress]：**
	- PHP
	- 動態網頁
	- 外掛多樣
	- 速度慢
	- 使用簡單
- **[Octopress]：**
	- Ruby
	- 靜態網頁
	- 剛起步，外掛還很少
	- 速度快
	- geek 才會用

以下將簡單介紹 [Octopress] 的安裝與使用。

<!-- more -->

##安裝

###Ruby

[Octopress] 的安裝非常簡單，首先你需要準備 [Ruby] 的環境，以下以 Mac 為示範：

**請務必照著步驟做。**

1.安裝 [Xcode]（建議使用**4.1**版），或直接安裝 [OSX GCC Installer]。

2.安裝 [Homebrew]

	$ ruby -e "$(curl -fsSL https://raw.github.com/gist/323731)"
	$ brew update

3.安裝 [Git]

	$ brew install git

別忘了Mac上有 [SourceTree](http://www.sourcetreeapp.com/) 和 [GitX](http://gitx.laullon.com/) 這兩套不錯的Git GUI可以使用！

4.安裝 [RVM]

	$ bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)
	$ echo "[[ -s $HOME/.rvm/scripts/rvm ]] && source $HOME/.rvm/scripts/rvm" >> ~/.profile $ . ~/.profile
	$ source ~/.profile

5.安裝 [Ruby]（[Octopress] 要求使用**1.9.2**版）

	$ rvm install 1.9.2
	$ rvm 1.9.2 --default

若是安裝失敗的話，請試著使用以下方式安裝：

	$ rvm remove 1.9.2
	$ export CC=/usr/bin/gcc-4.2
	$ brew install readline
	$ brew link readline
	$ rvm install 1.9.2 --with-readline-dir=$rvm_path/usr

6.安裝 [Pow]

	$ curl get.pow.cx | sh

*（以上安裝步驟參考自[我這樣安裝Rails - 佑樣の技術筆記](http://killtw.k2ds.net/blog/2011/10/29/how-to-install-rails/)）*

###Octopress

到目前為止，只不過安裝好 [Ruby] 罷了，接著才是重頭戲──[Octopress] 登場！

1.安裝 [rbenv]

	$ brew install rbenv
	$ brew install ruby-build

2.下載 [Octopress]

	$ git clone git://github.com/imathis/octopress.git octopress
	$ cd octopress

3.安裝相關套件

	$ gem install bundler
	$ bundle install

4.安裝預設佈景主題

	$ rake install

如此一來就安裝好 [Octopress] 了，你可以輸入`rake preview`從`localhost:4000`預覽，或是透過 [Pow] 預覽：

	$ cd ~/.pow
	$ ln -s /path-to-octopress

##發佈

1.在 [GitHub] 建立名為`http://yourname.github.com`的 repository，`yourname`必須與你的使用者名稱相同，否則會建立專案頁面。

2.設定 [GitHub] 資料，並依照指示輸入 GitHub 頁面的 repository 網址。

	$ rake setup_github_pages

3.建立網誌資料

	$ rake generate

4.發佈至 [GitHub]

	$ rake deploy

5.建立 commit

	$ git add .
	$ git commit -m 'your message'
	$ git push origin source

過幾分鐘後 [GitHub] 就會寄信通知你專業建立完成，連上`yourname.github.com`就能見到你的 [Octopress] 囉！

若要進一步設定，請編輯 [Octopress] 根目錄中的`_config.yml`。

###自定網域

在`source/CNAME`輸入網域名稱

	$ echo 'your-domain.com' >> source/CNAME

若網域名稱如`www.example.com`，只需要新增 CNAME 記錄`yourname.github.com`即可；若如`example.com`，則必須加入 A 記錄`207.97.227.245`，請勿使用 CNAME 記錄。

*（以上安裝步驟參考自 [Octopress Documentation](http://octopress.org/docs/)）*

##寫作

雖然安裝看起來很麻煩，不過寫作文章相當簡單！

###文章

	$ rake new_post['title']

輸入以上代碼後，就可在`source/_posts`見到`yyyy-mm-dd-title.markdown`格式的文件，以及以下內容：

	---
	layout: post
	title: "Post Title"
	date: 2012-01-14 15:52
	comments: true
	categories:
	---

你可透過以下幾種方式來編輯分類：

	# 單一分類
	categories: Sass
			
	# 多重分類 (1)
	categories: [CSS3, Sass, Media Queries]
	
	# 多重分類 (2)
	categories:
	- CSS3
	- Sass
	- Media Queries

[Octopress] 完整支援 [Markdown] 語法，另外可利用`<!-- more -->`達成「詳閱全文」的效果。

###分頁

	# 一般分頁	
	$ rake new_page[your-page]
	
	# 子分頁
	$ rake new_page[your-page/sub-page.html]

輸入以上代碼後，就可在`source/your-page`中見到`index.markdown`，以及以下內容：

	---
	layout: page
	title: "Page Title"
	date: 2012-01-14 15:52
	comments: true
	sharing: true
	footer: true	
	---

操作方法與文章大同小異，同樣完整支援 [Markdown] 語法。

###建立

輸入`rake generate`即可建立文章或分頁，輸入`rake deploy`就會將文章 pull 到[GitHub]上。

##結論

經過這幾天的試用結果，老實說 [Octopress] 實在有夠難用，沒有如 [WordPress] 的強大管理介面，所有操作*（包括新增文章、分頁）*都必須透過終端；然而撰寫文章比 [WordPress] 快多了，不需忍耐 [WordPress] 慢吞吞的編輯器，在 local 用 [Markdown] 寫完就能直接 deploy 到 [GitHub] 上。

如果你是個 geek，[Octopress] 或許是不錯的選擇；如果不是的話，請繼續使用 [WordPress] 吧！

[Xcode]: http://itunes.apple.com/us/app/xcode/id448457090?mt=12
[OSX GCC Installer]: https://github.com/kennethreitz/osx-gcc-installer
[Homebrew]: http://mxcl.github.com/homebrew/
[Git]: http://git-scm.com/
[MySQL]: http://dev.mysql.com/downloads/mysql/
[RVM]: http://beginrescueend.com/
[Ruby]:http://www.ruby-lang.org/zh_TW/
[Pow]: http://pow.cx/
[Octopress]: http://octopress.org/
[WordPress]: http://wordpress.org/
[Markdown]: http://markdown.tw/
[GitHub]: https://github.com/
[rbenv]: https://github.com/sstephenson/rbenv