'use strict';

const { src, dest, series } = require('gulp');
const scaleImages = require('gulp-scale-images');
const readMetadata = require('gulp-scale-images/read-metadata');
const flatMap = require('flat-map').default;
const through = require('through2');
const cheerio = require('gulp-cheerio');
const image = require('gulp-image');
const rename = require('gulp-rename');
const webp = require('gulp-webp');
const { groupBy, mapValues, maxBy } = require('lodash');
const mime = require('mime-types');

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
  const files = imageResults[trimPrefix(src, '/')] || [];
  const result = [];

  for (const file of files) {
    result.push(file, ...getImageResults(file.relative));
  }

  return result;
}

function setSrcSet(element, files) {
  const maxWidth = 768;

  element.attr('srcset', files.map(file => `/${file.relative} ${getImageWidth(file)}w`));
  element.attr('sizes', `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`);
}

function compressImage() {
  return src([
    'public/**/*.{jpg,jpeg,png,svg,gif}',
    '!public/assets/**/*',
    '!public/build/**/*',
    '!public/demo/**/*',
    '!public/images/compressed/**/*',
    '!public/images/resized/**/*',
    '!public/images/icons/**/*'
  ], { base: 'public' })
    .pipe(readImageMeta())
    .pipe(image({
      // Disable this because it is super slow
      zopflipng: false,
      jpegRecompress: true
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
    .pipe(multiMaxWidth([320, 640, 1024, 1600]))
    .pipe(scaleImages())
    .pipe(rename(path => {
      path.dirname = path.dirname.replace('images/compressed', 'images/resized');
    }))
    .pipe(dest('public'))
    .pipe(collectImages());
}

function convertWebP() {
  return src([
    'public/images/**/*.{jpg,jpeg,png}'
  ], { base: 'public' })
    .pipe(readImageMeta())
    .pipe(webp())
    .pipe(rename({ extname: '.webp' }))
    .pipe(dest('public'))
    .pipe(collectImages());
}

function rewriteHtml() {
  return src([
    'public/**/*.html',
    '!public/demo/**/*.html'
  ])
    .pipe(cheerio(($, file) => {
      $('img[data-orig]').each((index, element) => {
        const img = $(element);
        const src = img.attr('data-orig');
        const files = getImageResults(src);
        if (!files || !files.length) return;

        const srcType = mime.lookup(src);

        const groups = mapValues(
          groupBy(files, file => mime.lookup(file.extname)),
          files => files.sort((a, b) => getImageWidth(a) - getImageWidth(b))
        );

        const fullImg = maxBy(
          files.filter(file => mime.lookup(file.extname) === srcType),
          file => getImageWidth(file)
        );

        if (!fullImg) {
          throw new Error(`Unable to find the full image for ${src}`);
        }

        const picture = img.parent('picture');
        if (!picture.length) return;

        picture.attr('width', fullImg.imageMeta.width);
        picture.attr('height', fullImg.imageMeta.height);
        picture.children('source').remove();

        picture.prepend(...Object.keys(groups).filter(type => {
          return type !== srcType;
        }).map(type => {
          const source = $('<source/>');
          source.attr('type', type);
          setSrcSet(source, groups[type]);
          return source;
        }));

        img.attr('src', `/${fullImg.relative}`);
        img.attr('width', fullImg.imageMeta.width);
        img.attr('height', fullImg.imageMeta.height);
        setSrcSet(img, groups[srcType]);

        const figure = picture.parent('figure');
        figure.attr('data-src', img.attr('src'));
        figure.attr('data-srcset', img.attr('srcset'));
      });
    }))
    .pipe(dest('public'));
}

exports.default = series(
  compressImage,
  resizeImage,
  convertWebP,
  rewriteHtml
);
