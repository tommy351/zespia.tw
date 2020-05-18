<main>
  {{ partial('_partial/article', { post: page, index: false }) }}
</main>

{% if page.comment_service === 'utterances' %}
<script
  src="https://utteranc.es/client.js"
  repo="tommy351/zespia.tw"
  issue-term="[zespia.tw/post] {{ page.slug }}"
  label="utterances/comment"
  theme="dark-blue"
  crossorigin="anonymous"
  async>
</script>
{% elif page.comment_service === 'disqus' && config.disqus_shortname %}
<div id="disqus_thread" class="pt-16"></div>
<script>
var disqus_config = function () {
this.page.url = {{ JSON.stringify(page.permalink) }};
this.page.identifier = {{ JSON.stringify(page.slug) }};
this.language = 'zh_TW';
};

(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = 'https://{{ config.disqus_shortname }}.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
s.setAttribute('defer', '');
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
{% endif %}
