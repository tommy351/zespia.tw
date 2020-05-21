{% macro join_tags(tags) %}
{%- for tag in tags -%}{% if not loop.first %},{% endif %}{{ tag.name }}{%- endfor -%}
{% endmacro %}

<article id="{{ post.layout }}-{{ post.slug }}" class="article-container" itemscope itemtype="https://schema.org/Article">
  <header class="article-header">
    <div class="text-accent leading-none pb-2 text-sm">
      {{ date(post.date, config.date_format) }}
    </div>
    <h1 class="text-2xl lg:text-3xl font-light leading-tight pt-2" itemprop="headline">
      <a class="block hover:text-accent" href="{{ url_for(post.path) }}">{{ post.title }}</a>
    </h1>
  </header>
  <div class="article-body" itemprop="articleBody">
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
  <footer class="article-footer">
    {% if post.tags.length %}
      <ul class="list-none flex flex-wrap justify-end">
        {% for tag in post.tags -%}
          <li class="pl-2">
            <a class="text-sm text-accent hover:underline" href="{{ url_for(tag.path) }}">#{{ tag.name }}</a>
          </li>
        {%- endfor %}
      </ul>
      <meta itemprop="keywords" content="{{ join_tags(post.tags) }}">
    {% endif %}
  </footer>
  <meta itemprop="datePublished" content="{{ date_xml(post.date) }}">
  <meta itemprop="dateModified" content="{{ date_xml(post.updated) }}">
  <div itemprop="author publisher" itemscope itemtype="https://schema.org/Person">
    <meta itemprop="name" content="{{ config.author }}">
  </div>
</article>
