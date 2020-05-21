import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';

const articles = document.getElementsByClassName('article-body');

// Create a fake picturefill function which does nothing at all.
// This can hide the errors from lightgallery.
window.picturefill = () => {};

function freezeBodyWhenOpen(element) {
  let scrollX = 0;
  let scrollY = 0;

  element.addEventListener('onBeforeOpen', () => {
    const scrollBarWidth = window.innerWidth - document.body.clientWidth;
    const scrollBarHeight = window.innerHeight - document.body.clientHeight;
    scrollX = window.scrollX;
    scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.left = `-${scrollX}px`;
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    document.body.style.paddingBottom = `${scrollBarHeight}px`;
  });

  element.addEventListener('onCloseAfter', () => {
    document.body.style.position = '';
    document.body.style.left = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    document.body.style.paddingBottom = '';
    window.scrollTo(scrollX, scrollY);
  });
}

// https://davidwalsh.name/detect-webp
async function isWebPSupported() {
  if (!window.createImageBitmap) return false;

  const res = await fetch('data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=');
  const blob = await res.blob();

  try {
    createImageBitmap(blob);
    return true;
  } catch {
    return false;
  }
}

const webpSupported = isWebPSupported();

async function replaceWithWebP(element) {
  if (!await webpSupported) return;

  const figures = element.querySelectorAll('figure[data-src]');

  for (const figure of figures) {
    const webpSource = figure.querySelector('source[type="image/webp"]');

    if (webpSource && webpSource.srcset) {
      figure.dataset.srcset = webpSource.srcset;
    }
  }
}

for (const article of articles) {
  replaceWithWebP(article);

  lightGallery(article, {
    selector: 'figure[data-src]',
    subHtmlSelectorRelative: true
  });

  freezeBodyWhenOpen(article);
}
