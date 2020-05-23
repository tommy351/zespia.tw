---
title: 在伺服器上使用 Google Analytics API
tags:
- JavaScript
- Node.js
- Google
comment_service: disqus
---

{% asset_img 45547375.jpg Tea@ナケナシ - ろこどる！ (id=45547375) %}

最近在公司負責 Dashboard 的開發，除了從資料庫挖資料以外，還得想盡辦法從其他來源找到更多的資料，而其中一個資料來源就是 Google Analytics。

我過去都是在瀏覽器上使用 OAuth，這次花了一個下午才研究出如何在伺服器的 OAuth 用法，途中碰壁了好幾次，以下我將從頭到尾介紹如何接上 Google API，全文將以 Node.js 示範，其中原理可運用在其他程式語言，或 Google 其他服務的 API。

<!-- more -->

## 建立專案

{% asset_img enable_ga_sdk.png %}

首先，在 [Google Developer Console] 建立專案，並開啟「**Analytics API**」的存取權，到此為止都還是小菜一碟，跟不上的可以洗洗睡了，接下來才是正題。

{% asset_img auth_page.png %}

為了獲得 API 的存取權，我們必須申請一個新的用戶端 ID。請進入側邊欄中的「API 和驗證」→「憑證」頁面，你將可以看到一個預先建立的「Compute Engine 和 App Engine」的用戶端 ID，那個一點屁用都沒有，別管它。

{% asset_img service_account.png %}

點選橘色按鈕「建立新的用戶端 ID」後，會跳出一個視窗，請選擇「服務帳戶」，並按下藍色按鈕「建立用戶端 ID」。

{% asset_img download_key.png %}

經過數秒後，新的用戶端 ID 便建立完成，同時會跳出一個 JSON 檔案的下載視窗，該檔案是用來存放 Private key 的，非常重要，請妥善保存。

{% asset_img key_page.png %}

服務帳戶到此為止便建立完成，你可在頁面下方看到熱騰騰剛建好的服務帳戶，你現在可以關掉這個頁面了，因為稍後的操作都會圍繞在剛剛下載的 JSON 檔案；如果你不小心遺失了 Private key，可以使用「Generate new JSON key」按鈕建立一組新的 Public/Private key。

## OAuth 認證

{% asset_img server_key.png %}

Google API 採用 OAuth 2.0 認證，然而認證方式與我們平常所熟悉的方式不同，現在許多網站上都會有「以 Google 帳號登入」的按鈕，依照簡易的操作步驟即可認證；不過在伺服器上可沒有按鈕讓你按，於是我們必須透過剛剛申請的服務帳戶進行認證。

{% asset_img jwt_flow.png %}

