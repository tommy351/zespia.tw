import { Workbox } from 'workbox-window';

import '../css/app.css';

import(/* webpackChunkName: "prism" */ './prism');
import(/* webpackChunkName: "lightgallery" */ './lightgallery');

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}
