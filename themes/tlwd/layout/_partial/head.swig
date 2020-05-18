<head>
  <meta charset="utf-8">

  <!-- Prefetch -->
  <link rel="preconnect" href="https://fonts.googleapis.com/" crossorigin>
  <link rel="dns-prefetch" href="https://fonts.googleapis.com/">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net/">

  <!-- Meta -->
  <title>{{ page_title() }}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" href="/favicon.png">

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
