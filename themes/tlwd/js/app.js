import { Workbox } from 'workbox-window';

import('./prism');
import('./lightgallery');

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}
