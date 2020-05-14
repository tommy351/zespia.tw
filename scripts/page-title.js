'use strict';

hexo.extend.helper.register('page_title', function() {
  let title = this.page && this.page.title || '';

  if (this.is_archive()) {
    title = '彙整';

    if (this.is_month()) {
      title += `: ${page.year}/${page.month}`
    } else if (this.is_year()) {
      title += `: ${page.year}`;
    }
  } else if (this.is_category()) {
    title = `分類: ${this.page.category}`;
  } else if (this.is_tag()) {
    title = `標籤: ${this.page.tag}`;
  }

  if (title) {
    return `${title} | ${this.config.title}`;
  }

  return this.config.title;
});
