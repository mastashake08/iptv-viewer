if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let f={};const d=e=>n(e,o),c={module:{uri:o},exports:f,require:d};i[o]=Promise.all(s.map((e=>c[e]||d(e)))).then((e=>(r(...e),f)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon-180x180.png",revision:"fd9dd2a0f284779f88b2c846f27ef87a"},{url:"assets/index-BUxHCe9P.css",revision:null},{url:"assets/index-Bz5VjQJn.js",revision:null},{url:"assets/workbox-window.prod.es5-B9K5rw8f.js",revision:null},{url:"favicon.ico",revision:"13b35831063dcb69b50111c919675b75"},{url:"favicon.svg",revision:"21dfe85a18f8144c6ada0451d7afffd5"},{url:"index.html",revision:"3de8620ca8791169a7c89a1471cbeded"},{url:"maskable-icon-512x512.png",revision:"c130bf00d9587c8ede20ed8d844f9df5"},{url:"pwa-192x192.png",revision:"4fca23d2d733960f1388cf5376282189"},{url:"pwa-512x512.png",revision:"b8e3fc1f2feba14d6bb36595bafe384c"},{url:"pwa-64x64.png",revision:"82091eaf54afebee8b495b6252a25da7"},{url:"manifest.webmanifest",revision:"dc19d85c558f8df6aaf80211b28a1e0c"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
