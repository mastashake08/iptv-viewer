# EPG Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          IPTV Viewer App                             │
│                            (App.vue)                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  M3U8 Playlist      │       │   EPG Data (XMLTV)  │
        │  ───────────────    │       │   ────────────────  │
        │  #EXTM3U            │       │   <?xml ...>        │
        │  url-tvg="..."      │◄──────┤   <tv>              │
        │  #EXTINF:-1         │       │     <channel>       │
        │  tvg-id="ch1"       │       │     <programme>     │
        │  tvg-name="..."     │       │       <title>       │
        │  tvg-logo="..."     │       │       <desc>        │
        │  http://stream...   │       │     </programme>    │
        └─────────────────────┘       └─────────────────────┘
                    │                             │
                    │                             │
                    ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  m3u8Parser.js      │       │   epgParser.js      │
        │  ──────────────      │       │   ──────────        │
        │  • extractTVGAttr() │       │   • parseEPG()      │
        │  • parseM3U8WithEPG │       │   • getCurrent()    │
        │  • extractEPGUrl()  │       │   • getNext()       │
        │  • groupByCategory  │       │   • getTodaysProgs  │
        └─────────────────────┘       └─────────────────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Channel Data Model     │
                    │   ────────────────────   │
                    │   {                      │
                    │     sources: [...],      │
                    │     name: "CNN",         │
                    │     tvgId: "cnn.us",     │
                    │     tvgLogo: "logo.png", │
                    │     groupTitle: "News"   │
                    │   }                      │
                    └──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  VideoPlayer.vue    │       │  EPGDisplay.vue     │
        │  ────────────────    │       │  ───────────────    │
        │  Video.js Player    │       │  Program Guide UI   │
        │  ├─ Playlist UI     │       │  ├─ Current Show    │
        │  ├─ Channel Switch  │───────┤  ├─ Progress Bar    │
        │  └─ Chrome PiP      │       │  ├─ Next Program    │
        └─────────────────────┘       │  └─ Day Schedule    │
                                      └─────────────────────┘
```

## Data Flow

### 1. Playlist Loading
```
User Upload/URL → App.vue → parseManifest() → m3u8Parser
                                                    ↓
                                          Extract TVG attributes
                                                    ↓
                                          Create Channel Objects
                                                    ↓
                                          Pass to VideoPlayer
```

### 2. EPG Loading
```
User Input/Auto-detect → EPGDisplay → Load XMLTV → epgParser
                                                          ↓
                                                    Parse Programs
                                                          ↓
                                                  Store in Component
                                                          ↓
                                                  Display UI
```

### 3. Channel Switching
```
User Clicks Channel → VideoPlayer → playlistitem event → Emit change
                                                               ↓
                                                          App.vue
                                                               ↓
                                                      Update currentChannel
                                                               ↓
                                                          EPGDisplay
                                                               ↓
                                                  Show program for channel
```

## Component Communication

```
App.vue (Parent)
    │
    ├─► VideoPlayer (Child)
    │      Props: options, customAdUrls
    │      Emits: @channel-changed
    │
    └─► EPGDisplay (Child)
           Props: tvgId, channelId
           Emits: @epg-loaded
```

## Key Features

### M3U8 Parser
- **Input**: Raw M3U8 text content
- **Output**: Array of channel objects with EPG metadata
- **Extracts**: tvg-id, tvg-name, tvg-logo, group-title, EPG URL
- **Fallback**: Uses original parser if enhanced parsing fails

### EPG Parser
- **Input**: XMLTV formatted XML content
- **Output**: Structured program data by channel
- **Features**: 
  - Time zone handling
  - Current program detection
  - Progress calculation
  - Schedule filtering

### EPG Display
- **Features**:
  - Auto-refresh (30s interval)
  - localStorage caching
  - Progress visualization
  - Responsive design
  - Dark mode support

## Storage & Caching

```
localStorage
    │
    ├─► epgUrl: "http://..."       (EPG source URL)
    └─► epgData: "{...}"            (Parsed EPG JSON)
```

## Update Cycle

```
Every 30 seconds:
    │
    ├─► Check current time
    ├─► Update program progress
    ├─► Check if program changed
    └─► Re-render UI
```

## Error Handling

```
M3U8 Parsing:
    Enhanced Parser → Fails? → Fallback Parser → Empty? → Error

EPG Loading:
    Fetch URL → CORS Error? → Show message
             → Parse Error? → Show message
             → Success? → Cache & Display
```

## Performance Optimizations

1. **Lazy Loading**: EPG component only rendered when toggled
2. **Caching**: EPG data stored in localStorage
3. **Throttled Updates**: 30-second refresh interval
4. **Conditional Rendering**: UI elements only shown when data exists
5. **Efficient Parsing**: Direct text parsing without heavy dependencies

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Required APIs**:
  - localStorage
  - Fetch API
  - ES6+ features
  - Video.js compatible environment

## Mobile Considerations

- **Touch-friendly**: Large tap targets
- **Responsive**: Adapts to screen size
- **Scrollable**: Day schedule with overflow
- **Performance**: Optimized for mobile CPUs
