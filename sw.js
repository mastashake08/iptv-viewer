if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const a=e=>n(e,o),d={module:{uri:o},exports:c,require:a};i[o]=Promise.all(s.map((e=>d[e]||a(e)))).then((e=>(r(...e),c)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon-180x180.png",revision:"52f91e594d046f1b7aabb04e5a7c9e42"},{url:"assets/index-CAaHPENv.js",revision:null},{url:"assets/index-CBgL83-m.css",revision:null},{url:"assets/workbox-window.prod.es5-B9K5rw8f.js",revision:null},{url:"favicon.ico",revision:"db96a8accf8ba283522193c39925df06"},{url:"favicon.svg",revision:"21dfe85a18f8144c6ada0451d7afffd5"},{url:"index.html",revision:"29d09133764f267409a1cc2a1f00d8d9"},{url:"logo.png",revision:"0edc2fb382a900c2e4db419d16d1f9f6"},{url:"maskable-icon-512x512.png",revision:"1bb13824e8e88c4936e833916ccd2279"},{url:"pwa-192x192.png",revision:"931e095b1eeab48aaebf4b97375bb07e"},{url:"pwa-512x512.png",revision:"89fc759da55126329beee588adb5c540"},{url:"pwa-64x64.png",revision:"145069bd017686409f8a61bcdd17c464"},{url:"manifest.webmanifest",revision:"9abc918c7e415ca5ee94a9935872c853"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
