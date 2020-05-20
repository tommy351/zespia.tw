'use strict';

const postcss = require('postcss');
const loadConfig = require('postcss-load-config');

const { plugins } = loadConfig.sync();
const processor = postcss(plugins);

hexo.extend.renderer.register('css', 'css', async data => {
  const result = await processor.process(data.text, {
    from: data.path,
  });

  return result.css;
}, false);
