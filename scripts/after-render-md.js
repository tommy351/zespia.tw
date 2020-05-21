'use strict';

const cheerio = require('cheerio');

hexo.extend.filter.register('after_render:html', function(str, data) {
  if (!data.path.endsWith('.md')) return str;

  const $ = cheerio.load(str);

  $('pre').addClass('scrollbar-dark line-numbers');

  $('img').each((index, element) => {
    const img = $(element);
    if (img.parents('picture').length) return;

    const src = img.attr('src');
    if (!src) return;

    img.wrap('<picture/>');
    img.attr('data-orig', src);
  });

  $('picture').each((index, element) => {
    const picture = $(element);
    if (picture.parent('figure').length) return;

    picture.wrap('<figure/>');
  });

  $('figure').each((index, element) => {
    const figure = $(element);
    const img = figure.find('img');
    const src = img.attr('src');
    if (!src) return;

    figure.attr('data-src', src);
    figure.attr('data-download-url', src);

    let figcaption = figure.children('figcaption');

    if (figcaption.length) {
      figcaption.addClass('caption');
      figure.attr('data-sub-html', '.caption');
      return;
    }

    const title = img.attr('title');
    if (!title) return;

    figcaption = $('<figcaption/>');
    figcaption.html(title);
    figcaption.addClass('caption');
    figure.append(figcaption);
    figure.attr('data-sub-html', '.caption');
  });

  return $.html();
});
