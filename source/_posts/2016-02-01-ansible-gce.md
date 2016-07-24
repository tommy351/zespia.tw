---
title: 使用 Ansible 管理 Google Compute Engine
tags:
- Ansible
- DevOps
- Google Cloud Platform
---
最近忙著佈署新的測試伺服器，而 Google Cloud Platform 剛好有提供 $300 兩個月的免費試用，且在台灣又有設點，所以我就決定拿 Google Compute Engine 來建置測試伺服器了。

## Dynamic inventory

在開始之前，先稍微解釋一下何謂 Ansible 的 inventory，inventory 即代表伺服器，在 Ansible 中，可把伺服器列在 inventory file 中，藉此來分類伺服器，例如：

``` ini
[webservers]
1.2.3.4 ansible_ssh_user=john 
5.6.7.8 ansible_ssh_user=john

[dbservers]
9.10.11.12 ansible_ssh_user=mary
```

然而伺服器一多，管理 inventory file 就顯得有些麻煩，這時可以利用 [dynamic inventory]，只要把 inventory file 指定為可執行檔，Ansible 就能從執行檔的輸出中取得 inventory 資料。

Ansible 官方提供了各種主流主機商的 dynamic inventory，可以直接取用，而 GCE 當然也沒有缺席：<http://docs.ansible.com/ansible/guide_gce.html>。

<!-- more -->

## 服務帳戶

為了要從 Google API 動態取得伺服器資料，必須申請一個服務帳戶，在申請之前，請先確認 Google Compute Engine 的 API 權限是否已經開啟。

{% asset_img api-enabled.png %}

接著，申請一個服務帳戶，並順便建立私密金鑰。雖然 Ansible 官方教學使用 P12 金鑰，但其實 P12 金鑰已經棄用了，建議改用 JSON 金鑰，還可以省去金鑰解密的步驟。

{% asset_img create-service-account.png %}

## 設定 gce.ini

準備好服務帳戶和 JSON 金鑰之後，在 <https://github.com/ansible/ansible/tree/devel/contrib/inventory> 下載 `gce.ini` 和 `gce.py` 兩個檔案，並放到 `inventory` 資料夾裡，別忘了要在 `gce.py` 加上執行權限。

``` sh
chmod +x inventory/gce.py
```

安裝 [libcloud]，因為 libcloud 0.20.0 有個 bug 會使得認證失敗，所以必須安裝小於 0.20 的版本。

``` sh
pip install "apache-libcloud<0.20"
```

接著修改 `gce.ini` 的設定，在檔案底部可以看到這三行：

``` ini
gce_service_account_email_address = 
gce_service_account_pem_file_path = 
gce_project_id = 
```

- `gce_service_account_email_address` - 服務帳戶的 Email 位址
- `gce_service_account_pem_file_path` - 金鑰路徑（雖然名稱是 `pem_file`，但是也可使用 JSON）
- `gce_project_id` - 專案 ID

修改完成後應該會像這樣：

``` ini
gce_service_account_email_address = deploy@dcard-staging.iam.gserviceaccount.com
gce_service_account_pem_file_path = credentials/dcard-staging-d6a7cf380e10.json
gce_project_id = dcard-staging
```

可以執行 `gce.py` 看看是否正確設定：

``` sh
inventory/gce.py --list
```

並確認 Ansible 可以透過 SSH 存取伺服器：

``` sh
ansible -i inventory/gce.py -m setup all
```

如果無法存取的話，可以試著透過 Google 官方提供的 [gcloud] 工具設定或是把 public key 新增到中繼資料頁面。

{% asset_img ssh-keys.png %}

## 伺服器標籤

`gce.py` 預設提供了主機位置、規格、作業系統等分類，但實際上不太夠用，可在 Google Developer Console 中新增標籤，這樣 Ansible 就能透過標籤篩選伺服器。

例如在伺服器加上 `mq-server` 和 `staging` 兩個標籤：

{% asset_img server-tag.png %}

就能在 playbook 中使用 `tag_mq-server` 和 `tag_staging`。

## 整合 Travis CI

整合到 CI 聽起來很簡單，但實際上有些坑，因為 CI 的環境比較難 debug，Travis CI 又沒提供 SSH session 的功能，在 debug 時只能不斷 push 然後期待數分鐘後能收到好的結果，我一度想要放棄 Travis CI 轉換到比較容易使用的 [Semaphore]，最後還是花了幾天終於試出正確設定。

### 抓不到 pycrypto

第一個問題就是 Ansible 根本連跑都跑不起來，因為 `gce.py` 沒辦法抓到 pycrypto，紅色的那行字可能會讓你以為是權限問題，並試著照它說的用 `chmod -x`，然而這樣只會在 `chmod +x` 和 `chmod -x` 之間不斷切換而已，這錯誤訊息根本標錯重點了吧。

{% asset_img travis-ci-pycrypto-error.png %}

我試了很多不同的方法來裝 pycrypto，然而並沒有什麼卵用。

``` sh
sudo apt-get install python-dev
sudo easy_install pycrypto
sudo pip install pycrypto
```

最後發現根本不是 pycrypto 有沒有安裝的問題，因為 pycrypto 本來就裝在系統中了，解法意外的簡單，只要使用 **sudo** 權限執行 ansible 即可。

``` sh
sudo ansible-playbook -i inventory/gce.py api.yml
```

### SSH 連線失敗

解決了 pycrypto 的問題之後，以為這樣就能夠順利部署了，然而卻出現了 SSH 連線失敗的問題。

{% asset_img travis-ci-ssh-failed.png %}

我反覆檢查了好幾次 SSH key，也確認 GCE 的設定無誤，但就是無法連線，最後又花了一天才找出原因，[gcloud] 在建立 SSH 連線時會自動幫目前的使用者建立新帳戶，所以每個使用者可能會有不同的 SSH key，而我們現在再來重溫一次 SSH key 設定頁面吧。

{% asset_img ssh-keys.png %}

注意到前面的「使用者名稱」欄位了嗎？這就是使用者對應的 SSH key，一旦知道這個奇怪的坑之後，就非常容易解決了，只要在 Ansible 執行時加上 `-u` 參數指定使用者即可：

``` sh
sudo ansible-playbook -i inventory/gce.py -u SkyArrow api.yml
```

## 後記

{% youtube tY7iZwjW38g %}

最近偶然在 PlayStation Store 上找到《[奧丁領域]》，原本並沒有購買這部遊戲的計畫，不過剛好有點閒錢於是就爽快的買下來了，一玩之後樂不釋手，最近正遊玩到妖精女王的篇章。

[dynamic inventory]: http://docs.ansible.com/ansible/intro_dynamic_inventory.html
[libcloud]: https://libcloud.apache.org/
[Semaphore]: https://semaphoreci.com/
[gcloud]: https://cloud.google.com/sdk/gcloud/
[奧丁領域]: http://atlus-vanillaware.jp/osl/index.html