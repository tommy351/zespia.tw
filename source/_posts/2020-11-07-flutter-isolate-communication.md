---
title: Flutter 的 Isolate 通訊
tags:
  - Flutter
  - Dart
comment_service: utterances
---
九月時 {% post_link eh-redux-flutter EH Redux %} 0.6 終於發布了，這個版本最主要的改進就是下載功能，之所以 0.5 和 0.6 之間隔了這麼久，其實是因為我花了一些時間重寫了幾乎全部的程式碼，前景（foreground）和背景（background）之間的資料同步也讓我卡關了很久。

<!-- more -->

## Moor

{% asset_img foreground-only.svg %}

我目前使用 Moor 做為 ORM，這個 library 的預設使用方式是在前景連接資料庫，在大多數情況下不會有效能問題，是最簡單的使用方式。

```dart
LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(join(dir.path, 'db.sqlite'));
    return VmDatabase(file);
  });
}
```

{% asset_img fg-and-bg.svg %}

一開始實作下載功能時，我是在前景和背景分別連接資料庫，雖然兩方都可以正常讀取和寫入資料，但是無法監聽資料變動，而且如果同時寫入同一筆資料的話，可能會引發 lock。

以我的例子來說，當背景正在下載時，雖然可以正常把進度寫入到資料庫，但是前景不會觸發更新；當前景暫停或取消下載時，如果背景作業也剛好正在寫入下載進度的話，則會造成死鎖。

關於這個問題，在 GitHub 上有相關的 [issue](https://github.com/simolus3/moor/issues/637) 討論，結論是，如果前景和背景同時執行 migration 的話，可能會造成資料不一致。如果背景確定不會執行 migration，且背景不會干涉前景的話，那就無須特別處理，前景和背景各自連接資料庫即可，否則需要利用 `SendPort` / `ReceivePort` 讓前景和背景共用同一個 `MoorIsolate`。

## Isolate 之間的通訊

在 Dart 裡面，所有的程式都在 [`Isolate`](https://api.flutter.dev/flutter/dart-isolate/Isolate-class.html) 裡執行，不同的 `Isolate` 之間如果要通訊的話，就要透過 `ReceivePort`/`SendPort` 來傳送和接收訊息。除此之外，Dart 還有另一個 [`IsolateNameServer`](https://api.flutter.dev/flutter/dart-ui/IsolateNameServer-class.html) class，用來註冊 global 的 `SendPort`。

舉例來說，假設有兩個 isolate 要通訊，其中一個是接收端，另一個則是發送端。

首先接收端要先建立一個 `ReceivePort`，然後在 `IsolateNameServer` 註冊 `ReceivePort.sendPort`。這裡要注意的是，如果 port 已經被註冊的話，必須要先移除原本註冊的 port，否則新註冊的 port 不會覆蓋掉原本舊的 port。

```dart
final receivePort = ReceivePort();

receivePort.listen((msg) {
  // Message received
});

// 如果要覆蓋的話，必須要先移除原本註冊的 port
// IsolateNameServer.removePortNameMapping('example');

IsolateNameServer.registerPortWithName(receivePort.sendPort, 'example');
```

註冊完成後，發送端就可以用指定的名稱來搜尋已註冊的 port。

```dart
final port = IsolateNameServer.lookupPortByName('example');
port?.send('ping');
```

## 改用 Isolate 連接資料庫

{% asset_img fg-and-bg-via-isolate.svg %}

首先，必須讓 Moor 產生 Isolate 相關的程式碼，在專案根目錄的 `build.yaml` 新增以下內容後，重跑 `flutter pub run build_runner build` 即可。

```yaml
targets:
  $default:
    builders:
      moor_generator:
        options:
          generate_connect_constructor: true
```

接著要改寫 Database class。

```dart
// 這個 class 用來包裝要傳到 isolate 的資料
class _Request {
  _Request(this.sendPort, this.targetPath);

  final SendPort sendPort;
  final String targetPath;
}

void _startBackground(_Request request) {
  // 建立新的 VmDatabase
  final executor = VmDatabase(File(request.targetPath));

  // 因為目前的函數已經在背景 isolate 執行了，所以這邊直接讓 Moor 在目前的 isolate 啟動
  final moorIsolate = MoorIsolate.inCurrent(
    () => DatabaseConnection.fromExecutor(executor),
  );

  // 把 moorIsolate 回傳給 sendPort
  request.sendPort.send(moorIsolate);
}

Future<MoorIsolate> _createMoorIsolate() async {
  // 資料庫檔案的路徑
  final dir = await getApplicationDocumentsDirectory();
  final path = join(dir.path, 'db.sqlite');

  // 建立新的 ReceivePort
  final receivePort = ReceivePort();

  // 在新的 isolate 裡執行 _startBackground
  await Isolate.spawn(
    _startBackground,
    _Request(receivePort.sendPort, path),
  );

  // 等待 receivePort 回傳的 MoorIsolate
  return await receivePort.first as MoorIsolate;
}

@UseMoor()
class Database extends _$Database {
  // 這個新的 factory 函數用來從 DatabaseConnection 產生 Database instance
  Database.connect(DatabaseConnection connection) : super.connect(connection);
}

Future<void> main() async {
  final isolate = await _createMoorIsolate();
  final db = Database.connect(await isolate.connect());
  // 現在可以照常使用 db 了
}
```

## 共用資料庫連接

{% asset_img moor-isolate-flow.svg %}

為了要讓背景能夠共用前景的資料庫連接，我在前景資料庫連接成功後，註冊一個 `ReceivePort` 用來傳送 `MoorIsolate.connectPort`。

```dart
const _requestPortName = 'database.request';
const _instancePortName = 'database.instance';

void shareIsolate(MoorIsolate isolate) {
  // 建立一個 ReceivePort
  final requestPort = ReceivePort();

  // 監聽 requestPort 的事件，當接收到事件時，把 connectPort 回傳給 instancePort
  requestPort.listen((message) {
    final instancePort =
        IsolateNameServer.lookupPortByName(_instancePortName);
    instancePort?.send(isolate.connectPort);
  });

  // 移除先前註冊的 requestPort
  IsolateNameServer.removePortNameMapping(_requestPortName);

  // 註冊 requestPort
  IsolateNameServer.registerPortWithName(
      requestPort.sendPort, _requestPortName);
}
```

背景方面則是先去尋找前景註冊的 port，如果有的話就對該 port 發送事件並等待回傳的 `connectPort`，否則就建立一個新的 `MoorIsolate`。

```dart
Future<MoorIsolate> reuseIsolate() async {
  // 尋找已註冊的 requestPort
  final requestPort =
      IsolateNameServer.lookupPortByName(_requestPortName);
  if (requestPort == null) return null;

  // 建立一個 ReceivePort 用來接收 connectPort
  final instancePort = ReceivePort();

  try {
    // 註冊 instancePort
    IsolateNameServer.registerPortWithName(
        instancePort.sendPort, _instancePortName);

    // 對 requestPort 發送事件
    requestPort.send(null);

    // 等待回傳的 connectPort
    final connectPort = await instancePort.first as SendPort;

    // 利用剛剛回傳的 connectPort 建立 MoorIsolate
    return MoorIsolate.fromConnectPort(connectPort);
  } finally {
    // 最後，移除並關閉 instancePort
    IsolateNameServer.removePortNameMapping(_instancePortName);
    instancePort.close();
  }
}
```
