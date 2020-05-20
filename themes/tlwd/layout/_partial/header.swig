<header>
  <nav class="header-nav">
    <a href="{{ url_for() }}">Home</a>
    <a href="{{ url_for('/archives/') }}">Archives</a>
    <a href="{{ url_for('atom.xml') }}">RSS</a>
    <a href="https://github.com/tommy351" target="_blank" rel="noopener noreferrer">GitHub</a>
  </nav>
  <h1 class="flex-shrink-0 font-logo text-white text-5xl leading-none text-right pb-12">
    <a href="{{ url_for() }}">{{ config.title }}</a>
  </h1>
</header>
