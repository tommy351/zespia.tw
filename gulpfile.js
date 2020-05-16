'use strict';

const { src, dest, series } = require('gulp');
const scaleImages = require('gulp-scale-images');
const readMetadata = require('gulp-scale-images/read-metadata');
const flatMap = require('flat-map').default;
const through = require('through2');
const cheerio = require('gulp-cheerio');
const image = require('gulp-image');
const rename = require('gulp-rename');

let imageResults = {};

function readImageMeta() {
  return through.obj((file, enc, cb) => {
    readMetadata(file, (err, meta) => {
      if (err) return cb(err);

      const clone = file.clone();
      clone.imageMeta = meta;
      clone.imageSrc = file.relative;
      cb(null, clone);
    });
  });
}

function multiMaxWidth(widths) {
  return flatMap((file, cb) => {
    const files = widths
      .filter(x => x < file.imageMeta.width)
      .map(maxWidth => {
        const clone = file.clone();

        clone.scale = {
          maxWidth,
          format: file.imageMeta.format,
          formatOptions: { progressive: true }
        };

        return clone;
      });

    cb(null, files);
  });
}

function collectImages() {
  return through.obj((file, enc, cb) => {
    if (!file.imageSrc) return cb();

    imageResults[file.imageSrc] = (imageResults[file.imageSrc] || []).concat(file);
    cb();
  });
}

function trimPrefix(str, prefix) {
  if (str.substring(0, prefix.length) === prefix) {
    return str.substring(prefix.length);
  }

  return str;
}

function getImageWidth(file) {
  if (file.scale && file.scale.maxWidth) return file.scale.maxWidth;
  if (file.imageMeta && file.imageMeta.width) return file.imageMeta.width;
  throw new Error(`Unable to get image width of ${file.relative}`);
}

function getImageResults(src) {
  const compressed = imageResults[trimPrefix(src, '/')];
  if (!compressed || !compressed.length) return [];

  const resized = imageResults[compressed[0].relative];

  if (resized && resized.length) {
    compressed.push(...resized);
  }

  return compressed.sort((a, b) => getImageWidth(a) - getImageWidth(b));
}

function compressImage() {
  return src([
    'public/**/*.{jpg,jpeg,png,svg,gif}',
    '!public/demo/**/*',
    '!public/images/compressed/**/*',
    '!public/images/resized/**/*',
    '!public/favicon.png'
  ], { base: 'public' })
    .pipe(readImageMeta())
    .pipe(image({
      // Disable this because it is super slow
      zopflipng: false
    }))
    .pipe(rename(path => {
      path.dirname = `images/compressed/${path.dirname}`;
    }))
    .pipe(dest('public'))
    .pipe(collectImages());
}

function resizeImage() {
  return src('public/images/compressed/**/*.{jpg,jpeg,png}', { base: 'public' })
    .pipe(readImageMeta())
    .pipe(multiMaxWidth([320, 640, 1280]))
    .pipe(scaleImages())
    .pipe(rename(path => {
      path.dirname = path.dirname.replace('images/compressed', 'images/resized');
    }))
    .pipe(dest('public'))
    .pipe(collectImages());
}

function rewriteHtml() {
  return src([
    'public/**/*.html',
    '!public/demo/**/*.html'
  ]).pipe(cheerio(($, file) => {
    $('img').each((index, element) => {
      const img = $(element);
      const src = img.attr('data-orig') || img.attr('src');
      const files = getImageResults(src);
      if (!files || !files.length) return;

      const fullImg = files[files.length - 1];
      const srcs = files.map(file => `/${file.relative} ${getImageWidth(file)}w`);

      if (!img.attr('data-orig')) {
        img.attr('data-orig', src);
      }

      img.attr('src', `/${fullImg.relative}`);
      img.attr('srcset', srcs.join(','));
      img.attr('width', fullImg.imageMeta.width);
      img.attr('height', fullImg.imageMeta.height);
      img.attr('loading', 'lazy');
    });
  })).pipe(dest('public'));
}

exports.default = series(compressImage, resizeImage, rewriteHtml);
