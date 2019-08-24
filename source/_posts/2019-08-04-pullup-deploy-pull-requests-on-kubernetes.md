---
title: Pullup – 在 Kubernetes 上部署與測試 Pull Request
tags:
  - Kubernetes
  - Go
---

本篇接續{% post_link kosko-kubernetes-in-javascript 上一篇文章 %}，是我在 Dcard 開發的第二個 Kubernetes 工具。

## 開發流程

<figure>
  {% asset_img github-flow.png %}
  <figcaption><a href="https://hackernoon.com/15-tips-to-enhance-your-github-flow-6af7ceb0d8a3">圖片來源</a></figcaption>
</figure>

目前敝社的開發流程基於 [GitHub flow](https://guides.github.com/introduction/flow/)，大致上如上圖所示。要開發新的功能時，會從主要分支 `master` 開出新的功能分支 `feature`，功能開發完成後會提出 pull request，審核通過後就會合併進 `master`，並部署到 staging 伺服器上。

通常在審核 pull request 時，我們僅會檢視程式碼和附帶的測試，如果一切順利而且 CI 測試通過的話，就會直接合併進 `master`。然而在某些情況下，特別是以前端極少測試的狀況來說，只看程式碼有時無法看出問題所在，必須實際執行才能確保程式能夠正常運作，有時也可能需要 PM 確認程式符合 spec，或是讓設計師確認程式符合設計稿。

對於工程師來說，要把程式執行起來並不困難，但對於其他人來說，光是設定環境可能就是件讓人頭痛的事了。我們常用的方法是直接讓他們透過區網或 [ngrok](https://ngrok.com/) 連到工程師的電腦上，有時甚至為了上 staging 伺服器就直接合併進 `master` 了。讓還沒審核通過的程式碼進入 `master` 不僅可能造成 staging 伺服器的異常，也有可能會影響其他工程師的開發進度。

<!-- more -->

## 部署 Pull Request

為了解決這個問題，我想到的解決方法是利用 webhook 接收 GitHub 的 pull request 事件，在建立新的 pull request 時，自動把程式碼部署到 Kubernetes 上，讓使用者可以透過子網域測試 pull request，有點類似 [Netlify 的 Deploy Preview](https://www.netlify.com/docs/continuous-deployment/#branches-deploys)，能夠在 pull request 建立時自動部屬到子網域 `deploy-preview-42--yoursitename.netlify.com`。

Pullup 在收到 pull request 事件時，會以原資源為基準複製新的資源，並自動在 pull request 更新時一併更新資源。以上圖為例，通常大部分部屬在 Kubernetes 裡的服務都會包含 `Deployment` 和 `Service`，Pullup 能更新 Deployment 所使用的 Docker image，並修改 Service 的 selector，確保 `pr1.example.dev` 能存取到新服務。

{% asset_img deploy-pull-request.svg %}

當 pull request 被合併或關閉時，Pullup 會利用 [Garbage Collection](https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/) 刪除已部屬的資源，避免資源浪費。

{% asset_img delete-pull-request.svg %}

## 安裝

以下指令會在 `pullup` namespace 中安裝 Pullup 相關的 CRD 和各種必要元件。

```sh
kubectl apply -f https://github.com/tommy351/pullup/releases/latest/download/pullup-deployment.yml
```

你可在 [deployment](https://github.com/tommy351/pullup/blob/master/deployment) 資料夾中檢視原始碼，YAML 檔中包含：

- Pullup CRD
- 服務帳號 (service account)
- 用於存取 Pullup CRD、寫入事件以及 leader election 的 RBAC，你還必須根據[文件](https://github.com/tommy351/pullup/#rbac)來設定其他資源的 RBAC。這是為了讓使用者便於控制 Pullup 的權限。
- Controller 和 webhook 的 deployment
- Service

更詳細的說明請參考[文件][Pullup]。

## 使用範例

### Deployment + Service

常見的使用範例是部屬新的 Deployment 並搭配相對應的 Service。下面的範例會更新 Deployment 的 image 和 labels，並修改 Service 的 selector。除了範例裡的欄位以外，你也可以更新其他既有欄位，Pullup 會使用類似 kustomize 的策略去建立資源。

```yaml
apiVersion: pullup.dev/v1alpha1
kind: Webhook
metadata:
  name: example
spec:
  repositories:
    - type: github
      name: tommy351/pullup
  resources:
    - apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: example
      spec:
        # 更新 selector 和 labels 以避免和原資源混淆
        selector:
          matchLabels:
            app: "{{ .Name }}"
        template:
          metadata:
            labels:
              app: "{{ .Name }}"
          spec:
            - name: foo
              # 更新 image
              image: "tommy351/foo:{{ .Spec.Head.SHA }}"
    - apiVersion: v1
      kind: Service
      metadata:
        name: example
      spec:
        # 對應到新 Deployment 的 labels
        selector:
          app: "{{ .Name }}"
```

### 子網域

如果想要自動建立子網域，因為 Pullup 僅能用於建立新資源，無法修改現有的 Ingress，可以改用 [Contour] 的 [IngressRoute]。[Contour] 利用 [Envoy] 實作了 Ingress controller，它提供獨立的 [IngressRoute] 資源比較容易以 pull request 為單位建立子網域。

```yaml
apiVersion: pullup.dev/v1alpha1
kind: Webhook
metadata:
  name: example
spec:
  resources:
    # 中略
    - apiVersion: contour.heptio.com/v1beta1
      kind: IngressRoute
      metadata:
        name: example
      spec:
        virtualhost:
          fqdn: "{{ .Name }}.example.dev"
        routes:
          - match: /
            services:
              - name: "{{ .Name }}"
                port: 80
```

### TLS 憑證

利用 [cert-manager] 自動申請並更新 TLS 憑證，以下僅提供 Certificate 部分的範例，詳細的設定方式請參照文件。

#### Wildcard

直接申請 wildcard TLS 憑證，優點是只需要申請一次憑證就可用於所有 pull request，缺點則是每次申請憑證耗時需數分鐘，且僅能利用 DNS-01 驗證網域。

```yaml
apiVersion: certmanager.k8s.io/v1alpha1
kind: Certificate
metadata:
  name: example
spec:
  secretName: example-tls
  issuerRef:
    name: letsencrypt-prod
    kind: Issuer
  commonName: *.example.dev
  dnsNames: ["*.example.dev", ".example.dev"]
  acme:
    config:
      # Wildcard 憑證只能利用 DNS-01 驗證
      - dns01:
          provider: cloudflare
        domains: ["*.example.dev", ".example.dev"]
```

#### 單一網域

如果你無法透過 DNS-01 驗證，可以試試看只申請單一網域的 TLS 憑證，通常每次申請憑證耗時不到一分鐘，比 wildcard 憑證快速許多。

```yaml
apiVersion: pullup.dev/v1alpha1
kind: Webhook
metadata:
  name: example
spec:
  resources:
    # 中略
    - apiVersion: certmanager.k8s.io/v1alpha1
      kind: Certificate
      metadata:
        name: "{{ .Name }}"
      spec:
        secretName: "{{ .Name }}-tls"
        issuerRef:
          name: letsencrypt-prod
          kind: Issuer
        commonName: "{{ .Name }}.example.dev"
        dnsNames: ["{{ .Name }}.example.dev"]
        acme:
          config:
            # 可以用 DNS-01 或 HTTP-01 驗證
            - dns01:
                provider: cloudflare
              domains: ["{{ .Name }}.example.dev"]
```

## 結語

這是我第一次開發 Kubernetes controller，一開始花了很多時間摸索，中途才發現了 [controller-runtime] 和 [Operators SDK]，大幅地節省了我的開發時間，之後預計再寫一篇關於 [controller-runtime] 的基本教學，以及 Pullup 實際上如何應用 [controller-runtime]。

[Pullup]: https://github.com/tommy351/pullup
[Contour]: https://github.com/heptio/contour
[IngressRoute]: https://github.com/heptio/contour/blob/master/docs/ingressroute.md
[Envoy]: https://www.envoyproxy.io/
[cert-manager]: https://github.com/jetstack/cert-manager
[controller-runtime]: https://github.com/kubernetes-sigs/controller-runtime
[Operators SDK]: https://coreos.com/operators/
