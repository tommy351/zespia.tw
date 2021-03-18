'use strict';

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const THEME_DIR = path.join(__dirname, 'themes/tlwd');
const isProd = NODE_ENV === 'production';

module.exports = {
  mode: NODE_ENV,
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  entry: {
    app: path.join(THEME_DIR, 'js/app.js')
  },
  output: {
    // FIXME: Use fullhash instead of contenthash because html-webpack-plugin
    // can't get the correct filename
    filename: 'build/[name].[fullhash].js',
    path: path.join(THEME_DIR, 'source'),
    publicPath: '/'
  },
  optimization: {
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'usage',
                corejs: {
                  version: 3,
                  proposals: true
                }
              }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isProd,
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('postcss-nested'),
                  require('autoprefixer'),
                  ...isProd ? [require('cssnano')({
                    preset: 'default'
                  })] : []
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader?outputPath=build/images'
            }
          },
          {
            loader: 'image-webpack-loader'
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'build/fonts'
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: [
        path.join(THEME_DIR, 'source/**/*.njk')
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'layout.njk',
      template: path.join(THEME_DIR, 'layout/_layout.njk'),
      alwaysWriteToDisk: true,
      scriptLoading: 'defer'
    }),
    new HtmlWebpackHarddiskPlugin({
      outputPath: path.join(THEME_DIR, 'layout')
    }),
    new FaviconsWebpackPlugin({
      logo: path.join(__dirname, 'source/_assets/logo.svg'),
      cache: true,
      outputPath: 'assets',
      favicons: {
        appName: 'Zespia',
        appDescription: 'A blog about web development and programming.',
        background: '#1a202c',
        theme_color: '#7f9cf5',
        lang: 'zh-TW',
        appleStatusBarStyle: 'black-translucent',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: false,
          coast: false,
          favicons: true,
          windows: true,
          yandex: false
        }
      }
    }),
    ...isProd ? [
      new InjectManifest({
        swSrc: path.join(THEME_DIR, 'js/sw.js'),
        swDest: path.join(THEME_DIR, 'source/sw.js'),
        exclude: [
          /assets\//,
          /\.map$/,
          /\.njk$/
        ],
        dontCacheBustURLsMatching: /^\/build\//
      }),
      new MiniCssExtractPlugin({
        // FIXME: Use fullhash instead of contenthash because html-webpack-plugin
        // can't get the correct filename
        filename: 'build/[name].[fullhash].css'
      })
    ] : []
  ]
};
