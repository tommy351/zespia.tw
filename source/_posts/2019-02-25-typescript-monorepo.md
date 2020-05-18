---
title: 在 Monorepo 裡用 TypeScript
tags:
- TypeScript
- JavaScript
- Lerna
- Monorepo
comment_service: utterances
---
最近在開發公司內部使用的工具時，心血來潮想用 [Lerna] 來管理 [monorepo]，但是又想用 [TypeScript]，結果碰到了一些編譯上的問題，例如套件之間互相依賴時，TypeScript 不知道依賴關係而無法了解編譯順序，導致整個 monorepo 無法編譯成功。

之後發現了 [Quramy/lerna-yarn-workspaces-example] 這個範例，裡頭用了 Yarn、Lerna 和 TypeScript，在這之中 Yarn 並不是必須的可以忽視，重點是在 TypeScript 3.0 推出的 [Project References]，這個功能讓 TypeScript 能夠知道各個模組之間的依賴關係，因此自動解決了編譯順序的問題。

要使用 [Project References] 的話必須在 `tsconfig.json` 加上下列選項。

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist"
  }
}
```

- `composite` - 讓 TypeScript 能夠快速找到被引用專案的位置。
- `declaration` - 編譯定義檔 (`.d.ts`)。
- `rootDir` - 設定專案的根目錄，預設是 `tsconfig.json` 的所屬資料夾。
- `outDir` - 編譯的輸出路徑。

並在要引用的地方加上 `references`。

```json
{
  "references": [
    { "path": "../x-core" }
  ]
}
```

然後在執行 `tsc` 時加上 `-b` 選項以及要編譯的專案路徑，就能順利編譯。

```shell
tsc -b packages/x-core packages/x-cli
```

因為專案比較多，所以我另外寫了一個 script 自動找出所有需要編譯的專案路徑。

```js
"use strict";

const spawn = require("cross-spawn");
const globby = require("globby");
const { dirname } = require("path");

const TSC = "tsc";

const pkgs = globby.sync("packages/*/tsconfig.json").map(dirname);
const args = ["-b", ...pkgs, ...process.argv.slice(2)];

console.log(TSC, ...args);

spawn.sync(TSC, args, {
  stdio: "inherit"
});
```

執行 `tsc` 時加上 `--watch` 就能夠監看檔案變化並自動重新編譯。

```shell
tsc -b packages/x-core packages/x-cli --watch
```

執行 `tsc` 時加上 `--clean` 則是能夠自動根據 `outDir` 設定清除編譯後的檔案。

```shell
tsc -b packages/x-core packages/x-cli --clean
```

可以在 [tommy351/kosko] 看到實際運用的範例。

[Lerna]: https://lernajs.io/
[monorepo]: https://en.wikipedia.org/wiki/Monorepo
[TypeScript]: https://www.typescriptlang.org/
[Quramy/lerna-yarn-workspaces-example]: https://github.com/Quramy/lerna-yarn-workspaces-example
[Project References]: https://www.typescriptlang.org/docs/handbook/project-references.html
[tommy351/kosko]: https://github.com/tommy351/kosko
