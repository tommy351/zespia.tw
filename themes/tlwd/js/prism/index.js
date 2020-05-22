import Prism from 'prismjs';

Promise.all([
  import('./autoloader'),
  import('./line-numbers'),
  import('./toolbar'),
  import('./copy-to-clipboard'),
  import('./show-language')
]).then(() => {
  Prism.highlightAll();
});
