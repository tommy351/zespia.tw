<main class="space-y-16">
  {% for post in page.posts %}
    {{ partial('_partial/article', { post: post, index: true }) }}
  {% endfor %}
</main>

{% if page.total > 1 %}
  <nav class="paginator">
    {{ paginator({
      prev_text: '上一頁',
      next_text: '下一頁',
      escape: false
    }) }}
  </nav>
{% endif %}
