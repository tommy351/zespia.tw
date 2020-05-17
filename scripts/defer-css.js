'use strict';

// https://www.filamentgroup.com/lab/load-css-simpler/#the-code
hexo.extend.helper.register('defer_css', function(href) {
  return `
<link rel='stylesheet' href='${href}' media='print' onload='this.media="all"'>
`.trim();
});
