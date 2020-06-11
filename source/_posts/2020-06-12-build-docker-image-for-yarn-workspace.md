---
title: 建構精簡的 Yarn Workspace Docker Image
tags:
  - Yarn
  - Node.js
  - Monorepo
  - Docker
comment_service: utterances
---
{% asset_img cover.jpg %}

本篇接續 {% post_link yarn-2-and-monorepo %} 提到的部屬的部分，因為 monorepo 裡包含了很多套件和網站，如果直接在根目錄執行 `docker build` 把整個 monorepo 打包成 Docker image 的話，勢必會做出大於 1 GB 而且內含一堆無用垃圾的 Docker image；為了要讓 Docker image 能夠最小化，必須只打包正式環境會需要用到的套件，確保不會浪費任何空間和時間。

我把建構 Docker image 的步驟分為：

- 解析正式環境需要用到的套件
- 複製 workspaces
- 建構 Docker image

<!-- more -->

## 解析套件的相依關係

這部分對於 Yarn 2 來說非常容易，在擴充套件裡可以直接讀取整個 monorepo 的狀態，可以參考 [`yarn workspaces focus`](https://github.com/yarnpkg/berry/blob/master/packages/plugin-workspace-tools/sources/commands/focus.ts) 的原始碼，這個指令是用來只安裝特定 workspace 需要用到的套件，剛好和我需要的功能相同。

```ts
import { Configuration, Project, Cache } from '@yarnpkg/core';

// 讀取設定
const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
const { project } = await Project.find(configuration, this.context.cwd);

// 取得指定的 workspace
const workspace = project.getWorkspaceByIdent(
  structUtils.parseIdent('@foo/bar'),
);

const requiredWorkspaces = new Set([workspace]);

for (const ws of requiredWorkspaces) {
  // scope 可以是 `dependencies`, `devDependencies`
  // 因為我們只需要正式環境會用到的套件，所以這邊只用 `dependencies`
  const deps = ws.manifest.getForScope('dependencies').values();

  // 把相依的 workspace 新增到 `requiredWorkspaces` 裡
  for (const dep of deps) {
    const workspace = project.tryWorkspaceByDescriptor(dep);

    if (workspace) {
      requiredWorkspaces.add(workspace);
    }
  }
}

// 接著把 project 裡所有 workspace 的 manifest (package.json) 都清理一遍
for (const ws of project.workspaces) {
  // 如果這個 workspace 在正式環境會用到，那麼只清掉 `devDependencies`
  if (requiredWorkspaces.has(ws)) {
    ws.manifest.devDependencies.clear();
  } else {
    // 否則就把所有的 dependencies 都清掉
    ws.manifest.dependencies.clear();
    ws.manifest.devDependencies.clear();
    ws.manifest.peerDependencies.clear();
  }
}
```

透過上面的程式碼，就能得到正式環境需要用到的 workspaces。接下來，我會重跑一遍 `yarn install`，因為已經有快取了，所以不需要花多少時間，這是為了產生更新後的 `yarn.lock`，並了解有哪些 `.yarn/cache` 的檔案會被用到。

```ts
// 讀取現有快取
const cache = await Cache.find(configuration);

// 解析 dependencies
// 這部分相當於 `yarn install` 裡的 `Resolution Step`
await project.resolveEverything({ report, cache });

// 下載 dependencies
// 這部分相當於 `yarn install` 裡的 `Fetch Step`
await project.fetchEverything({ report, cache });

// 執行完上面兩個步驟後，就能產生新的 `yarn.lock`
const newLockFile = project.generateLockFile();

// 也能知道有哪些 cache 會被用到
for (const file of cache.markedFiles) {}
```

## 複製 workspaces

除了相依套件外，還需要把 workspaces 的原始碼也複製到 Docker image 裡，為了精簡需要複製的檔案量，可以參考 [`yarn pack`](https://github.com/yarnpkg/berry/blob/master/packages/plugin-pack/sources/packUtils.ts) 的原始碼，我在這邊用 `packUtils` 取得檔案列表，然後再複製到指定的資料夾裡。

```ts
import { packUtils } from '@yarnpkg/plugin-pack';

// `prepareForPack` 是用來執行 `prepack` 和 `postpack` 等 lifecycle hooks 的
await packUtils.prepareForPack(workspace, { report }, async () => {
  // 取得檔案列表
  const files = await packUtils.genPackList(workspace);

  // 如果想要把檔案壓成壓縮檔的話，可以用 `genPackStream`
  const stream = await packutils.genPackStream(workspace);
});
```

## 建構 Docker image

最後，檔案會被分成兩個部分複製到不同的資料夾，一個是 `manifests`，用來儲存 `yarn install` 需要用到的檔案，像是 `package.json`, `yarn.lock` 和快取；另一個部分則是 workspaces 的原始碼，也就是上面 `yarn pack` 產生的結果。

以下是 `Dockerfile` 的範例：

```dockerfile
FROM node:12-alpine AS builder
WORKDIR /workspace
COPY manifests ./
RUN yarn install --immutable
RUN rm -rf .yarn/cache

FROM node:12-alpine
WORKDIR /workspace
COPY --from=builder /workspace ./
COPY packs ./
CMD yarn workspace @foo/bar start
```

## 結論

在寫完 Yarn 2 那篇文章後，我花了一些時間把內部使用的 Yarn 擴充套件整理了一下並開源，各位可以試用看看：[yarn-plugin-docker-build](https://github.com/Dcard/yarn-plugins/tree/master/packages/docker-build)。
