// Custom Service Worker with HTTP Proxy
// This intercepts http:// requests and proxies them through the API

const PROXY_API = 'https://shaketv.jyroneparker.com/api/proxy';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker with HTTP proxy');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only intercept http:// requests (not https://)
  if (url.protocol === 'http:') {
    console.log('[SW] Proxying HTTP request:', url.href);
    
    event.respondWith(
      fetch(`${PROXY_API}?url=${encodeURIComponent(url.href)}`, {
        method: 'GET',
        headers: {
          'Accept': event.request.headers.get('Accept') || '*/*',
        },
      })
      .then(response => {
        console.log('[SW] Proxy response received:', response.status);
        return response;
      })
      .catch(error => {
        console.error('[SW] Proxy error:', error);
        return new Response('Failed to proxy request', { 
          status: 502,
          statusText: 'Bad Gateway' 
        });
      })
    );
  }
  // For all other requests (https, same-origin, etc.), let them through normally
  else {
    event.respondWith(fetch(event.request));
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
