(function() {
  'use strict';

  Prism.hooks.add('complete', function(env) {
    env.element.parentNode.classList.add('scrollbar-dark');
  });
})();
