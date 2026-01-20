# EPG (Electronic Program Guide) Implementation Guide

## Overview
This guide explains how to add EPG functionality to your IPTV Viewer app. EPG displays TV program schedules, showing what's currently playing and upcoming programs.

## What's Been Created

### 1. **EPG Parser Utility** (`src/utils/epgParser.js`)
Handles parsing XMLTV format EPG data and provides helper functions:
- `parseEPG()` - Parse XMLTV format
- `getCurrentProgram()` - Get current program for a channel
- `getNextProgram()` - Get upcoming program
- `getTodaysPrograms()` - Get full day schedule
- `formatProgramTime()`, `formatDuration()`, `getProgramProgress()` - Display helpers

### 2. **Enhanced M3U8 Parser** (`src/utils/m3u8Parser.js`)
Extracts EPG-related metadata from M3U8 playlists:
- `extractTVGAttributes()` - Extract tvg-id, tvg-name, tvg-logo
- `parseM3U8WithEPG()` - Parse M3U8 with EPG metadata
- `extractEPGUrl()` - Extract EPG URL from M3U8 header
- `groupChannelsByCategory()` - Group channels by category

### 3. **EPG Display Component** (`src/components/EPGDisplay.vue`)
Beautiful UI component showing:
- Current program with progress bar
- Next program preview
- Today's full schedule
- EPG URL loader
- Auto-refresh every 30 seconds

## Installation Steps

### Step 1: Install Required Dependencies

```bash
npm install xml-js dayjs
```

### Step 2: Import EPG Component in App.vue

Add the import at the top of the script section in `src/App.vue`:

```javascript
import EPGDisplay from './components/EPGDisplay.vue';
import { parseM3U8WithEPG, extractEPGUrl } from './utils/m3u8Parser.js';
```

### Step 3: Add State for EPG

In `src/App.vue`, add these refs to your state section:

```javascript
const currentChannel = ref(null);
const epgUrl = ref(null);
const showEPG = ref(false);
```

### Step 4: Update parseManifest Function

Replace your existing `parseManifest` function with the enhanced version:

```javascript
const parseManifest = (manifest) => {
  // Try to extract EPG URL from manifest header
  const extractedEpgUrl = extractEPGUrl(manifest);
  if (extractedEpgUrl) {
    epgUrl.value = extractedEpgUrl;
  }
  
  // Parse with EPG metadata
  const sources = parseM3U8WithEPG(manifest);
  
  // Fallback to old parser if enhanced parser fails
  if (sources.length === 0) {
    parser.push(manifest);
    parser.end();
    const parsedManifest = parser.manifest;
    
    return parsedManifest.segments.map((segment) => ({
      sources:[{
        src: segment.uri,
        type: "application/x-mpegURL",
      }], 
      name: segment.title.match(/group-title="[^"]*",(.+)/)?.[1] ?? null,
      poster: '/favicon.svg'
    }));
  }
  
  return sources;
};
```

### Step 5: Track Current Channel

Update the VideoPlayer component to emit the current channel. In `src/components/VideoPlayer.vue`, add this in the `setupPlaylist` function:

```javascript
player.on('playlistitem', () => {
  const currentItem = player.playlist()[player.playlist.currentItem()];
  if (currentItem) {
    emit('channel-changed', currentItem);
    // ... rest of existing code
  }
});
```

Then in App.vue, add the emit definition for VideoPlayer:

```javascript
// Define what events VideoPlayer emits
const emit = defineEmits(['channel-changed']);
```

And handle the event in the template:

```vue
<VideoPlayer 
  v-if="videoOptions" 
  :options="videoOptions" 
  :customAdUrls="customAdUrls"
  @channel-changed="currentChannel = $event"
/>
```

### Step 6: Add EPG Display to Template

In the template section of `src/App.vue`, add the EPG component after the VideoPlayer:

```vue
<!-- Video Player -->
<div class="w-full max-w-3xl flex flex-col justify-center">
  <VideoPlayer 
    v-if="videoOptions" 
    :options="videoOptions" 
    :customAdUrls="customAdUrls"
    @channel-changed="currentChannel = $event"
  />
  
  <!-- EPG Display -->
  <div v-if="videoOptions && showEPG" class="mt-4">
    <EPGDisplay 
      :tvg-id="currentChannel?.tvgId"
      :channel-id="currentChannel?.name"
      @epg-loaded="handleEpgLoaded"
    />
  </div>
  
  <!-- Toggle EPG Button -->
  <button 
    v-if="videoOptions"
    @click="showEPG = !showEPG"
    class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
  >
    {{ showEPG ? '📺 Hide Program Guide' : '📺 Show Program Guide' }}
  </button>
</div>
```

### Step 7: Handle EPG Loaded Event

Add this method to handle when EPG data is loaded:

```javascript
const handleEpgLoaded = (epgData) => {
  console.log('EPG data loaded:', epgData);
  // You can store this in a ref if needed for other features
};
```

## Usage Instructions

### For Users

1. **Load a Playlist**: Upload or paste your M3U8 playlist as usual

2. **Show EPG**: Click the "Show Program Guide" button below the video player

