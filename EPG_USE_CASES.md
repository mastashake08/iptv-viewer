# EPG Use Cases & Examples

## Common Use Cases

### 1. Basic EPG Integration

**Scenario**: User has an M3U8 playlist with TVG attributes and wants to see program information.

**M3U8 Example**:
```m3u
#EXTM3U url-tvg="http://example.com/epg.xml.gz"
#EXTINF:-1 tvg-id="bbc1.uk" tvg-name="BBC One" tvg-logo="https://example.com/logos/bbc1.png" group-title="UK",BBC One
http://stream.example.com/bbc1/index.m3u8
#EXTINF:-1 tvg-id="cnn.us" tvg-name="CNN" tvg-logo="https://example.com/logos/cnn.png" group-title="News",CNN International
http://stream.example.com/cnn/index.m3u8
```

**Result**: App automatically detects EPG URL and displays program guide for each channel.

---

### 2. Manual EPG Loading

**Scenario**: Playlist doesn't include EPG URL, user provides it manually.

**Steps**:
1. Load playlist normally
2. Click "Show Program Guide"
3. Enter EPG URL: `http://example.com/epg.xml`
4. Click "Load EPG"
5. EPG data loads and shows current programs

---

### 3. Multi-Provider Playlists

**Scenario**: Combining channels from different IPTV providers with different EPG sources.

**Solution**: Use composite EPG or load multiple EPG sources.

```javascript
// Custom implementation in App.vue
const loadMultipleEPGs = async (urls) => {
  const allEpgData = { channels: {}, programs: {} };
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const xml = await response.text();
      const epgData = parseEPG(xml);
      
      // Merge data
      Object.assign(allEpgData.channels, epgData.channels);
      Object.assign(allEpgData.programs, epgData.programs);
    } catch (error) {
      console.error(`Failed to load EPG from ${url}:`, error);
    }
  }
  
  return allEpgData;
};
```

---

### 4. Categorized Channel View

**Scenario**: Display channels grouped by category with EPG info.

```vue
<!-- Add to App.vue template -->
<div v-if="videoOptions" class="w-full max-w-3xl mb-4">
  <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Channels by Category</h3>
  <div v-for="(channels, category) in channelsByCategory" :key="category" class="mb-4">
    <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{{ category }}</h4>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
      <button
        v-for="(channel, index) in channels"
        :key="index"
        @click="switchToChannel(index)"
        class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
      >
        <img v-if="channel.tvgLogo" :src="channel.tvgLogo" alt="" class="w-12 h-12 mx-auto mb-2 object-contain" />
        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ channel.name }}</div>
      </button>
    </div>
  </div>
</div>
```

```javascript
// Add to App.vue script
import { groupChannelsByCategory } from './utils/m3u8Parser.js';

const channelsByCategory = computed(() => {
  if (!videoOptions.value?.playlist) return {};
  return groupChannelsByCategory(videoOptions.value.playlist);
});

const switchToChannel = (index) => {
  // Implement channel switching logic
  // This would interact with VideoPlayer to change the active channel
};
```

---

### 5. Program Search

**Scenario**: User wants to find specific programs across all channels.

```vue
<!-- Add to App.vue -->
<div v-if="videoOptions && showEPG" class="w-full max-w-3xl mb-4">
  <input
    v-model="searchQuery"
    type="text"
    placeholder="Search programs..."
    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    @input="searchPrograms"
  />
  
  <div v-if="searchResults.length > 0" class="mt-2 max-h-64 overflow-y-auto">
    <div
      v-for="(result, index) in searchResults"
      :key="index"
      class="p-3 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      @click="jumpToProgram(result)"
    >
      <div class="font-semibold text-gray-900 dark:text-white">{{ result.title }}</div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ result.channelName }} • {{ formatTime(result.start) }}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ result.description }}</div>
    </div>
  </div>
</div>
```

```javascript
// Add to App.vue script
const searchQuery = ref('');
const searchResults = ref([]);
const epgDataRef = ref(null);

const searchPrograms = () => {
  if (!epgDataRef.value || !searchQuery.value) {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  const results = [];
  
  Object.entries(epgDataRef.value.programs).forEach(([channelId, programs]) => {
    programs.forEach(program => {
      if (
        program.title.toLowerCase().includes(query) ||
        program.description?.toLowerCase().includes(query)
      ) {
        results.push({
          ...program,
          channelName: epgDataRef.value.channels[channelId]?.name || channelId
        });
      }
    });
  });
  
  searchResults.value = results.sort((a, b) => a.start - b.start);
};

const jumpToProgram = (program) => {
  // Find channel with matching tvg-id
  const channelIndex = videoOptions.value.playlist.findIndex(
    ch => ch.tvgId === program.channelId
  );
  
  if (channelIndex >= 0) {
    // Switch to that channel
    // Note: You'd need to implement actual channel switching in VideoPlayer
    console.log('Switch to channel:', channelIndex, program);
  }
};

const handleEpgLoaded = (epgData) => {
  epgDataRef.value = epgData;
};
```

