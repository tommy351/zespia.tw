---
title: EH Redux – 試用 Flutter 重寫 Android App
tags:
  - Flutter
  - Dart
  - E-Hentai
comment_service: utterances
---
{% asset_img cover.jpg %}

最近心血來潮，決定重新開始學習打從一年前就想玩玩看的 [Flutter]，試試看能不能做出我廢棄多年的 {% post_link ehreader-android %}。

[Flutter] 是 Google 開發的跨平台 UI toolkit，可以同時支援 Android、iOS 和 Web，其原理就是用 canvas 來繪製所有的 UI，不需要像 [React Native] 一樣得在 UI 和 JavaScript engine 兩邊互相溝通而導致效能問題。

另一個優勢就是 [Flutter] 本身已經提供了非常完整的 UI library，無論是 Android 或 iOS 風格皆有對應的元件可直接取用，雖然有些時候可能會發現和原生的 UI 在外觀或是動畫上有些微妙的差異，但整體來說已經非常實用了。

本文會以 Web 的角度來分析 [Flutter] 的優缺點，因為我比較熟 [React]，所以主要會拿它來做比較。

<!-- more -->

## Declarative UI

[Flutter] 和 [React] 一樣都是採用 Declarative 的形式來建構 UI，這似乎是最近越來越流行的做法。Android 現在有 [Jetpack Compose](https://developer.android.com/jetpack/compose)，iOS 有 [SwiftUI](https://developer.apple.com/xcode/swiftui/)。

和傳統的 Imperative 比較的話，最明顯的差別就是，不需要在狀態更新的時候手動更新對應的元素；Declarative 只要定義好介面，程式就會自動去判斷哪些元素需要更新。

### 語法

[React] 可以用 [JSX](https://reactjs.org/docs/introducing-jsx.html)，語法會比較接近 HTML，在編譯時會把它轉換成對應的 JavaScript。

```jsx
<div className="foo">Hello</div>
React.createElement('div', {className: 'foo'}, 'Hello')
```

[Flutter] 就沒有提供這種語法，所有 widget 都是 class。

```dart
// new 可以省略
new Text('Hello')
```

由於 [Flutter] 不是用 CSS 來宣告元件的樣式，而是把各種樣式實作在不同的 widget 上。舉例來說 padding 就有一個獨立的 widget。

```dart
Padding(
  padding: EdgeInsets.all(8),
  child: Text('Hello')
)
```

有些情況如果 widget 層級過深的話，比起 JSX 或 HTML 來說，要搬移或是修改會稍微困難一點。好在 IDE 提供了非常方便的功能，可以輕鬆的修改 widget 層級。

{% asset_img widget-context-actions.png %}

### 狀態

[Flutter] 的 widget 分為兩種：[`StatelessWidget`](https://api.flutter.dev/flutter/widgets/StatelessWidget-class.html) 是不儲存狀態的 widget，類似 [React] 的 function component。這種 widget 不需要管理任何狀態或生命週期，只需要把 UI 建構出來就好了，會在屬性變動的時候自動更新。

```dart
class Foo extends StatelessWidget {
  const Foo({
    Key key,
    this.name,
  }) : super(key: key);

  final String name;

  @override
  Widget build(BuildContext context) {
    return Text('Hello $name');
  }
}
```

[`StatefulWidget`](https://api.flutter.dev/flutter/widgets/StatefulWidget-class.html) 則是類似 [React] 的 class component，本身可儲存狀態，也有生命週期。這種 widget 會分為兩個 class，一個是用來建立狀態的 `StatefulWidget` class，另一個則是儲存狀態用的 `State` class。在 `State` class 裡，可以用 `setState` 來更新狀態。

```dart
class Foo extends StatefulWidget {
  @override
  _FooState createState() => _FooState();
}

class _FooState extends State<Foo> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return FlatButton(
      child: Text('You have clicked $count times'),
      onPressed: () {
        setState(() {
          count++;
        });
      },
    );
  }
}
```

### Hot Reload

[Flutter] 本身對於 hot reload 的支援非常好，任何改變幾乎都能在兩秒左右就反映在裝置上，即便是有儲存狀態的 `StatefulWidget`，也能把狀態保留下來更新裡面的內容，即便是部分[特殊情況](https://flutter.dev/docs/development/tools/hot-reload#special-cases)，通常也能用 hot restart 的方式重開，無需等待重新編譯的時間，大幅增進了開發效率。

## Dart

[Flutter] 採用 [Dart] 做為開發的程式語言，雖然和 [Go] 一樣都是由 Google 出品，但兩者的差異非常大，各有優缺點。我覺得 Google 應該融合這兩個程式語言的優點，再開發一個更好的版本。

### Nullable

目前 Dart 所有型別都是 nullable 的（[Null safety](https://dart.dev/null-safety) 仍在 tech preview，我還沒用過），就連原始型別（primitive types，如 `boolean`, `int`, `double`）也是 nullable，這點和我用過的 JavaScript 或 Go 不同，導致一開始踩到一些雷。

目前 Dart 有幾種方法可以緩解這個問題，一種是以 `@required` annotation 來標示必須的變數，這樣在 IDE 或 analyzer 都能透過靜態檢查確認有沒有設值。

```dart
void foo({@required String bar}) {}
```

另一種則是用 [`assert`](https://dart.dev/guides/language/language-tour#assert) function 檢查，但是這個只能在開發模式下使用，在正式環境時會被完全忽略掉。

```dart
assert(value != null);
```

不過 [Dart] 有個優點，就是支援 optional chaining 和 nullish coalescing。這些功能稍微緩解了 nullable 的問題，讓平常習慣寫 [TypeScript] 的我感到非常親切。

```dart
foo?.bar?.baz ?? value;
a ??= value;
```

### Code Generating

[Dart] 和 [Go] 一樣，都很依賴 code generating。我覺得 [Dart] 用到 code generating 的頻率更勝於 Go，例如：

- Immutable data：[built_value](https://pub.dev/packages/built_value), [freezed](https://pub.dev/packages/freezed)
- 資料流：[mobx](https://pub.dev/packages/mobx)
- ORM：[moor](https://pub.dev/packages/moor)
- JSON：[json_serializable](https://pub.dev/packages/json_serializable)

這些 library 是我這次寫 app 有用到的，它們都非常依賴 code generating，相比之下 [Go] 多半依賴於反射。這樣的好處是執行時效能更好、更加安全，但壞處就是每次改動都需要重新跑 codegen，像我寫的這個小 app 每次重跑都需要半分鐘。

### 工具

[Dart] 本身也提供了很多好用的工具，像 [Go] 一樣，[Dart] 也有 [dartfmt](https://dart.dev/tools/dartfmt)，用來格式化程式碼，這樣可以讓多數用 Dart 寫的程式看起來都很接近。

除此之外，還有 [dartanalyzer](https://github.com/dart-lang/linter)，用來檢查語法問題，這個工具本身就內建了很多規則，但多半都需要手動開啟，我現在是用 [lint](https://github.com/passsy/dart-lint)，它本身開啟了很多有用的規則。

## 原生部分

我原本以為這次寫 [Flutter] 可以完全不需要碰到任何 Android 的原生部分，結果有些部分還是得寫一些 Kotlin 才能實作。

### 全螢幕

[Flutter] 雖然提供了方法可以隱藏上方的狀態列（status bar）和下方的導覽列（navigation bar）。

```dart
// 把 top 或 bottom 從這個 array 移除掉的話，就能隱藏對應的系統狀態/導覽列
SystemChrome.setEnabledSystemUIOverlays([
  SystemUiOverlay.top,
  SystemUiOverlay.bottom,
]);
```

然而現在很多手機螢幕會有瀏海或挖洞，在 Android 顯示和隱藏系統狀態列的時候，會導致整個畫面跳動，必須要在 Android 設定才可以讓畫面延伸到最上方。

```xml
<item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
```

另一個問題就是預設下方的系統導覽列是黑色的，如果要改透明的話也要在 Android 這邊設定。（參考：[flutter#34678](https://github.com/flutter/flutter/issues/34678#issuecomment-536028077), [flutter#40974](https://github.com/flutter/flutter/issues/40974#issuecomment-645413064)）

```xml
<item name="android:windowTranslucentStatus">true</item>
<item name="android:windowTranslucentNavigation">true</item>
```

```kotlin
window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
  View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
```

### 硬體按鈕

硬體按鈕（例如音量鍵、返回鍵等）目前官方還不支援，雖然已經有現成的 [hardware_buttons](https://pub.dev/packages/hardware_buttons) 套件能夠直接使用，但因為我想研究看看 [Flutter] 和 Android 之間的通訊，所以就自己實作看看了。我覺得實際上不會很難實作，只是相對來說可能除錯比較麻煩一點而已。

[Flutter] 對於平台本身的通訊有兩種，一種是 [MethodChannel](https://api.flutter.dev/flutter/services/MethodChannel-class.html)，用於單次的非同步執行；另一種則是 [EventChannel](https://api.flutter.dev/flutter/services/EventChannel-class.html)，用來監聽連續的事件。

因為這部分似乎寫起來會有點長，我決定放在之後的文章，各位如果有興趣的話可以先看官方的[教學](https://flutter.dev/docs/development/platform-integration/platform-channels)或[範例](https://github.com/flutter/flutter/tree/master/examples/platform_channel)。

## 結語

目前為止 [Flutter] 大概寫了三週左右，我覺得其實開發體驗意外的和 [React] 蠻接近的，兩者都提供了 declarative UI 和 hot reload，也有 Redux 或 MobX 可以用。

{% asset_img pkg-score.png %}

差別大概在於 JavaScript 生態系實在太龐大，有時候選擇困難，光是挑個 library 可能就會浪費好幾天；寫 Flutter 就沒這種困擾了，本身套件庫沒那麼龐大，且每個套件都有[評分](https://pub.dev/help#scoring)和 [Flutter Favorite](https://flutter.dev/docs/development/packages-and-plugins/favorites) 標誌做為參考，相對來說比較好選擇。

最後各位如果有興趣的話，可以下載 [EH Redux](https://github.com/tommy351/eh-redux/) 來玩玩看，雖然最近沉迷於 [P5S](https://p5s.jp/) 所以開發會停滯幾週，但目前除了下載以外的主要功能大致上都完成了，如果在使用時有遇到問題的話歡迎到 GitHub 留 issue。

[Flutter]: https://flutter.dev/
[Dart]: https://dart.dev/
[Go]: https://golang.org/
[TypeScript]: https://www.typescriptlang.org/
[React]: https://reactjs.org
[React Native]: https://reactnative.dev/
