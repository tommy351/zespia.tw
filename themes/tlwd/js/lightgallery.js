import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';

const articles = document.getElementsByClassName('article-body');

// Create a fake picturefill function which does nothing at all.
// This can hide the errors from lightgallery.
window.picturefill = function() {};

function freezeBodyWhenOpen(element) {
  let scrollX = 0;
  let scrollY = 0;

  element.addEventListener('onBeforeOpen', function (e) {
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

  element.addEventListener('onCloseAfter', function (e) {
    document.body.style.position = '';
    document.body.style.left = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    document.body.style.paddingBottom = '';
    window.scrollTo(scrollX, scrollY);
  });
}

for (const article of articles) {
  lightGallery(article, {
    selector: 'figure[data-src]',
    subHtmlSelectorRelative: true
  });

  freezeBodyWhenOpen(article);
}
