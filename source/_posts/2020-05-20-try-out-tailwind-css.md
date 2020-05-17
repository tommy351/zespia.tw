---
title: 試用 Tailwind CSS 重寫主題
tags:
  - Tailwind
  - CSS
comment_service: utterances
---
{% asset_img tailwind-css-intro.png %}

上週試著用 [Tailwind CSS] 重新打造了網誌的主題，一開始使用的時候，覺得一直翻文件很煩，因為大部分的 CSS 規則大概都知道怎麼寫，卻得要翻文件才知道對應的 class；但寫了一段時間後，開始覺得還不錯，大部分的 class 都很容易預測，也很容易根據需求客製變數或外掛。

跟 [Bootstrap] 或 [Semantic UI] 這類 UI library 相比，Tailwind CSS 不提供現成的元件（另有提供須付費的 [Tailwind UI]），而是把每個 CSS 規則都寫成單獨的 class，因此即便完全不寫 CSS，只要在 HTML 中設定 class，也很容易能夠拼湊出想要的樣式，但缺點就是還是需要有基本的 CSS 知識才能上手。

<!-- more -->

## 安裝

首先用 npm 或 yarn 安裝 [tailwindcss](https://www.npmjs.com/package/tailwindcss)。

```shell
npm install tailwindcss
```

可以搭配 [PostCSS](https://postcss.org/) 使用。

```js
const postcss = require('postcss');

postcss([
  require('tailwindcss'),
  require('autoprefixer')
]);
```

## 使用方式

Tailwind 本身只需要在 CSS 的開頭加上下列語法就能使用，這包含了 [normalize.css] 和所有可能會用到的 class，展開來大約會有數萬行之多。但是無須擔心，在正式環境下，Tailwind 會利用 [PurgeCSS] 把沒用到的 class 都清掉，像是本網誌在正式環境下，尚未壓縮過的 CSS 大約不到千行。

```css
@tailwind base;

@tailwind components;

@tailwind utilities;
```

### HTML

引入基本 class 後，就能直接在 HTML 使用。舉例來說，一個按鈕可以寫成：

```html
<button class="rounded p-4 border-indigo-500 text-base">
</button>
```

上面的 HTML 裡，每個 class 都各自代表了下列的 CSS 規則。

```css
.rounded { border-radius: .25rem }
.p-4 { padding: 1rem }
.border-indigo-500 { border-color: #667EEA }
.text-base { font-size: 1rem }
```

這就是 Tailwind 提倡的 [Utility-First](https://tailwindcss.com/docs/utility-first) 概念，因為每個 class 都非常基本，因此很容易組合，不需要特地想每個元件的 class name，也不會每加一個新元件就多一個 class，只要直接使用 Tailwind 提供的 class 就好。

### Variants

只要在原本的 class 前面加上 prefix，就能支援 [pseudo class](https://tailwindcss.com/docs/pseudo-class-variants) 和 [responsive design](https://tailwindcss.com/docs/responsive-design)。

```html
<button class="rounded p-4 border-indigo-500 text-base hover:font-bold lg:text-lg">
</button>
```

舉例來說，在原本的按鈕加上兩個新的 class `hover:font-bold lg:text-lg`。它們分別代表：

```css
.hover\:font-bold:hover {
  font-weight: bold;
}

@media (min-width: 1024px) {
  .lg\:text-lg {
    font-size: 1.125rem;
  }
}
```

### CSS

如果要重複使用元件的話，也可以在 CSS 使用 `@apply` directive。舉例來說，上面的按鈕就可以寫成：

```css
.btn {
  @apply rounded p-4 border-indigo-500 text-base;
}
```

有些情況直接寫 CSS 會更方便，例如 nested elements，或是 pseudo elements（`::before`, `::after`），本網站左上角和右下角的「」，以及暗色系的捲軸就是這樣實作的。

## 結論

對我來說 Tailwind CSS 的確能提升開發效率，大幅節省了我寫 CSS 的時間，幾乎大部分的元件都能直接在 HTML 寫 class 就好。

它本身的命名系統也很不錯，顏色在 `background-color`、`color`、`border-color` 等各種情境下都是通用的，所以只需要記下 prefix 就好。我還另外設定了顏色的 alias，這樣就能在任何地方使用指定的顏色，例如 `bg-accent`、`text-accent`，一看名字就知道意思。

數字的部分變化就稍微多一點，`margin` 和 `padding` 是以數字命名，`font-size` 則是用 `sm`、`lg`、`xl` 命名，`line-height` 甚至是數字和名詞混用。我在使用的時候覺得這些單位的選擇都很符合我的需求，或許這些以非數字來命名的 class 就是設計者認為的最佳單位？

[Tailwind CSS]: https://tailwindcss.com/
[Bootstrap]: https://getbootstrap.com/
[Semantic UI]: https://semantic-ui.com/
[Tailwind UI]: https://tailwindui.com/
[normalize.css]: https://necolas.github.io/normalize.css/
[PurgeCSS]: https://purgecss.com/
