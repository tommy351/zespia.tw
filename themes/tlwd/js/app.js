import { Workbox } from 'workbox-window';

import '../css/app.css';

import('./prism');
import('./lightgallery');

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}
