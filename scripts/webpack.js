'use strict';

hexo.extend.filter.register('server_middleware', function(server) {
  const webpack = require('webpack');
  const middleware = require('webpack-dev-middleware');
  const config = require('../webpack.config');
  const compiler = webpack(config);

  server.use(middleware(compiler, {
    publicPath: config.output.publicPath
  }));
}, 1);
