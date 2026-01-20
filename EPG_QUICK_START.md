# Quick Integration Example for App.vue

This file shows the key changes needed to integrate EPG functionality into your existing App.vue

## 1. Add Imports (at the top of <script setup>)

```javascript
import EPGDisplay from './components/EPGDisplay.vue';
import { parseM3U8WithEPG, extractEPGUrl } from './utils/m3u8Parser.js';
```

## 2. Add State Variables (with your other refs)

```javascript
// Add these refs
const currentChannel = ref(null);
const epgUrl = ref(null);
const showEPG = ref(false);
```

## 3. Replace parseManifest Function

Replace your current parseManifest function (around line 242) with:

```javascript
const parseManifest = (manifest) => {
  // Try to extract EPG URL from manifest header
  const extractedEpgUrl = extractEPGUrl(manifest);
  if (extractedEpgUrl) {
    epgUrl.value = extractedEpgUrl;
    console.log('Found EPG URL in playlist:', extractedEpgUrl);
  }
  
  // Parse with EPG metadata (tvg-id, tvg-name, tvg-logo)
  const sources = parseM3U8WithEPG(manifest);
  
  // If enhanced parser returns results, use them
  if (sources.length > 0) {
    console.log('Parsed channels with EPG metadata:', sources);
    return sources;
  }
  
  // Fallback to old parser if enhanced parser fails
  console.log('Enhanced parser failed, using fallback parser');
  parser.push(manifest);
  parser.end();
  const parsedManifest = parser.manifest;
  
  try {
    let fallbackSources = parsedManifest.segments.map((segment) => ({
      sources:[{
        src: segment.uri,
        type: "application/x-mpegURL",
      }], 
      name: segment.title.match(/group-title="[^"]*",(.+)/)?.[1] ?? null,
      poster: '/favicon.svg'
    }));
    
    if (fallbackSources.length === 0) {
      fallbackSources = parsedManifest.playlists.map((playlist) => ({
        sources:[{
          src: playlist.uri,
          type: "application/x-mpegURL",
        }], 
        name: playlist.title?.match(/group-title="[^"]*",(.+)/)?.[1] ?? null,
        poster: '/favicon.svg'
      }));
    }
    return fallbackSources;
  } catch (error) {
    console.error('Parser error:', error);
    return [];
  }
};
```

## 4. Add Event Handler Method (with your other methods)

```javascript
const handleEpgLoaded = (epgData) => {
  console.log('EPG data loaded successfully:', epgData);
  // Optional: Store EPG data if needed for other features
};
```

## 5. Update VideoPlayer in Template

Find your VideoPlayer component (around line 482) and replace:

```vue
<!-- OLD -->
<VideoPlayer 
  v-if="videoOptions" 
  :options="videoOptions" 
  :customAdUrls="customAdUrls"
/>

<!-- NEW -->
<VideoPlayer 
  v-if="videoOptions" 
  :options="videoOptions" 
  :customAdUrls="customAdUrls"
  @channel-changed="currentChannel = $event"
/>
```

## 6. Add EPG Display Component in Template

Add this right after your VideoPlayer section (around line 487):

```vue
<!-- Video Player -->
<div class="w-full max-w-3xl flex flex-col justify-center">
  <VideoPlayer 
    v-if="videoOptions" 
    :options="videoOptions" 
    :customAdUrls="customAdUrls"
    @channel-changed="currentChannel = $event"
  />
  
  <!-- EPG Display Section -->
  <div v-if="videoOptions" class="mt-4 w-full">
    <!-- Toggle EPG Button -->
    <button 
      @click="showEPG = !showEPG"
      class="w-full mb-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-semibold"
    >
      {{ showEPG ? '📺 Hide Program Guide' : '📺 Show Program Guide' }}
    </button>
    
    <!-- EPG Component -->
    <EPGDisplay 
      v-if="showEPG"
      :tvg-id="currentChannel?.tvgId"
      :channel-id="currentChannel?.name"
      @epg-loaded="handleEpgLoaded"
    />
  </div>
</div>
```

## 7. Update VideoPlayer.vue to Emit Channel Changes

In `src/components/VideoPlayer.vue`, find the `setupPlaylist` function (around line 47) and update:

```javascript
const setupPlaylist = (options) => {
  if (options.playlist && options.playlist.length > 0) {
    player.playlist(options.playlist);
    player.playlistUi({ el: player.el().querySelector('.vjs-playlist') });
    
    // Update title metadata when playlist item changes
    player.on('playlistitem', () => {
      const currentItem = player.playlist()[player.playlist.currentItem()];
      if (currentItem && currentItem.name) {
        // Update document title
        document.title = `${currentItem.name} - IPTV Viewer`;
        
        // EMIT CHANNEL CHANGE EVENT (ADD THIS LINE)
        emit('channel-changed', currentItem);
        
        // Update player metadata for Media Session API
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentItem.name,
            artist: 'IPTV Viewer',
            artwork: currentItem.poster ? [
              { src: currentItem.poster, sizes: '256x256', type: 'image/svg+xml' }
            ] : []
          });
        }
      }
    });
```

And add the emit definition at the top of the script:

```javascript
const emit = defineEmits(['channel-changed']);
```

## Complete! 🎉

After making these changes:

1. The app will automatically extract EPG URLs from M3U8 playlists
2. TVG attributes (tvg-id, tvg-name, tvg-logo) will be preserved
3. A "Show Program Guide" button will appear below the video player
4. Users can load EPG data and see current/upcoming programs

## Testing

1. Start dev server: `npm run dev`
2. Load a playlist with TVG attributes
3. Click "Show Program Guide"
4. Enter an EPG URL or use the auto-detected one
5. See current program, upcoming program, and today's schedule

## Sample Test Files

Create these files for testing:

### public/test-epg.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="test1">
    <display-name>Test Channel</display-name>
  </channel>
  <programme start="20260119000000 +0000" stop="20260119235959 +0000" channel="test1">
    <title>All Day Test Program</title>
    <desc>Testing EPG functionality</desc>
  </programme>
</tv>
```

### public/test-playlist.m3u8
```m3u
#EXTM3U url-tvg="http://localhost:5173/test-epg.xml"
#EXTINF:-1 tvg-id="test1" tvg-name="Test Channel" tvg-logo="/favicon.svg",Test Channel
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```
