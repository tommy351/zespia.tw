---
layout: post
title: Yarn 2 和 Monorepo
slug: yarn-2-and-monorepo
date: 2020-05-10T05:58:56.701Z
tags:
  - Yarn
  - Node.js
  - JavaScript
---
今年初隨著公司的 repo 越來越多，我們決定把 web 前端部分轉為 monorepo 的形式，一開始花了一段時間研究各個 monorepo 方案的利弊，最後決定基於 Yarn 2 打造一套自用的工具。這篇文章會大概分析一些我試過的 monorepo 方案的優缺點，以及最後用 Yarn 2 的成果。

## 現有 Monorepo 方案

### [Lerna]

[Lerna] 是我一開始比較熟悉的方案，在 [Kosko](https://github.com/tommy351/kosko/) 和 [kubernetes-models-ts](https://github.com/tommy351/kubernetes-models-ts/) 都有用到，它可以同時支援 npm 和 yarn，可以自動偵測變動過的檔案，只更新有變動的 packages 並一次發佈到 npm 上。

但問題是我們的 packages 全部都僅供內部使用，不需要發佈到 npm 上，所以我們實際上用不到 Lerna 那些方便的功能，還是得要自己實作一些功能才堪用。

### [Yarn 1]

[Yarn 1] 本身提供了 workspace 的功能，但是功能非常簡陋，而且有些惱人的問題還是必須借助其他工具（例如上面提到的 Lerna）才會比較好用。

例如要在 workspaces 之間互相引用，`yarn add` 總是會試圖從 npm 下載 package，導致錯誤發生 ([yarnpkg/yarn#4878](https://github.com/yarnpkg/yarn/issues/4878))。這種情況可以指定版號，或是改用 `lerna add`。

```sh
yarn workspace @scope/a add @scope/b
```

### [pnpm]

[pnpm] 也內建了 workspace 的功能，相較於 Yarn 1 更強大了一些，提供了 [pnpmfile.js](https://pnpm.js.org/en/pnpmfile) 可以用來限制 dependency 的版本，有點類似 yarn 的 [`resolutions`](https://classic.yarnpkg.com/en/docs/selective-version-resolutions) 但更加彈性。

但是 pnpm 的問題在於它相對 npm 和 yarn 來說更加小眾，必須要在電腦上、CI 和 Docker image 裡另外安裝 pnpm。

### [Rush]

[Rush] 是微軟出的 JavaScript monorepo 方案，可以同時支援 npm, yarn 和 pnpm，對於 pnpm 的支援最佳。它相對來說比較嚴謹和繁瑣，不像 pnpm 或 Yarn 可以自動搜尋 workspaces，Rush 必須要自行在 `rush.json` 內指定 `projects`，除此之外還可以限制 dependency 的版本，避免版本不一致或是漏裝 dependency。

Rush 必須要額外搭配 pnpm 才有最佳效果，這使它有跟 pnpm 類似的問題，此外就是它的設定稍顯複雜，不容易上手。

### [Bazel]

[Bazel] 是 Google 的跨語言 monorepo 方案，比上面提到的任何一個都要複雜許多，可以用來處理跨語言間的 dependencies，能夠快取並增量編譯，甚至還能夠 build Docker image，可以說是終極的一條龍方案。但問題就在於它真的太複雜了，它有自己的 DSL 和生態系，如果像是 Angular 那樣提供了現成的 Bazel 套件的話或許可以考慮，但自己從頭開始真的太難了。

## [Yarn 2]

[Lerna]: https://lerna.js.org/
[pnpm]: https://pnpm.js.org/en/
[Yarn 1]: https://classic.yarnpkg.com/lang/en/
[Rush]: https://rushjs.io/
[Bazel]: https://bazel.build/
[Yarn 2]: https://yarnpkg.com/