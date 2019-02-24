---
title: "用 Travis CI 自動部署網站到 GitHub"
tags:
- Travis CI
- GitHub
- Hexo
---
{% asset_img 48083477.png 志田 - 熊 (id=48083477) %}

長久以來，Hexo 官網都是由我手動在本機產生靜態檔案後，再 push 到 GitHub 上。這種方式對於簡單的網誌來說或許很輕鬆，但是對於偶爾會有 Pull Request 的專案來說就比較麻煩了。

在合併了 Pull Request 後，我必須自行把最新的 commit 拉到本機後再手動部署，有時比較忙就會擺爛，因此你會發現，雖然 Pull Request 已經被合併了，Hexo 網站本身卻仍未更新的情況。

<!-- more -->

## 開始之前

在開始之前，請先申請 Travis CI 帳號，把你的 GitHub repo 新增到 Travis CI 上，如果還沒建立 `.travis.yml` 的話，請先製作一個新的 `.travis.yml`。

## Deploy Key

因此，我花了一個晚上嘗試出了透過免費的 Travis CI 服務自動佈署的方法，首先你必須用 `ssh-keygen` 製作一個 SSH Key，供 GitHub 當作 Deploy key 使用。

``` bash
$ ssh-keygen -t rsa -C "your_email@example.com"
```

在製作 SSH key 時，請把 passphrase 留空，因為在 Travis 上輸入密碼很麻煩，我目前還找不到比較簡便的方式，如果各位知道的話歡迎提供給我。

當 SSH key 製作完成後，複製 Public key 到 GitHub 上的 Deploy key 欄位，如下：

{% asset_img deploy_key.png %}

## 加密 Private Key

首先，安裝 Travis 的命令列工具：

``` bash
$ gem install travis
```

在安裝完畢後，透過命令列工具登入到 Travis：

``` bash
$ travis login --auto
```

如此一來，我們就能透過 Travis 提供的命令列工具加密剛剛所製作的 Private key，並把它上傳到 Travis 上供日後使用。

假設 Private key 的檔案名稱為 `ssh_key`， Travis 會加密並產生 `ssh_key.enc`，並自動在 `.travis.yml` 的 `before_install` 欄位中，自動插入解密指令。

``` bash
$ travis encrypt-file ssh_key --add
```

正常來說 Travis 會自動解析目前的 repo 並把 Private key 上傳到相對應的 repo，但有時可能會秀逗，這時你必須在指令後加上 `-r` 選項來指定 repo 名稱，例如：

``` bash
$ travis encrypt-file ssh_key --add -r hexojs/site
```

## 設定 .travis.yml

把剛剛製作的 `ssh_key.enc` 移至 `.travis/ssh_key.enc`，並在 `.travis` 資料夾中建立 `ssh_config` 檔案，指定 Travis 上的 SSH 設定。

``` plain ssh_config
Host github.com
	User git
	StrictHostKeyChecking no
	IdentityFile ~/.ssh/id_rsa
	IdentitiesOnly yes
```

因為剛剛修改了 `ssh_key.enc` 的位址，所以我們要順帶修改剛剛 Travis 在 `.travis.yml` 幫我們插入的那條解密指令。請注意，**不要照抄這段指令**，每個人的環境變數都不一樣。

``` bash
- openssl aes-256-cbc -K $encrypted_06b8e90ac19b_key -iv $encrypted_06b8e90ac19b_iv -in .travis/ssh_key.enc -out ~/.ssh/id_rsa -d
```

這條指令會利用 openssl 解密 Private key，並把解密後的檔案存放在 `~/.ssh/id_rsa`，接著指定這個檔案的權限：

``` bash
- chmod 600 ~/.ssh/id_rsa
```

然後，把 Private key 加入到系統中：

``` bash
- eval $(ssh-agent)
- ssh-add ~/.ssh/id_rsa
```

記得剛剛我們製作的 `ssh_config` 檔案嗎？別忘了把他複製到 `~/.ssh` 資料夾：

``` bash
- cp .travis/ssh_config ~/.ssh/config
```

為了讓 `git` 操作能順利進行，我們必須先設定 `git` 的使用者資訊：

``` bash
- git config --global user.name "Tommy Chen"
- git config --global user.email tommy351@gmail.com
```

最後的結果可能如下，如果你和我一樣使用 Hexo 的話可以參考看看：

``` yaml .travis.yml
language: node_js

node_js:
  - "0.10"

before_install:
  # Decrypt the private key
  - openssl aes-256-cbc -K $encrypted_06b8e90ac19b_key -iv $encrypted_06b8e90ac19b_iv -in .travis/ssh_key.enc -out ~/.ssh/id_rsa -d
  # Set the permission of the key
  - chmod 600 ~/.ssh/id_rsa
  # Start SSH agent
  - eval $(ssh-agent)
  # Add the private key to the system
  - ssh-add ~/.ssh/id_rsa
  # Copy SSH config
  - cp .travis/ssh_config ~/.ssh/config
  # Set Git config
  - git config --global user.name "Tommy Chen"
  - git config --global user.email tommy351@gmail.com
  # Install Hexo
  - npm install hexo@beta -g
  # Clone the repository
  - git clone https://github.com/hexojs/hexojs.github.io .deploy

script:
  - hexo generate
  - hexo deploy

branches:
  only:
    - master
```

## 後記

已經好久沒更新網誌了，這次的題圖維持傳統，和本文完全沒有任何關係，而是這季一部名為「[ユリ熊嵐](http://www.yurikuma.jp/)」的動畫，從標題完全看不出來在演啥小，就算看了內容也不懂！不過這動畫有種神奇的魔力會讓人想看下去呢，真不可思議。
