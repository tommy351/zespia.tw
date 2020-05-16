---
title: Kosko – 用 JavaScript 管理 Kubernetes
tags:
  - Kubernetes
  - JavaScript
---
{% asset_img costco.jpg %}

敝社從 2016 年就開始 [Kubernetes]，應該能算是相當早期的使用者了，也因此我們累積了一堆的 Kubernetes YAML 設定檔，從某個時間開始 staging 和 production 環境的設定檔更開始分裂，自此以來一直無法合併。因此這次的目標就是：

- 整合各環境的設定
- 能夠重複利用
- 能夠驗證設定是否正確

<!-- more -->

## 現有工具

一開始我先從 [awesome-kubernetes](https://github.com/ramitsurana/awesome-kubernetes#configuration) 尋找現有的設定管理工具，以下列出一些我覺得還不錯的工具以及它們的優缺點。

### [kustomize]

{% asset_img kustomize-overlay.jpg %}

- 👍 屬於 [sig-cli](https://github.com/kubernetes/community/blob/master/sig-cli/README.md) 的專案，應該能夠保障更新活躍且不會突然棄坑。
- 👍 學習成本低，使用熟悉的 YAML。
- 👍 用 Overlay 的概念讓不同環境的參數去 patch 基礎設定檔。
- 👎 沒有驗證設定的功能。

### [ksonnet]

{% asset_img ksonnet-overview.svg %}

- 👍 彈性極高，能透過變數及函數共享設定。
- 👍 支援 [Helm]。
- 👍 能夠驗證設定。
- 👎 使用比較少見的 [jsonnet]，需要另外花時間學習，而且資源也比較少。
- 😢 已[停止維護](https://blogs.vmware.com/cloudnative/2019/02/05/welcoming-heptio-open-source-projects-to-vmware/)。

### [kapitan]

{% asset_img kapitan-overview.png %}

- 👍 能夠管理 secrets。
- 👍 能夠產生文件、Terraform 設定以及一些 scripts。
- 👍 用 Inventory 的概念管理不同環境和共享設定。
- 👎 使用 [jsonnet]，理由同上。
- 👎 使用 [jinja2] 做為 template engine，我不太能夠理解既然都用上 [jsonnet] 的話那為何還需要用 templates？

## 造輪子

因為現有工具對我來說都有些不足的地方，所以我最後決定根據 [ksonnet] 的概念，並稍微調整一些部份讓我用起來更順手一些：

- 改用 JavaScript，因為資源豐富而且大家都會用。
- 不支援 [Helm]，因為我們沒在用。
- 只負責產生和驗證 YAML，完全不和 Kubernetes cluster 接觸。

相較於 [ksonnet] 來說砍了很多功能，所以實際上實作並沒有花太多時間，麻煩的是把現有的上百個 YAML 檔轉換成 JavaScript、整合 staging 和 production 環境並實際在 Kubernetes 上測試，大約花了 5 週才完成所有工作，最後的結果非常可觀。

{% asset_img compare-commits.jpg %}

## [kosko]

### 安裝

```shell
npm install kosko -g
```

### 初始化

```shell
kosko init example
cd example
npm install
```

### 產生 YAML

```shell
# 輸出到 console
kosko generate

# Apply 到 Kubernetes cluster 上
kosko generate | kubectl apply -f -
```

### 驗證 YAML

其實在執行 `kosko generate` 時也會順帶驗證，這個指令只是用來方便在 CI 上跑測試時不會把設定輸出到 log。

```shell
kosko validate
```

### 轉移現有的 YAML

```shell
# 單一檔案
kosko migrate -f nginx-deployment.yml

# 資料夾
kosko migrate -f nginx
```

### 資料夾結構

預設的資料夾結構參考 [ksonnet]，`components` 資料夾用來放 manifests，`environments` 則是各環境的參數。

```shell
.
├── components
│   ├── nginx.js
│   └── postgres.js
├── environments
│   ├── staging
│   │   ├── index.js
│   │   ├── nginx.js
│   │   └── postgres.js
│   └── production
│       ├── index.js
│       ├── nginx.js
│       └── postgres.js
├── kosko.toml
└── templates
```

但實際使用時發現這種結構在 components 過多時使用起來必須要在 `components` 和 `environments` 兩個資料夾來回，不太方便，所以最後加上了自訂路徑的功能。

```toml
[paths.environment]
component = "components/#{component}/#{environment}"
```

上述的設定改變了 component environments 的檔案路徑，變成了下列的結構：

```shell
.
├── components
│   ├── nginx
│   │   ├── index.js
│   │   ├── staging.js
│   │   └── production.js
│   └── postgres
│       ├── index.js
│       ├── staging.js
│       └── production.js
├── environments
│   ├── staging.js
│   └── production.js
├── kosko.toml
└── templates
```

## [kubernetes-models-ts]

為了能夠驗證設定是否符合 schema，我根據 [Kubernetes 的 OpenAPI specification](https://github.com/kubernetes/kubernetes/tree/master/api/openapi-spec) 產生了相對應的 TypeScript。不僅能夠在編譯時找出一些基本的型別錯誤，即使沒有使用 TypeScript 也能透過 JSON schema 驗證設定。

下面列出一些開發時遇到的問題：

### JSON 沒有 undefined

JSON 實際上是沒有 `undefined` 型別的，雖然 `JSON.stringify` 會直接忽略，但是 [js-yaml](https://github.com/nodeca/js-yaml) 卻不會，所以我必須在 `toJSON()` 函數裡刪除所有 `undefined` 的欄位。

### int-or-string

在 Kubernetes 裡有一種特殊型別叫做 `int-or-string`，雖然在 JSON schema 是 `string`，但在 TypeScript 必須轉為 `string | number`，不然編譯器常會報錯。舉例來說，`Service` 中的 `targetPort` 就是常見的情況，它同時可以是 port number (int) 或 named port (string)。

```js
new Service({
  spec: {
    ports: [{ port: 80, targetPort: 80 }]
  }
});
```

### 編輯器支援

最後炫耀一下，在支援 TypeScript 的編輯器裡寫設定有多爽 😎

{% youtube CFAhIFmVNoU %}

## 結語

一開始其實是打算用 [ksonnet] 的，但是必須要另外學 [jsonnet] 很麻煩。開始造輪子大約一個月後發現 ksonnet 竟然停止維護了，不禁感嘆幸好當初選擇了自己造輪子？

其他使用 Kubernetes 的大大們可能也會遇到設定管理的問題，不知道各位是怎麼解決的？是使用官方的 [kustomize]？還是也自己開發工具？又是如何管理 secrets 呢？如果可以的話，希望能互相交流。

[Kubernetes]: https://kubernetes.io/
[kustomize]: https://github.com/kubernetes-sigs/kustomize
[ksonnet]: https://ksonnet.io/
[kapitan]: https://github.com/deepmind/kapitan
[Helm]: https://helm.sh/
[jsonnet]: https://jsonnet.org/
[jinja2]: http://jinja.pocoo.org/
[kosko]: https://github.com/tommy351/kosko/
[kubernetes-models-ts]: https://github.com/tommy351/kubernetes-models-ts/
