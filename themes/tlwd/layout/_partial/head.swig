<head>
  <meta charset="utf-8">

  <!-- Prefetch -->
  <link rel="preconnect" href="https://fonts.googleapis.com/" crossorigin>
  <link rel="dns-prefetch" href="https://fonts.googleapis.com/">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">

  <!-- Meta -->
  <title>{{ page_title() }}</title>
  {% if !is_post() %}
  <meta name="description" content="A blog about web development and programming.">
  {% endif %}
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="manifest" href="/manifest.json">
  {% for size in [32, 48, 96, 128, 144, 192, 256, 512] %}
    <link rel="icon" href="/images/icons/logo.{{ size }}w.png" sizes="{{ size }}x{{ size }}">
  {%- endfor %}
  <meta name="theme-color" content="#7f9cf5">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="{{ config.title }}">

  {% for size in [120, 152, 180] %}
  <link rel="apple-touch-icon" href="/images/icons/logo.{{ size }}w.png" sizes="{{ size }}x{{ size }}">
  {%- endfor %}

  <!-- Google fonts -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap&text=Zespia0123456789">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inconsolata&display=swap">

  <!-- CSS -->
  {{ css('css/tlwd-style') }}
  {{ defer_css('/css/prism/vsc-dark-plus.css') }}

  <!-- Open graph -->
  {{ open_graph({ twitter_id: 'tommy351', fb_admins: '100000247608790', language: 'zh_TW' }) }}

  <!-- 3rd party libs -->
  {{ partial('prism')}}
  {{ partial('lightgallery') }}

  <!-- Google Analytics -->
  {{ partial('_partial/google-analytics') }}
</head>
