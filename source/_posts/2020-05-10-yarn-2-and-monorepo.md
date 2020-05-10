---
layout: post
title: Yarn 2 和 Monorepo
slug: yarn-2-and-monorepo
date: 2020-05-10T13:23:30.836Z
tags:
  - Yarn
  - Node.js
  - JavaScript
---
![](/images/uploads/yarn_logo.png)

今年初隨著公司的 repo 越來越多，我們決定把 web 前端部分轉為 monorepo 的形式，一開始花了一段時間研究各個 monorepo 方案的利弊，最後決定基於 Yarn 2 打造一套自用的工具。這篇文章會大概分析一些我試過的 monorepo 方案的優缺點，以及最後用 Yarn 2 的成果。

<!-- more -->

## 現有 Monorepo 方案

### [Lerna](https://lerna.js.org/)

[Lerna](https://lerna.js.org/) 是我一開始比較熟悉的方案，在 [Kosko](https://github.com/tommy351/kosko/) 和 [kubernetes-models-ts](https://github.com/tommy351/kubernetes-models-ts/) 都有用到，算是 JavaScript monorepo 非常普遍的選擇。

* 👍 支援 npm，也可以善用 Yarn 提供的 workspace 功能。
* 👍 可以偵測檔案變動，只更新並發佈有變動的 npm packages。
* 💩 主要是設計用來「發佈到 npm」的，如果是內部使用的話，並不需要用到這功能，必須得客製 `lerna version` 才能符合我們的需求。

### [Yarn 1](https://classic.yarnpkg.com/lang/en/)

* 👍 本身就內建了 workspace 功能，對於 monorepo 有最基本的支援。
* 👍 效能好，會把共用的 dependencies 抽到最上層的 `node_modules` 共用避免浪費空間。
* 💩 如果要在 workspace 之間互相引用的話，`yarn workspace @scope/a add @scope/b` 總是會試圖從 npm 下載 package，而不是先安裝 local 版本 ([yarnpkg/yarn#4878](https://github.com/yarnpkg/yarn/issues/4878))。

### [pnpm](https://pnpm.js.org/en/)

* 👍 本身就內建了 workspace 功能，相較於 Yarn 1 來說更強大一點。
* 👍 能夠用 [`pnpmfile.js`](https://pnpm.js.org/en/pnpmfile) 客製 `pnpm install` 的行為，可用來限制 dependencies 版本或是竄改 `package.json`。
* 💩 相較於 npm 和 Yarn 來說比較小眾，使用前必須先安裝。如果是 Yarn 的話，CI 和 Docker image 均有內建。

### [Rush](https://rushjs.io/)

[Rush](https://rushjs.io/) 是微軟推出的 JavaScript monorepo 方案，設計更加嚴謹且繁瑣。

* 👍 可以同時支援 npm、Yarn 和 pnpm，官方建議選用 pnpm。
* 👍 可指定跨 workspace 之間的 dependencies 版本，避免衝突。
* 👍 可以避免漏裝 dependencies。Yarn 會把共用 dependencies 都裝到最上層的 `node_modules`，因此所有 workspace 都能直接引用，即便沒有寫在 `package.json` 裡。pnpm 則是會把所有 dependencies 都裝到另外的資料夾，再用 symlink 連結到各個 workspace 的 `node_modules`。
* 👍 能夠自動偵測 workspaces 之間的相依性，決定編譯順序，並實作平行編譯、增量編譯。
* 💩 必須手動指定所有 workspace 的路徑。
* 💩 有些功能實際上必須依賴於 pnpm，因此得先安裝 pnpm。

### [Bazel](https://bazel.build/)

[Bazel](https://bazel.build/) 是 Google 推出的跨語言 monorepo 方案，很強大也很複雜，對於我們來說，只是要支援 JavaScript 卻要寫這麼多設定，實在讓人頭痛。

* 👍 能夠快取並增量編譯。
* 👍 能夠處理編譯、測試、部署，可以說是一條龍的方案。
* 💩 有獨特的 DSL 和生態系，學習成本很高，除非像 Angular 有現成的套件，否則設定很花時間。

## [Yarn 2](https://yarnpkg.com/)

在我研究的這段期間，Yarn 2 剛好推出了 RC 版，相較於 Yarn 1 變化非常大，詳細內容可以參考 [Introducing Yarn 2](https://dev.to/arcanis/introducing-yarn-2-4eh1)。

### 更完善的 Workspace 支援

現在 `yarn workspaces foreach` 的功能更完善，有點接近 Lerna。

```sh
yarn workspaces foreach --parallel --interlaced --topological run ...
```

Workspace 之間相互引用時，不再出現上面提到的 `yarn add` 問題。

```sh
yarn workspace @scope/a add @scope/b
```

### 限制 dependencies 版本

透過新功能 [Constraints](https://yarnpkg.com/features/constraints)，可以限制 dependencies 的版本。例如下面這段可以用來確保每個 workspace 所用的 dependencies 版本統一。

```prolog
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, DependencyRange2, DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  workspace_has_dependency(OtherWorkspaceCwd, DependencyIdent, DependencyRange2, DependencyType2),
  DependencyRange \= DependencyRange2.
```

### 容易擴充

所有功能幾乎都是以擴充套件的形式實作的，官方本身提供了一些非常好用的擴充套件。我們用到了：

* [constraints](https://github.com/yarnpkg/berry/tree/master/packages/plugin-constraints) - 提供了上面提到的 constraint 功能。
* [typescript](https://github.com/yarnpkg/berry/tree/master/packages/plugin-typescript) - 在安裝 dependencies 的時候順便安裝對應的 `@types/` 套件。
* [workspace-tools](https://github.com/yarnpkg/berry/tree/master/packages/plugin-workspace-tools) - 提供了上面提到的 `yarn workspaces foreach` 功能。

如果要自己實作擴充套件也非常簡單，透過 Yarn 2 的 API 可以輕鬆地得到每個 workspace 的狀態。我們自己也實作了一些簡單的擴充套件：

* [changed](https://github.com/Dcard/yarn-plugins/tree/master/packages/changed) - 偵測有變動的 workspaces。
* [tsconfig-references](https://github.com/Dcard/yarn-plugins/tree/master/packages/tsconfig-references) - 在安裝 dependencies 的時候順便更新 `tsconfig.json` 的 `references`。

### Zero-Installs

Yarn 2 預設會啟用 Zero-Installs (Plug'n'Play)，也就是把所有 dependencies 安裝到 `.yarn` 資料夾，完全消滅了 `node_modules` 的存在，藉此解決效能和 `node_modules` 占用太多硬碟空間的問題。

這個功能需要 toolchain 的配合，因為這個徹底改寫了 Node.js 的 module resolution 機制，雖然目前很多主流的工具都支援了 Plug'n'Play，但是 VSCode 目前沒有辦法預覽套件內容，因為 Yarn 2 用壓縮檔儲存所有套件，開發時非常不便，所以我們目前還是關閉了這個功能。

```yaml
nodeLinker: node-modules
```

### 速度

Yarn 2 比起 Yarn 1 也並非完全沒有缺點，Yarn 2 在 `yarn install` 會切分成多個步驟，分別是 Resolution、Fetch、Link，Resolution 和 Fetch 得益於新的設計會把所有 packages 儲存在 `.yarn/cache` 資料夾所以非常快，但是 Link 階段就慢一些，平均大概需要 30 秒至一分鐘以上，或許開啟 Zero-Installs 會快一些？

### Vendorizing

Yarn 2 會在 `.yarn` 儲存用 Webpack 編過的 Yarn 本體和擴充套件，大約佔 3 MB，這樣的好處是可以確保在不同環境下使用的 Yarn 版本都完全相同，缺點就是在 repo 裡會多了一些額外的檔案。

Yarn 官方更是把整個 [.yarn/cache](https://github.com/yarnpkg/berry/tree/master/.yarn/cache) 資料夾都 commit 到 Git 上，這樣的好處或許是能夠直接省去 fetch packages 的時間，但 git clone 的時間應該也會更長。

## 部署流程

我們把部屬流程分成了三塊：測試→編譯→發佈。

![](/images/uploads/yarn_2_deploy_flow.png)

### 測試

在這個階段會對整個 monorepo 進行 lint 和 unit tests，目前整個過程需時大約不到 3 分鐘，所以沒有拆開來執行。

### 編譯

這個階段相對來說非常耗時，在執行前會用 `yarn changed` 來檢查 workspace 以及其依賴的套件有沒有變動，如果沒有的話就會直接跳過不做，藉此可以省下時間和成本。在圖中可以看到有些 job 花的時間特別短，就是因為那些沒有變動的部分都直接跳過了。

```sh
if ! yarn changed list --git-range "$GIT_COMMIT_RANGE" | grep -q "$WORKSPACE_NAME"; then
  circleci-agent step halt
fi
```

在編譯完成後，會將 Docker image 部屬到測試環境，確保測試環境和 master branch 同步。

### 發佈

最後要發佈到正式環境時，會利用 [semantic-release](https://semantic-release.gitbook.io/semantic-release/) 更新版號，把測試環境的 Docker image 複製到正式環境上，一切就大功告成了。