---
title: 在 Flutter 監聽音量按鈕的事件
tags:
  - Flutter
  - Dart
comment_service: utterances
---
繼{% post_link eh-redux-flutter 上一篇文章 %}提到了用 Channel 實作 [Flutter] 和 Android/iOS 之間的通訊。本文將會示範如何用 Channel 來監聽音量按鈕的事件，因為我手邊只有 Android 裝置，所以會用 Kotlin 來示範。

[EH Redux] 有一個功能就是能夠使用音量鍵來控制圖片翻頁，這項功能因為目前 [Flutter] 還沒有官方支援，所以必須要在 Android/iOS 這邊自己寫程式去補足。

<!-- more -->

## MethodChannel

[MethodChannel] 用於單次的非同步執行，這次我會用在切換音量控制是否開啟，因為 Flutter 在 Android 上預設只會有一個 [FlutterActivity](https://api.flutter.dev/javadoc/io/flutter/embedding/android/FlutterActivity.html)，無論在哪個畫面背後實際上都是同一個 activity，而音量控制只會用在圖片瀏覽的畫面上，所以必須動態切換音量控制，否則在其他畫面上也會受到影響。

首先是 Android 的部分，在 `MainActivity` 裡實作 `configureFlutterEngine` 方法，然後在裡面建立一個 `MethodChannel`，用來監聽從 Flutter 傳來的事件。

```kotlin
// 用這個變數來控制要不要攔截 keydown 事件
private var interceptKeyDownEnabled = false

override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
  super.configureFlutterEngine(flutterEngine)

  // Method channel 的名字可以隨便取，只要確保在 Android/iOS 和 Flutter 兩邊用的名字一致就好了
  MethodChannel(flutterEngine.dartExecutor, "com.example/method").setMethodCallHandler { call, result ->
    when (call.method) {
      "interceptKeyDown" -> {
        interceptKeyDownEnabled = true
        // 如果成功的話就用 result.success 回傳結果
        result.success(true)
        // 失敗的話則是用 result.error 回傳錯誤
        // result.error("ERROR_CODE", "error message", null)
      }
      "uninterceptKeyDown" -> {
        interceptKeyDownEnabled = false
        result.success(true)
      }
      else -> {
        // 其他沒有 handle 到的 method 就回傳 result.notImplemented
        result.notImplemented()
      }
    }
  }
}

override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
  if (interceptKeyDownEnabled) {
    // 攔截 keydown 事件
    return true
  }

  return super.onKeyDown(keyCode, event)
}
```

接下來是 Flutter 的部分，這部分比較簡單，用 `MethodChannel` 的 `invokeMethod` 就能執行上面在 Android 定義的程式碼。

```dart
final methodChannel = MethodChannel('com.example/method');

// 開始攔截 keydown 事件
await methodChannel.invokeMethod('interceptKeyDown');

// 停止攔截 keydown 事件
await methodChannel.invokeMethod('uninterceptKeyDown');
```

到此為止就能夠從 Flutter 切換音量控制了。

## EventChannel

[EventChannel] 用於讓 Flutter 監聽從 Android/iOS 傳來的事件，這次會用在監聽 keydown 事件。

首先是 Android 的部分，在原本的 `configureFlutterEngine` 額外新增了一個 `EventChannel`，並用 Rx subject 來傳遞 keydown 事件。

```kotlin
private var interceptKeyDownEnabled = false

// 用 Rx 來傳遞事件，也可以改用其他類似的 library
private val keyDownSubject = PublishSubject.create<String>()

override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
  super.configureFlutterEngine(flutterEngine)

  MethodChannel(flutterEngine.dartExecutor, "com.example/method").setMethodCallHandler { call, result ->
    // ...
  }

  // Event channel 的名字可以隨便取，只要確保在 Android/iOS 和 Flutter 兩邊用的名字一致就好了
  EventChannel(flutterEngine.dartExecutor, "com.example/event").setStreamHandler(object : StreamHandler {
    var dispose: Disposable? = null

    override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
      // 開始訂閱事件
      dispose = keyDownSubject.subscribeBy (
        onNext = { events?.success(it) },
        onError = { events?.error("KEY_DOWN_EVENT", it.message, it) },
        onComplete = { events?.endOfStream() }
      )
    }

    override fun onCancel(arguments: Any?) {
      // 停止訂閱事件
      dispose?.dispose()
      dispose = null
    }
  })
}

override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
  if (interceptKeyDownEnabled) {
    // 在按下音量 +/- 鍵的時候，送事件到 Rx subject 並攔截 keydown 事件
    when (keyCode) {
      KeyEvent.KEYCODE_VOLUME_DOWN -> {
        keyDownSubject.onNext("volumeDown")
        return true
      }
      KeyEvent.KEYCODE_VOLUME_UP -> {
        keyDownSubject.onNext("volumeUp")
        return true
      }
    }
  }

  return super.onKeyDown(keyCode, event)
}
```

接下來是 Flutter 的部分，用 `EventChannel` 的 `receiveBroadcastStream` 就能接收事件。

```dart
final eventChannel = EventChannel('com.example/event');

// 訂閱事件
final subscription = eventChannel.receiveBroadcastStream().listen((event) {
  final code = event as String;
});

// 取消訂閱
subscription.cancel();
```

這樣就能從 Flutter 監聽音量鍵的事件了，實際上的範例可以參考 [EH Redux] 的 [MainActivity.kt](https://github.com/tommy351/eh-redux/blob/v0.5.1/android/app/src/main/kotlin/app/ehredux/MainActivity.kt) 和 [key_event.dart](https://github.com/tommy351/eh-redux/blob/master/lib/utils/key_event.dart)；更複雜一點的可以參考 [hardware_buttons]，它同時實作了 Android 和 iOS 的部分。

## 結語

上上週的時候把 [P5S](https://p5s.jp/) 玩完一輪了，這真的是一款非常優秀的遊戲，與其說是無雙，不如說更像動作 RPG，需要花一點時間適應；而劇情上也很不錯，補完了一些原本在本傳裡戲份比較少的角色劇情，像是佑介和春，感覺角色更加生動了。

那麼究竟是為什麼明明遊戲都玩完了，卻還是沒有繼續開發 app 呢，主要是因為最近接觸到[赤井はあと](https://www.youtube.com/channel/UC1CfXB_kRs3C-zaeTG3oGyg)拍的一堆狂氣廢片後，讓我開始踏入 Hololive 的坑，又開始浪費時間看 Vtuber 了😜。我預計從這周末開始應該就會重啟開發，應該吧。

[Flutter]: https://flutter.dev/
[MethodChannel]: https://api.flutter.dev/flutter/services/MethodChannel-class.html
[EventChannel]: https://api.flutter.dev/flutter/services/EventChannel-class.html
[EH Redux]: https://github.com/tommy351/eh-redux/
[hardware_buttons]: https://pub.dev/packages/hardware_buttons
