{% macro defer_css(href) %}
{# We must use single quotes here because Netlify will replace the href with CDN links. #}
<link rel='preload' href='{{ href }}' as='style' onload='this.onload=null;this.rel="stylesheet"'>
<noscript><link rel='stylesheet' href='{{ href }}'></noscript>
{% endmacro %}

<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com/" crossorigin>
  <link rel="dns-prefetch" href="https://fonts.googleapis.com/">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">
  <link rel="dns-prefetch" href="https://{{ config.disqus_shortname }}.disqus.com/">
  <title>{{ page_title() }}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  {{ open_graph({ twitter_id: 'tommy351', fb_admins: '100000247608790', language: 'zh_TW' }) }}
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap&text=Zespia0123456789">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inconsolata&display=swap">
  {{ css('css/tlwd-style') }}
  <link rel="icon" href="/favicon.png">
  {{ defer_css('/css/prism/vsc-dark-plus.css') }}
  {{ defer_css('https://cdn.jsdelivr.net/npm/prismjs@' + theme.prism_version + '/plugins/line-numbers/prism-line-numbers.css') }}
  {{ defer_css('https://cdn.jsdelivr.net/npm/prismjs@' + theme.prism_version + '/plugins/toolbar/prism-toolbar.css') }}
  {{ defer_css('https://cdn.jsdelivr.net/npm/lightgallery.js@' + theme.lightgallery_version + '/dist/css/lightgallery.min.css') }}
  {{ partial('_partial/google-analytics') }}
</head>
