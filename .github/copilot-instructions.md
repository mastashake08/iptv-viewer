# IPTV Viewer - Copilot Instructions

## Project Overview
This is a Vue 3 + Vite PWA for playing IPTV playlists (`.m3u8` and `.m3u` files) with Video.js. Users can load playlists via drag-and-drop, file picker, URL input, or system file launcher integration.

## Architecture & Key Components

### Component Structure
- **[src/App.vue](src/App.vue)**: Main app logic handling playlist loading, M3U8 parsing, and drag-and-drop. All playlist parsing and video option construction happens here.
- **[src/components/VideoPlayer.vue](src/components/VideoPlayer.vue)**: Video.js wrapper with playlist UI, Chrome PiP plugin support. Receives `options` prop and reinitializes player on options change.
- **[src/components/PWABadge.vue](src/components/PWABadge.vue)**: PWA install prompt component

### M3U8 Parsing Pattern
The app uses `m3u8-parser` library to parse playlists. The critical parsing logic in [App.vue](src/App.vue):
```javascript
// Parse segments (individual streams) first, fall back to playlists
sources = parsedManifest.segments.map((segment) => ({
  sources:[{ src: segment.uri, type: "application/x-mpegURL" }],
  name: segment.title.match(/group-title="[^"]*",(.+)/)[1] ?? null,
  poster: '/favicon.svg'
}));
```
**Important**: Name extraction uses regex `group-title="[^"]*",(.+)` to parse M3U8 metadata. Handle cases where regex fails with fallback logic.

### Video.js Configuration
The `videoOptions` object structure passed to VideoPlayer:
- Must include both `sources` (for initial video) and `playlist` (for playlist UI) - they should be identical arrays
- Set `liveui: true` for live stream support
- Use `controlBar.skipButtons` for forward/backward seeking
- Set `autoplay: true` and `preload: "auto"` for immediate playback

## PWA Integration

### File Handler API
The app registers as a handler for `.m3u8` and `.m3u` files via [vite.config.js](vite.config.js) manifest:
```javascript
file_handlers: [{
  action: "/",
  accept: { "application/x-mpegURL": [".m3u8", ".m3u"] },
  launch_type: "single-client"
}]
```
The `launchQueue` API in [App.vue](src/App.vue) handles files opened from the system.

### Protocol Handler
Registers custom `web+shaketv://` protocol for deep linking (`?url=%s` query param).

### PWA Configuration
- Uses `vite-plugin-pwa` with `registerType: 'prompt'` - user must explicitly accept update
- `injectRegister: false` - manual service worker registration
- Assets generated via `@vite-pwa/assets-generator` from `public/logo.png`

## Development Workflow

### Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build locally

### Key Dependencies
- **Video.js ecosystem**: `video.js`, `videojs-playlist`, `videojs-playlist-ui`, `@bnnvara/videojs-chrome-pip`
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` plugin), Video.js City theme (`@videojs/themes`)
- **M3U8**: `m3u8-parser` for playlist parsing

## Project-Specific Patterns

### State Management
No Vuex/Pinia - uses Vue 3 Composition API with reactive refs. Key state in [App.vue](src/App.vue):
- `videoOptions` - triggers VideoPlayer reinitialization when changed (watch in VideoPlayer)
- `isDragging` - drag-and-drop UI feedback
- `videoUrl` - URL input binding

### Video Player Lifecycle
In [VideoPlayer.vue](src/components/VideoPlayer.vue):
1. `onMounted`: Initialize Video.js instance
2. `watch(props.options)`: **Dispose and recreate** player when options change (important for playlist switching)
3. `onBeforeUnmount`: Always dispose player to prevent memory leaks

### URL Parameter Handling
On mount, App.vue checks for `?url=` query param to auto-load playlists from deep links.

## Styling Conventions
- Tailwind utility classes for layout and components
- Dark mode support via `dark:` variants (e.g., `bg-gray-100 dark:bg-gray-900`)
- Video.js City theme applied via `vjs-theme-city` class
- Responsive sizing: `max-w-3xl`, `w-full`, `vjs-fluid` for video responsiveness

## External Integrations
- **Google AdSense**: Integrated in [index.html](index.html) and App.vue template
- **In-app purchase**: `buyPlaylist()` function calls `https://shaketv.jyroneparker.com/api/create-intent` for Stripe integration
- **Media Session API**: Referenced in README but not yet implemented in code

## Common Gotchas
- **Playlist UI element**: Must exist in DOM before calling `player.playlistUi()`. The selector `.vjs-playlist` is placed in VideoPlayer template.
- **Sharp version override**: `package.json` locks `sharp` to 0.32.6 for PWA asset generation compatibility
- **Manifest name mismatch**: `package.json` says "my-vue-app" but PWA manifest uses "iptv-viewer"