---

### 6. Now Playing Banner

**Scenario**: Show a persistent banner with current program info.

```vue
<!-- Add to App.vue template, above video player -->
<div v-if="currentProgram && videoOptions" 
     class="w-full max-w-3xl mb-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg">
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <div class="text-sm opacity-90 mb-1">NOW ON {{ currentChannel?.name?.toUpperCase() }}</div>
      <div class="text-xl font-bold">{{ currentProgram.title }}</div>
      <div class="text-sm opacity-90 mt-1">
        {{ formatTime(currentProgram.start) }} - {{ formatTime(currentProgram.stop) }}
      </div>
    </div>
    <div class="ml-4">
      <div class="text-3xl">📺</div>
    </div>
  </div>
  <div class="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
    <div class="h-full bg-white transition-all" :style="{ width: `${programProgress}%` }"></div>
  </div>
</div>
```

```javascript
// Add computed property
import { getCurrentProgram, getProgramProgress } from './utils/epgParser.js';

const currentProgram = computed(() => {
  if (!epgDataRef.value || !currentChannel.value?.tvgId) return null;
  return getCurrentProgram(epgDataRef.value.programs, currentChannel.value.tvgId);
});

const programProgress = computed(() => {
  if (!currentProgram.value) return 0;
  return getProgramProgress(currentProgram.value);
});
```

---

### 7. Time-Shift / Catch-Up TV

**Scenario**: Allow users to watch past programs (if provider supports it).

```vue
<!-- Add to EPGDisplay.vue or create new component -->
<div v-if="supportsCatchup" class="mt-4">
  <h3 class="text-lg font-semibold mb-2">Recently Aired</h3>
  <div v-for="program in recentPrograms" :key="program.start" class="mb-2">
    <button
      @click="playCatchup(program)"
      class="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
    >
      <div class="font-semibold">{{ program.title }}</div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ formatTime(program.start) }} - {{ formatTime(program.stop) }}
      </div>
    </button>
  </div>
</div>
```

```javascript
// Catch-up implementation
const playCatchup = (program) => {
  // This depends on your IPTV provider's catch-up format
  // Common formats:
  
  // 1. Time-shift parameter
  const catchupUrl = `${currentChannel.value.sources[0].src}?utc=${Math.floor(program.start.getTime() / 1000)}`;
  
  // 2. Archive URL pattern
  // const catchupUrl = `http://provider.com/archive/${channelId}/${formatDate(program.start)}.m3u8`;
  
  // 3. VOD style
  // const catchupUrl = `http://provider.com/vod/${program.id}.m3u8`;
  
  // Update video source
  videoOptions.value = {
    ...videoOptions.value,
    sources: [{
      src: catchupUrl,
      type: 'application/x-mpegURL'
    }]
  };
};
```

---

### 8. EPG Grid View (Advanced)

**Scenario**: Traditional TV guide with timeline grid.

```vue
<!-- Create new component: EPGGrid.vue -->
<template>
  <div class="epg-grid-container">
    <div class="time-header">
      <div v-for="hour in hours" :key="hour" class="time-slot">
        {{ hour }}:00
      </div>
    </div>
    
    <div class="channels-grid">
      <div v-for="channel in channels" :key="channel.tvgId" class="channel-row">
        <div class="channel-info">
          <img v-if="channel.tvgLogo" :src="channel.tvgLogo" alt="" class="channel-logo" />
          <span class="channel-name">{{ channel.name }}</span>
        </div>
        
        <div class="programs-timeline">
          <div
            v-for="program in getChannelPrograms(channel.tvgId)"
            :key="program.start"
            class="program-block"
            :style="getProgramStyle(program)"
            @click="selectProgram(program)"
          >
            <div class="program-title">{{ program.title }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  channels: Array,
  programs: Object,
  startHour: { type: Number, default: 6 },
  endHour: { type: Number, default: 24 }
});

const hours = computed(() => {
  const h = [];
  for (let i = props.startHour; i <= props.endHour; i++) {
    h.push(i);
  }
  return h;
});

const getChannelPrograms = (channelId) => {
  return props.programs[channelId] || [];
};

const getProgramStyle = (program) => {
  const start = dayjs(program.start);
  const stop = dayjs(program.stop);
  const gridStart = dayjs().startOf('day').hour(props.startHour);
  
  const startOffset = start.diff(gridStart, 'minute');
  const duration = stop.diff(start, 'minute');
  
  const minutesPerPixel = 2; // Adjust for zoom level
  
  return {
    left: `${startOffset / minutesPerPixel}px`,
    width: `${duration / minutesPerPixel}px`
  };
};

