---
layout: post
title: Yarn 2 和 Monorepo
slug: yarn-2-and-monorepo
date: 2020-05-10T09:57:17.963Z
tags:
  - Yarn
  - Node.js
  - JavaScript
---
今年初隨著公司的 repo 越來越多，我們決定把 web 前端部分轉為 monorepo 的形式，一開始花了一段時間研究各個 monorepo 方案的利弊，最後決定基於 Yarn 2 打造一套自用的工具。這篇文章會大概分析一些我試過的 monorepo 方案的優缺點，以及最後用 Yarn 2 的成果。

## 現有 Monorepo 方案

### [Lerna]

[Lerna] 是我一開始比較熟悉的方案，在 [Kosko](https://github.com/tommy351/kosko/) 和 [kubernetes-models-ts](https://github.com/tommy351/kubernetes-models-ts/) 都有用到，在 JavaScript monorepo 算是非常普遍的選擇。

- 👍 支援 npm，也可以善用 Yarn 提供的 workspace 功能。
- 👍 可以偵測檔案變動，只更新並發佈有變動的 npm packages。
- 💩 主要是設計用來「發佈到 npm」的，如果是內部使用的話，並不需要用到這功能，必須得客製 `lerna version` 才能符合我們的需求。

### [Yarn 1]

- 👍 本身就內建了 workspace 功能，對於 monorepo 有最基本的支援。
- 👍 效能好，會把共用的 dependencies 抽到最上層的 `node_modules` 共用避免浪費空間。
- 💩 如果要在 workspace 之間互相引用的話，`yarn workspace @scope/a add @scope/b` 總是會試圖從 npm 下載 package，而不是先安裝 local 版本 ([yarnpkg/yarn#4878](https://github.com/yarnpkg/yarn/issues/4878))。

### [pnpm]

- 👍 本身就內建了 workspace 功能，相較於 Yarn 1 來說更強大一點。
- 👍 能夠用 [`pnpmfile.js`](https://pnpm.js.org/en/pnpmfile) 客製 `pnpm install` 的行為，可用來限制 dependencies 版本或是竄改 `package.json`。
- 💩 相較於 npm 和 Yarn 來說比較小眾，使用前必須先安裝。如果是 Yarn 的話，CI 和 Docker image 均有內建。

### [Rush]

[Rush] 是微軟推出的 JavaScript monorepo 方案，設計更加嚴謹且繁瑣。

- 👍 可以同時支援 npm、yarn 和 pnpm，官方建議選用 pnpm。
- 👍 可指定跨 workspace 之間的 dependencies 版本，避免衝突。
- 👍 可以避免漏裝 dependencies。Yarn 會把共用 dependencies 都裝到最上層的 `node_modules`，因此所有 workspace 都能直接引用，即便沒有寫在 `package.json` 裡。pnpm 則是會把所有 dependencies 都裝到另外的資料夾，再用 symlink 連結到各個 workspace 的 `node_modules`。
- 👍 能夠自動偵測 workspaces 之間的相依性，決定編譯順序，並實作平行編譯、增量編譯。
- 💩 必須手動指定所有 workspace 的路徑。
- 💩 有些功能實際上必須依賴於 pnpm，因此得先安裝 pnpm。

### [Bazel]

[Bazel] 是 Google 推出的跨語言 monorepo 方案，很強大也很複雜，對於我們來說，只是要支援 JavaScript 卻要寫這麼多設定，實在讓人頭痛。

- 👍 能夠快取並增量編譯。
- 👍 能夠處理編譯、測試、部署，可以說是一條龍的方案。
- 💩 有獨特的 DSL 和生態系，學習成本很高，除非像 Angular 提供了現成的套件，否則設定很花時間。

## [Yarn 2]

在我研究的這段期間，Yarn 2 剛好推出了 RC 版，相較於 Yarn 1 變化非常大，詳細內容可以參考 [Introducing Yarn 2](https://dev.to/arcanis/introducing-yarn-2-4eh1)。

### 更完善的 Workspace 支援

現在 `yarn workspaces foreach` 的功能更完善，有點接近 Lerna。

```sh
yarn workspaces foreach --parallel --interlaced --topological run ...
```

Workspace 之間要相互引用時，不再出現上面提到的 `yarn add` 問題。

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

- [constraints](https://github.com/yarnpkg/berry/tree/master/packages/plugin-constraints) - 提供了上面提到的 constraint 功能。
- [typescript](https://github.com/yarnpkg/berry/tree/master/packages/plugin-typescript) - 在安裝 dependencies 的時候順便安裝對應的 `@types/` 套件。
- [workspace-tools](https://github.com/yarnpkg/berry/tree/master/packages/plugin-workspace-tools) - 提供了上面提到的 `yarn workspaces foreach` 功能。

如果要自己實作擴充套件也非常簡單，透過 Yarn 2 的 API 可以輕鬆地得到每個 workspace 的狀態。我們自己也實作了一些簡單的擴充套件：

- [changed](https://github.com/Dcard/yarn-plugins/tree/master/packages/changed) - 偵測有變動的 workspaces。
- [tsconfig-references](https://github.com/Dcard/yarn-plugins/tree/master/packages/tsconfig-references) - 在安裝 dependencies 的時候順便更新 `tsconfig.json` 的 `references`。

### Zero-Installs

Yarn 2 預設會啟用 Zero-Installs (Plug'n'Play)，也就是把所有 dependencies 安裝到 `.yarn` 資料夾，完全消滅了 `node_modules` 的存在，藉此解決效能和 `node_modules` 占用太多硬碟空間的問題。

這個功能需要 toolchain 的配合，因為這個徹底改寫了 Node.js 的 module resolution 機制，雖然目前很多主流的工具都支援了 Plug'n'Play，但是 VSCode 目前沒有辦法預覽套件內容，因為 Yarn 2 用壓縮檔儲存所有套件，開發時非常不便，所以我們目前還是關閉了這個功能。

```yaml
nodeLinker: node-modules
```

## 部署流程

轉換到 monorepo 後部署流程也必須有相應的改變。

[Lerna]: https://lerna.js.org/
[pnpm]: https://pnpm.js.org/en/
[Yarn 1]: https://classic.yarnpkg.com/lang/en/
[Rush]: https://rushjs.io/
[Bazel]: https://bazel.build/
[Yarn 2]: https://yarnpkg.com/