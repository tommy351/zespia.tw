{{ defer_css('https://cdn.jsdelivr.net/npm/prismjs@' + theme.prism_version + '/plugins/line-numbers/prism-line-numbers.css') }}
{{ defer_css('https://cdn.jsdelivr.net/npm/prismjs@' + theme.prism_version + '/plugins/toolbar/prism-toolbar.css') }}

<script src="https://cdn.jsdelivr.net/npm/clipboard@2.0.6/dist/clipboard.min.js" defer></script>

<script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/components/prism-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/autoloader/prism-autoloader.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/line-numbers/prism-line-numbers.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/toolbar/prism-toolbar.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@{{ theme.prism_version }}/plugins/show-language/prism-show-language.min.js" defer></script>

<script src="/js/prism-hooks.js" defer></script>
