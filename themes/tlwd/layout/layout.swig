<!DOCTYPE html>
<html lang='zh-TW'>
{{ partial('_partial/head') }}
<body class="bg-background text-content antialiased scrollbar-dark">
  <div class="container max-w-3xl mx-auto px-4">
    {{ partial('_partial/header') }}
    {{ body }}
    {{ partial('_partial/footer') }}
  </div>
  {{ js('js/register-sw') }}
</body>
</html>
