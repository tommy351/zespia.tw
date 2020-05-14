<article id="{{ post.layout }}-{{ post.slug }}" class="article-container" itemprop="blogPost" itemscope itemtype="https://schema.org/BlogPosting">
  <header class="article-header">
    <div class="text-accent leading-none pb-2 text-sm">
      {{ date(post.date, config.date_format) }}
    </div>
    <h1 class="text-2xl lg:text-3xl font-light leading-tight pt-2">
      <a class="block hover:text-accent" href="{{ url_for(post.path) }}">{{ post.title }}</a>
    </h1>
  </header>
  <div class="article-body">
    {% if post.excerpt && index %}
      {{ post.excerpt }}
    {% else %}
      {{ post.content }}
    {% endif %}
  </div>
  {% if index %}
  <a href="{{ url_for(post.path) }}#more" class="text-accent rounded-full px-4 py-2 font-bold border-accent border-2 border-opacity-50 hover:bg-accent hover:bg-opacity-25">
    繼續閱讀
  </a>
  {% endif %}
  <footer class="article-footer flex justify-end">
    {{ list_tags(post.tags, { show_count: false }) }}
  </footer>
</article>
