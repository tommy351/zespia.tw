<!DOCTYPE html>
<html lang='zh-TW'>
{{ partial('_partial/head') }}
<body class="bg-background text-content antialiased scrollbar-dark">
  <div class="container max-w-3xl mx-auto px-4">
    {{ partial('_partial/header') }}
    {{ body }}
    {{ partial('_partial/footer') }}
  </div>
  <script src="https://cdn.jsdelivr.net/npm/@dotsunited/load-css-polyfill@1.2.0/dist/load-css-polyfill.auto.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/clipboard@2.0.6/dist/clipboard.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/components/prism-core.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/autoloader/prism-autoloader.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/line-numbers/prism-line-numbers.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/toolbar/prism-toolbar.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/show-language/prism-show-language.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lightgallery.js@{{ theme.lightgallery_version }}/dist/js/lightgallery.min.js"></script>
  {{ js('js/lightgallery-init') }}
  {{ js('js/prism-hooks') }}
</body>
</html>
