if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let f={};const c=e=>s(e,o),a={module:{uri:o},exports:f,require:c};i[o]=Promise.all(n.map((e=>a[e]||c(e)))).then((e=>(r(...e),f)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"apple-touch-icon-180x180.png",revision:"fd9dd2a0f284779f88b2c846f27ef87a"},{url:"assets/index-Bgx3W41G.css",revision:null},{url:"assets/index-BK-sLb1h.js",revision:null},{url:"assets/workbox-window.prod.es5-B9K5rw8f.js",revision:null},{url:"favicon.ico",revision:"13b35831063dcb69b50111c919675b75"},{url:"favicon.svg",revision:"21dfe85a18f8144c6ada0451d7afffd5"},{url:"index.html",revision:"822e52cc70819538a75e17fce03fea7a"},{url:"maskable-icon-512x512.png",revision:"c130bf00d9587c8ede20ed8d844f9df5"},{url:"pwa-192x192.png",revision:"4fca23d2d733960f1388cf5376282189"},{url:"pwa-512x512.png",revision:"b8e3fc1f2feba14d6bb36595bafe384c"},{url:"pwa-64x64.png",revision:"82091eaf54afebee8b495b6252a25da7"},{url:"manifest.webmanifest",revision:"ec7ae739b204c2c6a9a7af0ed6a31290"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
