'use strict';

const path = require('path');
const webpack = require('webpack');
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
  devtool: isProd ? 'source-map' : 'eval',
  entry: {
    app: path.join(THEME_DIR, 'js/app.js')
  },
  output: {
    filename: 'build/[name].[contenthash].js',
    path: path.join(THEME_DIR, 'source'),
    publicPath: '/'
  },
  optimization: {
    runtimeChunk: 'single'
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
              ident: 'postcss',
              sourceMap: isProd,
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: [
        path.join(THEME_DIR, 'source/**/*.swig')
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'layout.swig',
      template: path.join(THEME_DIR, 'layout/_layout.swig'),
      alwaysWriteToDisk: true,
      scriptLoading: 'defer'
    }),
    new HtmlWebpackHarddiskPlugin({
      outputPath: path.join(THEME_DIR, 'layout')
    }),
    new InjectManifest({
      swSrc: path.join(THEME_DIR, 'js/sw.js'),
      swDest: path.join(THEME_DIR, 'source/sw.js'),
      exclude: [
        /assets\//,
        /\.map$/,
        /\.swig$/
      ],
      dontCacheBustURLsMatching: /^\/build\//
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
    ...isProd ? [new MiniCssExtractPlugin({
      filename: 'build/[name].[contenthash].css'
    })] : []
  ]
};
