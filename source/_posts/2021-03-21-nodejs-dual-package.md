---
title: 讓 Node.js Package 同時支援 CommonJS 和 ESM
tags:
  - Node.js
  - JavaScript
comment_service: utterances
---

最近為了讓 [Kosko](https://kosko.dev/) 和 [kubernetes-models](https://github.com/tommy351/kubernetes-models-ts) 能夠支援瀏覽器或是 Deno，所以先做了一些前期準備，首先最重要的就是支援 [ECMAScript Module (ESM)](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_introduction)，因為這是目前所有平台都能支援的標準，但是為了要保持 Node.js 的相容性，所以暫時還是不能放下 CommonJS。

這篇文章會介紹如何讓 Node.js package 能夠同時支援 CommonJS 和 ESM，以及使用 ESM 時的注意事項。

<!-- more -->

## 先講結論

以最低支援版本來區分。

Node.js 10 以上：

- CommonJS 輸出成 `.js` 副檔名
- ESM 輸出成 `.mjs` 副檔名
- `package.json` 加上 `module`

Node.js 12 以上：

- CommonJS 輸出成 `.cjs` 副檔名
- ESM 輸出成 `.mjs` 副檔名
- `package.json` 加上 `module` 和 `exports`，`type` 可設定為 `module`

## 副檔名

正常來說，比較建議的做法是 CommonJS 一律採用 `.cjs` 副檔名，ESM 一律採用 `.mjs` 副檔名，這樣就能避免 Node.js 用 `package.json` 的 `type` 來判斷，但是在以下情況下會出問題。

### Node.js 10

如果你需要 require package 裡的路徑的話，在 Node.js 10 可能就會出問題。

舉例來說，當 require package 的時候，Node.js 會根據 `package.json` 裡設定的 `main` 來決定路徑，所以不管副檔名是什麼都無所謂，只要內容是 CommonJS 就好。

```js
// 假設 package.json 的內容是 {"main": "index.cjs"} 的話
require('example');
// -> node_modules/example/index.cjs
```

但如果是 require package 裡的路徑的話，就不會去參考 `package.json` 的設定了，如果 require 時沒有加上副檔名的話，就會根據 `require.extensions` 來尋找對應檔案。

```js
// 預設只支援 .js, .json, .node
require('example/foo');
// -> node_modules/example/foo.js
// -> node_modules/example/foo.json
// -> node_modules/example/foo.node
```

如果把 CommonJS 檔案都一律改成 `.cjs` 副檔名的話，就會找不到對應檔案。

其中一種解決方法是在路徑後加上副檔名，但這樣就需要改寫現有的 require。

```js
require('example/foo.cjs');
// -> node_modules/example/foo.cjs
```

另一種方法則是升級到 Node.js 12 以上，從 12.7.0 開始支援 [export map](https://nodejs.org/dist/latest-v14.x/docs/api/packages.html#packages_conditional_exports)，從 12.16.0 開始不用加 [`--experimental-exports`](https://nodejs.org/docs/v12.7.0/api/cli.html#cli_experimental_exports)。如果 `package.json` 裡有指定 `exports` 的話，Node.js 就會改用 export map 來決定路徑。

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs"
    },
    "./foo": {
      "import": "./foo.mjs",
      "require": "./foo.cjs"
    }
  }
}
```

```js
require('example/foo');
// -> node_modules/example/foo.cjs
```

### Jest

Jest 為了要實作 mock 機制，所以有自己一套 module resolve 和 import 的機制，在 import 外部 package 路徑的情況下，似乎不會使用 `moduleFileExtensions` 設定，而是使用 `.js` 副檔名，我用過的其中一種解決方法是設定 `moduleNameMapper`，手動在 import 路徑後加上 `.cjs` 副檔名。

```json
{
  "moduleNameMapper": {
    "^example/(.+)$": "example/$1.cjs"
  }
}
```

Jest 的 ESM 支援還在實驗階段，如果需要執行 ESM 檔案的話需要加上 `NODE_OPTIONS=--experimental-vm-modules`，目前建議還是使用 CommonJS，並使用 `.js` 副檔名。

## Import

如果要同時 import CommonJS 和 ESM package 的話，唯一的方法就是使用 `import`，舊有的 `require` 只支援 CommonJS，`import` 和 `require` 相比有很多不同的地方，細節可以參考[官方文件](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_differences_between_es_modules_and_commonjs)，本文只會說明一些我覺得重要的部分。

### 檔案路徑一定要加副檔名

Import 檔案路徑時，一定要加上副檔名，`import` 不會根據 `require.extensions` 來判斷支援哪些副檔名。此外，也不能直接 `import` 資料夾，必須加上 `/index.js`。

```js
require('./path')
import './path.js';

require('./dir');
import './dir/index.js';
```

### 不支援 `__filename` 和 `__dirname`

[`__filename`](https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_filename) 和 [`__dirname`](https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_dirname) 這兩個變數只有 CommonJS 才支援，在 ESM 裡必須改用標準的 [`import.meta.url`](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_import_meta_url)，兩者的內容會有一點點不一樣，需要透過 `url` package 裡的 [`fileURLToPath`](https://nodejs.org/dist/latest-v14.x/docs/api/url.html#url_url_fileurltopath_url) 和 [`pathToFileURL`](https://nodejs.org/dist/latest-v14.x/docs/api/url.html#url_url_pathtofileurl_path) 來轉換。

```js
__filename
// /workspace/test.js

__dirname
// /workspace

import.meta.url
// file:///workspace/test.js

fileURLToPath(import.meta.url)
// /workspace/test.js

new URL('.', import.meta.url);
// file:///workspace/
```

### Dynamic Import

在 CommonJS 裡，到處都可以直接 `require`；但是在 ESM 裡，只有最外層可以用 `import`，其他地方只能使用 async 的 `import()`，有些地方可能會因此而必須改成 async function。

### 檢測現有環境是否支援 ESM

除了檢查 Node.js 版本以外，另一個檢測方法就是利用 `import` 支援 `data:` protocol 的特性，來檢查現有環境是否支援 ESM，這是從 [ava](https://github.com/avajs/ava/blob/v3.15.0/lib/worker/subprocess.js#L11) 參考來的。

```js
const supportsESM = async () => {
  try {
    await import('data:text/javascript,');
    return true;
  } catch {}

  return false;
};
```

需要注意的是，使用 TypeScript 時，如果設定為 CommonJS module 的話，`import` 會被轉為 `require`，所以建議改為 ESNext module 或改用 JavaScript。

## 編譯 TypeScript

目前有幾種方法可以把 TypeScript 編譯成 CommonJS 和 ESM 檔案。

### 跑兩次 tsc

這應該是最簡單的方法，只要把原本的 `tsc` 指令切成兩個然後同時執行就好了。

```bash
tsc -m commonjs
tsc -m esnext
```

### 用 Babel 把 ESM 轉成 CommonJS

讓 tsc 輸出 ESM，然後再用 Babel 產生 CommonJS 檔案。

```json
{
  "plugins": ["@babel/plugin-transform-modules-commonjs"]
}
```

### tsc-multi

以上這兩種方法需要額外寫 script，如果要支援 monorepo 的話就更加痛苦了，所以我花了一點時間把工作時用的 build tool 重新改寫成 [tsc-multi](https://github.com/tommy351/tsc-multi/)，之後會在下一篇文章介紹，用法大概會像是這樣。

```json
{
  "targets": [
    { "extname": ".mjs", "module": "esnext" },
    { "extname": ".js", "module": "commonjs" }
  ],
  "projects": ["packages/*/tsconfig.json"]
}
```