const selectProgram = (program) => {
  console.log('Selected program:', program);
};
</script>

<style scoped>
.epg-grid-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.time-header {
  display: flex;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.time-slot {
  min-width: 180px;
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  border-right: 1px solid #e5e7eb;
}

.channel-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.channel-info {
  min-width: 150px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  position: sticky;
  left: 0;
  z-index: 5;
  border-right: 1px solid #e5e7eb;
}

.channel-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.programs-timeline {
  position: relative;
  flex: 1;
  min-height: 60px;
}

.program-block {
  position: absolute;
  top: 4px;
  height: calc(100% - 8px);
  background: #3b82f6;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  overflow: hidden;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.program-block:hover {
  background: #2563eb;
}

.program-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
```

---

### 9. Program Notifications

**Scenario**: Notify users when a favorite program is about to start.

```javascript
// Add to App.vue or create notification utility
const favoritePrograms = ref([]);

const addToFavorites = (program) => {
  favoritePrograms.value.push(program);
  localStorage.setItem('favoritePrograms', JSON.stringify(favoritePrograms.value));
  scheduleNotification(program);
};

const scheduleNotification = (program) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    setupProgramAlert(program);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        setupProgramAlert(program);
      }
    });
  }
};

const setupProgramAlert = (program) => {
  const now = new Date();
  const programStart = new Date(program.start);
  const alertTime = programStart - 5 * 60 * 1000; // 5 minutes before
  
  if (alertTime > now) {
    setTimeout(() => {
      new Notification(`${program.title} starts soon!`, {
        body: `Starting in 5 minutes on ${currentChannel.value.name}`,
        icon: currentChannel.value.tvgLogo || '/favicon.svg',
        badge: '/favicon.svg'
      });
    }, alertTime - now);
  }
};
```

---

### 10. EPG Data Compression & Optimization

**Scenario**: Large EPG files cause slow loading.

```javascript
// Utility for EPG compression
const compressEPGData = (epgData) => {
  // Only keep today's and tomorrow's programs
  const today = dayjs().startOf('day');
  const tomorrow = dayjs().add(2, 'day').startOf('day');
  
  const compressed = {
    channels: epgData.channels,
    programs: {}
  };
  
  Object.entries(epgData.programs).forEach(([channelId, programs]) => {
    compressed.programs[channelId] = programs.filter(program => {
      const programDate = dayjs(program.start);
      return programDate.isAfter(today) && programDate.isBefore(tomorrow);
    });
  });
  
  return compressed;
};

// Use compression before storing
const handleEpgLoaded = (epgData) => {
  const compressed = compressEPGData(epgData);
  localStorage.setItem('epgData', JSON.stringify(compressed));
  epgDataRef.value = compressed;
};
```

---

## Testing Scenarios

### Test Case 1: No EPG Data
- **Setup**: Load playlist without tvg-id attributes
- **Expected**: EPG component shows "No program information available"

### Test Case 2: Invalid EPG URL
- **Setup**: Enter incorrect EPG URL
- **Expected**: Error message "Failed to load EPG data"

### Test Case 3: Mismatched TVG-IDs
- **Setup**: Playlist tvg-ids don't match EPG channel IDs
- **Expected**: EPG shows "No program information" for that channel

### Test Case 4: Timezone Differences
- **Setup**: EPG with different timezone than user
- **Expected**: Times displayed in local timezone correctly

### Test Case 5: Program Transition
- **Setup**: Wait for program to end
- **Expected**: Progress bar reaches 100%, next program becomes current

---

## Production Tips

1. **Use CDN for EPG**: Host EPG files on CDN for faster loading
2. **Compress EPG**: Use gzip compression for large XML files
3. **Cache Strategy**: Cache EPG for 4-6 hours, refresh periodically
4. **Error Handling**: Always provide fallback UI when EPG fails
5. **Performance**: Limit EPG to current day + next day
6. **Mobile**: Reduce refresh frequency on mobile to save battery

---

## Common Issues & Solutions

### Issue: EPG not showing despite correct setup
**Solution**: Check browser console for CORS errors, verify EPG URL is accessible

### Issue: Wrong program times
**Solution**: Verify EPG timezone matches or implement timezone conversion

### Issue: Slow performance with large EPG
**Solution**: Implement data compression and limit program range

### Issue: Channel names don't match
**Solution**: Use tvg-id instead of name matching, ensure playlist has correct tvg-ids

---

For more examples and community contributions, visit:
- GitHub: https://github.com/mastashake08/iptv-viewer
- Issues: https://github.com/mastashake08/iptv-viewer/issues
