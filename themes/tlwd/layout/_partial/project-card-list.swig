<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {% for project in projects %}
    <a href="{{ project.url }}" target="_blank" rel="noopener" class="p-4 bg-gray-800 bg-opacity-50 rounded shadow-base hover:bg-accent hover:bg-opacity-25 hover:shadow-xl transform hover:scale-105 transition transition-transform duration-300 ease-in-out">
      <h3 class="text-lg font-bold">{{ project.name }}</h3>
      <div class="py-2 text-content">{{ project.description }}</div>
      <div class="text-sm text-content text-opacity-75">{{ project.language }}</div>
    </a>
  {% endfor %}
</div>
