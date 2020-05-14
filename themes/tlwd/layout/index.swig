<main class="space-y-16">
  {% for post in page.posts %}
    {{ partial('_partial/article', { post: post, index: true }) }}
  {% endfor %}
</main>

{% if page.total > 1 %}
  <nav class="paginator">
    {{ paginator({
      prev_text: '🡨',
      next_text: '🡪',
      escape: false
    }) }}
  </nav>
{% endif %}
