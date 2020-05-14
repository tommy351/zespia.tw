'use strict';

const postcss = require('postcss');

const processor = postcss([
  require('postcss-import'),
  require('tailwindcss'),
  require('postcss-nested'),
  require('autoprefixer')
]);

hexo.extend.renderer.register('css', 'css', async data => {
  const result = await processor.process(data.text, {
    from: data.path,
  });

  return result.css;
}, false);