3. **Load EPG Data**: 
   - If your M3U8 includes an EPG URL (e.g., `url-tvg="http://..."`), it will auto-detect
   - Otherwise, paste an XMLTV EPG URL in the input field and click "Load EPG"

4. **View Program Info**:
   - Current program shows with a progress bar
   - "Up Next" displays the next program
   - Full day schedule is scrollable below

### EPG URL Sources

Popular IPTV EPG providers:
- **IPTV-EPG.com**: Offers free and paid EPG services
- **EPG.best**: Commercial EPG data
- **tv.mail.ru/epg**: Russian EPG
- **Your IPTV Provider**: Many providers include EPG URLs in their playlists

### EPG Data Format

EPG must be in XMLTV format. Example structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="channel1">
    <display-name>Channel Name</display-name>
  </channel>
  <programme start="20260119120000 +0000" stop="20260119130000 +0000" channel="channel1">
    <title>Program Title</title>
    <desc>Program description</desc>
    <category>News</category>
  </programme>
</tv>
```

### M3U8 TVG Attributes

For EPG to work, your M3U8 channels should include TVG attributes:

```m3u
#EXTM3U url-tvg="http://example.com/epg.xml"
#EXTINF:-1 tvg-id="channel1" tvg-name="Channel Name" tvg-logo="logo.png" group-title="News",Channel Display Name
http://stream-url.com/stream.m3u8
```

## Advanced Features

### 1. Automatic EPG Refresh

The EPG component automatically refreshes every 30 seconds to update:
- Current program progress
- Transition to next program
- Live program status

### 2. Local Storage

EPG data is cached in localStorage to avoid re-downloading on every page load.

### 3. Channel Matching

The system matches channels using:
1. `tvg-id` (preferred) - exact EPG channel ID
2. `channel name` (fallback) - matches by name

### 4. Category Grouping

Use the `groupChannelsByCategory()` utility to create a categorized channel list:

```javascript
import { groupChannelsByCategory } from './utils/m3u8Parser.js';

const grouped = groupChannelsByCategory(videoOptions.value.playlist);
// Returns: { "News": [...channels], "Sports": [...channels], ... }
```

## Styling Customization

The EPG component uses Tailwind classes and includes dark mode support. To customize:

1. **Colors**: Edit the Tailwind classes in `EPGDisplay.vue`
2. **Progress Bar**: Modify the `.bg-blue-600` class in the progress bar div
3. **Layout**: Adjust spacing with Tailwind utilities (`p-4`, `mb-4`, etc.)

## Troubleshooting

### EPG Not Showing Program Data

1. **Check TVG-ID**: Ensure your M3U8 has `tvg-id` attributes matching the EPG
2. **Verify EPG URL**: Test the EPG URL directly in a browser
3. **CORS Issues**: EPG URL must allow CORS or use a proxy
4. **Time Zones**: Ensure EPG times match your time zone

### Parser Errors

1. **Invalid XMLTV**: Validate your EPG XML format
2. **Encoding**: EPG should be UTF-8 encoded
3. **Large Files**: Very large EPG files may cause browser slowdown

### Performance Issues

1. **Reduce Update Frequency**: Change the 30-second interval to 60 seconds
2. **Limit Programs**: Only load today's programs instead of full EPG
3. **Use Service Worker**: Cache EPG data with service worker

## Future Enhancements

### 1. EPG Grid View
Create a traditional grid-style EPG showing multiple channels:

```vue
<EPGGrid 
  :channels="videoOptions.playlist"
  :programs="epgData.programs"
  :time-range="{ start: dayStart, end: dayEnd }"
  @program-selected="playProgram"
/>
```

### 2. DVR/Catch-up
Add ability to play past programs if your IPTV supports it:

```javascript
const playProgram = (program) => {
  if (program.stop < new Date() && supportsCatchup) {
    // Load catch-up stream
  }
};
```

### 3. Program Reminders
Set notifications for upcoming programs using the Notifications API.

### 4. Search Programs
Add EPG search to find programs across all channels:

```javascript
const searchPrograms = (query) => {
  return Object.values(epgData.programs)
    .flat()
    .filter(p => p.title.includes(query) || p.description.includes(query));
};
```

## Testing

### Test with Sample EPG

Create a test XMLTV file in `public/test-epg.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tv>
  <channel id="test1">
    <display-name>Test Channel</display-name>
  </channel>
  <programme start="20260119000000 +0000" stop="20260119235959 +0000" channel="test1">
    <title>All Day Test Program</title>
    <desc>This is a test program for EPG functionality</desc>
    <category>Testing</category>
  </programme>
</tv>
```

Then load it in the EPG component using: `http://localhost:5173/test-epg.xml`

### Test M3U8 with TVG

Create `public/test-playlist.m3u8`:

```m3u
#EXTM3U url-tvg="http://localhost:5173/test-epg.xml"
#EXTINF:-1 tvg-id="test1" tvg-name="Test Channel" tvg-logo="/favicon.svg" group-title="Test",Test Channel
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/mastashake08/iptv-viewer/issues
- Twitter/X: @mastashake08
- Website: https://jyroneparker.com

## License

This implementation follows the main project's license.
