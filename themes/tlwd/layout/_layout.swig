<!DOCTYPE html>
<html lang="zh-TW">
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

  <!-- Google fonts -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap&text=Zespia0123456789">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inconsolata&display=swap">

  <!-- Open graph -->
  {{ open_graph({ twitter_id: 'tommy351', fb_admins: '100000247608790', language: 'zh_TW' }) }}

  <!-- Google Analytics -->
  {{ partial('_partial/google-analytics') }}
</head>
<body class="bg-background text-content antialiased scrollbar-dark">
  <div class="container max-w-3xl mx-auto px-4 flex flex-col min-h-screen">
    <div class="flex-grow">
      {{ partial('_partial/header') }}
      {{ body }}
    </div>
    <div class="flex-shrink-0">
      {{ partial('_partial/footer') }}
    </div>
  </div>
</body>
</html>
