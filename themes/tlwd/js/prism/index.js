import Prism from 'prismjs';
import './vsc-dark-plus.css';

Promise.all([
  import('./autoloader'),
  import('./line-numbers'),
  import('./toolbar'),
  import('./copy-to-clipboard'),
  import('./show-language')
]).then(() => {
  Prism.highlightAll();
});
