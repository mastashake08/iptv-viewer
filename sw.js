if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const f=e||("document"in self?document.currentScript.src:"")||location.href;if(i[f])return;let o={};const c=e=>n(e,f),a={module:{uri:f},exports:o,require:c};i[f]=Promise.all(s.map((e=>a[e]||c(e)))).then((e=>(r(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon-180x180.png",revision:"e6f50e3524c9ff9eb2477bf768d0efd9"},{url:"assets/index-BB0byzpC.css",revision:null},{url:"assets/index-BEi9TM6w.js",revision:null},{url:"assets/workbox-window.prod.es5-B9K5rw8f.js",revision:null},{url:"favicon.ico",revision:"00cffd9b114feb7869d4fa36522774c0"},{url:"favicon.svg",revision:"21dfe85a18f8144c6ada0451d7afffd5"},{url:"index.html",revision:"1340b6f3845f83ef7e33a457fa0c0a15"},{url:"logo.png",revision:"9a80faf080122f10afc17587c15ce17b"},{url:"maskable-icon-512x512.png",revision:"a480492efdcc3adaf74863b9062799ac"},{url:"pwa-192x192.png",revision:"56b0c7ad3ce836631368f6a950e0e90a"},{url:"pwa-512x512.png",revision:"73b6a86ad3e8194f21a2c29c70d5e61d"},{url:"pwa-64x64.png",revision:"52a67f3f2689cd72ed8d78e2200cd425"},{url:"manifest.webmanifest",revision:"64e0074cfb3c951f2b905cbc3125bae4"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
