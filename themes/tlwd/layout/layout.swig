<!DOCTYPE html>
<html lang="zh-TW">
{{ partial('_partial/head') }}
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