上圖來自 [Google Developers](https://developers.google.com/accounts/docs/OAuth2ServiceAccount)，完美解釋了接下來的流程，首先，我們必須建立 JWT（JSON Web Token），並使用 JWT 向 Google 索取 Token，之後方可存取 Google API。

一個完整的 JWT 應具備以下內容：

```plain
{Base64url encoded header}.{Base64url encoded claim set}.{Base64url encoded signature}
```

第一部分是 **Header**，此部份用來指示 JWT 所使用的演算法及類型，在存取 Google API 時，我們使用 RSA SHA256 演算法，因此內容為：

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

第二部分是 **Claim set**，此部份是 JWT 的主要資料部分，內容如下：

```json
{
   "iss": "761326798069-r5mljlln1rd4lrbhg75efgigp36m78j5@developer.gserviceaccount.com",
   "scope": "https://www.googleapis.com/auth/analytics.readonly",
   "aud": "https://accounts.google.com/o/oauth2/token",
   "iat": 1328550785,
   "exp": 1328554385
}
```

名稱 | 說明
--- | ---
`iss` | Client Email，即為剛剛下載的 JSON private key 中的 `client_email` 欄位。
`scope` | 應用程式所請求的資料範圍，因為我們需要取得 Google Analytics 的資料，因此為 `https://www.googleapis.com/auth/analytics.readonly`。
`aud` | 認證目標。在此為 `https://accounts.google.com/o/oauth2/token`。
`iat` | 此請求的發起時間（秒）。
`exp` | Token 的過期時間（秒），最大時間為 `iat`（發起時間）的 1 小時後。

在介紹第三部分之前，請先將前兩部分的資料以 Base64 方式編碼，並以 `.` 串接。如果你不知道怎麼在 Node.js 內進行 Base64 編碼，可參考以下程式碼：

```js
new Buffer(str).toString('base64');
```

第三部分是 **Signature**，即是將前兩部分的編碼字串以 Private key 加密後的結果，你可從剛剛下載的 JSON private key 中的 `private_key` 欄位取得 Private key，並參考以下的程式碼取得加密字串。

```js
var crypto = require('crypto');

crypto.createSign('sha256').update(jwt).sign(privateKey, 'base64');
```

完成後，以 `.` 串接所有部分就是一個正確的 JWT 了。接著請使用 JWT 向 Google 索取 Token，POST 到 `https://accounts.google.com/o/oauth2/token` ，並加上以下資料：

名稱 | 說明
--- | ---
`grant_type` | 認證類型。在這裡為 `urn:ietf:params:oauth:grant-type:jwt-bearer`，別忘了 URL 編碼。
`assertion` | 就是剛剛建立的 JWT。

以下使用 [request] 為例：

``` js
var request = require('request'),
  querystring = require('querystring');

request.post('https://accounts.google.com/o/oauth2/token', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: querystring.stringify({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  }),
  encoding: 'utf8'
}, function(err, res, body){
  // ...
});
```

若所有資料正確無誤的話，應該可得到以下回應：

```json
{
  "access_token" : "1/8xbJqaOZXSUZbHLl5EOtu1pxz3fmmetKx9W8CV4t79M",
  "token_type" : "Bearer",
  "expires_in" : 3600
}
```

其中 `access_token` 就是我們需要的 Token，而 `expires_in` 代表這個 Token 的有效時間（秒）；簡而言之，這個 Token 的有效時間只有 1 小時（3600 秒）。

## 取得資料

一旦取得 Token 後，一切都變得簡單了，但是別忘了把閱覽權限開放給服務帳戶的 Client Email，否則將無法透過 API 存取資料。

{% asset_img ga_resource_id.png %}

此外，還必須取得「資源數據編號」，別搞錯，這個可不是追蹤編號喔！完成後，使用以下方式即可取得資料。

```plain
Authorization: Bearer {oauth2-token}

GET https://www.googleapis.com/analytics/v3/data/ga
  ?ids=ga:{id}
  &start-date=2008-10-01
  &end-date=2008-10-31
  &metrics=ga:sessions,ga:bounces
```

## 後記

{% youtube QAUk9Q3yziw %}

這篇文章最難的部份大概就是如何產生出 JWT，其他部分就只是向 Google 請求資料而已，沒什麼好解釋的，所以我接下來就寫些廢話吧。

這季有一部雖然看起來很普通，而且連名稱也有「普通」這詞的動畫《[普通の女子校生が【ろこどる】やってみた](http://www.tbs.co.jp/anime/locodol/)》，我原本以為這只是一部普通的地區推銷動畫，沒想到女二卻是一名サイコレズ！如果各位喜歡百合的話，請務必要看看這部動畫！

週末時我花了一小時的時間把筆電升級到 Yosemite Beta，接下來我大概會寫一篇文章講述關於此系統的心得；7 月 22 日起，[.moe] 網域開放一般註冊，於是我買了 [maji.moe]，未來大概會開放子網域的申請服務，目前正在研究如何利用 Go 語言架站。

[Google Developer Console]: https://console.devlopers.google.com
[request]: https://github.com/mikeal/request
[.moe]: http://nic.moe/
[maji.moe]: http://maji.moe/
