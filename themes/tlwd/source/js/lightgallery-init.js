(function() {
  const articles = document.getElementsByClassName('article-body');

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

  function wrapImage(img) {
    let figure = img.parentNode;

    if (figure.tagName.toUpperCase() !== 'FIGURE') {
      figure = document.createElement('figure');
      img.parentNode.insertBefore(figure, img);
      figure.appendChild(img);
    }

    figure.dataset.src = img.src;
  }

  function setupImageCaption(img) {
    const figure = img.parentNode;
    let caption = figure.querySelector('figcaption');

    if (!caption && img.title) {
      caption = document.createElement('figcaption');
      caption.innerText = img.title;
      figure.appendChild(caption);
    }

    if (!caption) return;

    caption.classList.add('caption');
    figure.dataset.subHtml = '.caption';
  }

  for (const article of articles) {
    const images = article.getElementsByTagName('img');

    for (const img of images) {
      wrapImage(img);
      setupImageCaption(img);
    }

    lightGallery(article, {
      selector: 'figure',
      subHtmlSelectorRelative: true
    });

    freezeBodyWhenOpen(article);
  }
})();
