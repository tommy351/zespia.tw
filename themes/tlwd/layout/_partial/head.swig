{% macro defer_css(href) %}
<link rel="preload" href="{{ href }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{{ href }}"></noscript>
{% endmacro %}

<head>
  <meta charset="utf-8">
  <title>{{ page_title() }}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  {{ open_graph({ twitter_id: 'tommy351', fb_admins: '100000247608790' }) }}
  {{ css('css/style') }}
  <link rel="icon" href="/favicon.png">
  {{ defer_css('/css/prism/atom-dark.css') }}
  {{ defer_css('https://cdn.jsdelivr.net/npm/prismjs@' + theme.prism_version + '/plugins/line-numbers/prism-line-numbers.css') }}
  {{ defer_css('https://cdn.jsdelivr.net/npm/prismjs@' + theme.prism_version + '/plugins/toolbar/prism-toolbar.css') }}
  {{ defer_css('https://cdn.jsdelivr.net/npm/lightgallery.js@' + theme.lightgallery_version + '/dist/css/lightgallery.min.css') }}
  {{ partial('_partial/google-analytics') }}
</head>
