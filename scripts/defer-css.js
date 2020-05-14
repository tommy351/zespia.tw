'use strict';

hexo.extend.helper.register('defer_css', function(href) {
  return `
<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${href}"></noscript>
`.trim();
});
