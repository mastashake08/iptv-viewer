/**
 * Video.js middleware to replace ad slate segments with custom ads
 * Detects #EXT-X-CUE-OUT markers and replaces ad slate segments
 */

export function createAdReplacementMiddleware(customAdUrls = []) {
  return function(player) {
    return {
      setSource(srcObj, next) {
        // Pass through the original source
        next(null, srcObj);
      },

      // Intercept XHR requests for M3U8 playlists
      callXhrHook(options, callback) {
        const originalCallback = callback;

        // Custom callback that processes the response
        const processedCallback = function(error, response) {
          if (error || !response || !response.responseText) {
            return originalCallback(error, response);
          }

          // Check if this is an M3U8 playlist
          const contentType = response.headers?.['content-type'] || '';
          const isM3U8 = contentType.includes('mpegurl') || 
                         contentType.includes('m3u8') ||
                         options.url.includes('.m3u8') ||
                         response.responseText.includes('#EXTM3U');

          if (!isM3U8) {
            return originalCallback(error, response);
          }

          try {
            const modifiedPlaylist = replaceAdSlates(
              response.responseText, 
              customAdUrls,
              options.url
            );

            // Create modified response
            const modifiedResponse = {
              ...response,
              responseText: modifiedPlaylist
            };

            return originalCallback(error, modifiedResponse);
          } catch (parseError) {
            console.error('Error processing playlist:', parseError);
            return originalCallback(error, response);
          }
        };

        // Call the next hook with our processed callback
        callback(null, processedCallback);
      }
    };
  };
}

/**
 * Replace ad slate segments with custom ads
 */
function replaceAdSlates(playlistContent, customAdUrls, baseUrl) {
  if (!customAdUrls || customAdUrls.length === 0) {
    console.log('No custom ad URLs provided');
    return playlistContent;
  }

  console.log(`Processing playlist with ${customAdUrls.length} custom ads:`, customAdUrls);

  const lines = playlistContent.split('\n');
  const modifiedLines = [];
  let inAdBreak = false;
  let adBreakDuration = 0;
  let adBreakElapsed = 0;
  let customAdIndex = 0;
  let replacementCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect start of ad break
    if (line.startsWith('#EXT-X-CUE-OUT:')) {
      inAdBreak = true;
      const match = line.match(/#EXT-X-CUE-OUT:(\d+(?:\.\d+)?)/);
      adBreakDuration = match ? parseFloat(match[1]) : 0;
      adBreakElapsed = 0;
      customAdIndex = 0;
      
      console.log(`🎬 Ad break started - Duration: ${adBreakDuration}s`);
      
      // Keep the CUE-OUT marker
      modifiedLines.push(line);
      continue;
    }

    // Detect continuation of ad break
    if (line.startsWith('#EXT-X-CUE-OUT-CONT:')) {
      const match = line.match(/ElapsedTime=(\d+(?:\.\d+)?)/);
      if (match) {
        adBreakElapsed = parseFloat(match[1]);
      }
      
      // Keep continuation marker
      modifiedLines.push(line);
      continue;
    }

    // Detect end of ad break
    if (line.startsWith('#EXT-X-CUE-IN')) {
      console.log(`🎬 Ad break ended - Replaced ${replacementCount} segments`);
      inAdBreak = false;
      replacementCount = 0;
      modifiedLines.push(line);
      continue;
    }

    // Detect discontinuity (often precedes ad breaks)
    if (line.startsWith('#EXT-X-DISCONTINUITY')) {
      modifiedLines.push(line);
      continue;
    }

    // Replace ad slate segments with custom ads
    if (inAdBreak && line && !line.startsWith('#')) {
      // This is a segment URL during an ad break
      if (customAdUrls.length > 0) {
        // Replace with custom ad
        const customAd = customAdUrls[customAdIndex % customAdUrls.length];
        
        // Resolve relative URLs
        const adUrl = resolveUrl(customAd, baseUrl);
        modifiedLines.push(adUrl);
        
        console.log(`  ✅ Replaced segment ${customAdIndex + 1}: ${line.substring(0, 50)}... -> ${adUrl}`);
        customAdIndex++;
        replacementCount++;
        continue;
      }
    }

    // Keep all other lines unchanged
    modifiedLines.push(line);
  }

  console.log(`✨ Playlist processing complete. Total replacements: ${replacementCount}`);
  return modifiedLines.join('\n');
}

/**
 * Resolve relative URLs against base URL
 */
function resolveUrl(url, baseUrl) {
  // If URL is absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If URL starts with /, it's relative to domain root
  if (url.startsWith('/')) {
    // For local development, this will be like /ads/ad1.mp4
    // which is served from the public folder
    return url;
  }

  // If no base URL, return as-is
  if (!baseUrl) {
    return url;
  }

  try {
    return new URL(url, baseUrl).href;
  } catch (e) {
    console.warn('Failed to resolve URL:', url, 'against', baseUrl);
    return url;
  }
}

/**
 * Helper to generate ad slate replacement from a single video file
 * Segments a video URL into multiple references for the ad break duration
 */
export function generateAdSegments(videoUrl, segmentDuration = 10, totalDuration = 180) {
  const numSegments = Math.ceil(totalDuration / segmentDuration);
  return Array(numSegments).fill(videoUrl);
}
