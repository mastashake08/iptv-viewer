/**
 * HTTP Proxy Utility
 * Automatically proxies HTTP requests through the API to bypass mixed content restrictions
 */

const PROXY_API = 'https://shaketv.jyroneparker.com/api/proxy';

/**
 * Transforms an HTTP URL to use the proxy endpoint
 * HTTPS URLs are returned unchanged
 */
export function proxyUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Only proxy http:// URLs, leave https:// unchanged
    if (urlObj.protocol === 'http:') {
      return `${PROXY_API}?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return url;
  }
}

/**
 * Fetch wrapper that automatically proxies HTTP URLs
 * Shows alerts for 404 and 500 errors
 */
export async function proxyFetch(url, options = {}) {
  const proxiedUrl = proxyUrl(url);
  const response = await fetch(proxiedUrl, options);
  
  // Check for error status codes
  if (response.status === 404) {
    alert(`Error 404: The requested URL could not be found.\n\n${url}`);
    throw new Error(`404 Not Found: ${url}`);
  }
  
  if (response.status >= 500) {
    alert(`Error ${response.status}: Server error while fetching the URL.\n\n${url}`);
    throw new Error(`${response.status} Server Error: ${url}`);
  }
  
  if (!response.ok) {
    console.error(`HTTP Error ${response.status} for URL:`, url);
  }
  
  return response;
}

/**
 * Transform all URLs in an M3U8 playlist content
 * Useful for processing playlist text before parsing
 */
export function proxyPlaylistUrls(playlistContent) {
  // Match URLs in M3U8 content (both http and https)
  return playlistContent.replace(/(http:\/\/[^\s\n]+)/g, (match) => {
    return proxyUrl(match);
  });
}
