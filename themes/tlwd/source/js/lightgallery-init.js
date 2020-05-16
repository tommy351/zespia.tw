(function() {
  const articles = document.getElementsByClassName('article-body');
  const IMAGE_LINK_CLASSNAME = 'article-image-link';

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
    const images = article.getElementsByTagName('img');

    for (const img of images) {
      const anchor = document.createElement('a');
      anchor.href = img.src;
      anchor.title = img.alt;
      anchor.className = IMAGE_LINK_CLASSNAME;

      img.parentNode.insertBefore(anchor, img);
      anchor.appendChild(img);
    }

    lightGallery(article, {
      selector: `.${IMAGE_LINK_CLASSNAME}`
    });

    freezeBodyWhenOpen(article);
  }
})();
