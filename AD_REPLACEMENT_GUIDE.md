# Ad Replacement Guide

This guide explains how to replace ad slates in IPTV streams with your own custom advertisements.

## How It Works

The app uses **Video.js middleware** to intercept M3U8 playlist requests and detect ad breaks. When it finds ad slate segments (marked by `#EXT-X-CUE-OUT` tags), it replaces them with your custom ad URLs.

### Ad Break Detection

The middleware looks for these HLS markers in M3U8 playlists:
- `#EXT-X-CUE-OUT:` - Marks the start of an ad break with duration
- `#EXT-X-CUE-OUT-CONT:` - Marks continuation with elapsed time
- `#EXT-X-CUE-IN` - Marks the end of an ad break
- Segment URLs containing `/ad-slate/`, `ad_slate`, or `slate`

## Configuration

### Basic Setup

In [src/App.vue](src/App.vue), configure your custom ad URLs:

```javascript
const customAdUrls = ref([
  'https://your-cdn.com/ad1.mp4',
  'https://your-cdn.com/ad2.mp4',
  'https://your-cdn.com/ad3.ts'
]);
```

The middleware will rotate through these URLs during ad breaks.

### Advanced Configuration

#### Using HLS Segments

For best compatibility with HLS streams, use `.ts` (Transport Stream) segments:

```javascript
const customAdUrls = ref([
  'https://your-cdn.com/ad-segment-001.ts',
  'https://your-cdn.com/ad-segment-002.ts',
  'https://your-cdn.com/ad-segment-003.ts'
]);
```

#### Using MP4 Videos

You can also use MP4 files, but they may cause brief discontinuities:

```javascript
const customAdUrls = ref([
  'https://your-cdn.com/ad-15sec.mp4',
  'https://your-cdn.com/ad-30sec.mp4'
]);
```

#### Generate Segments from Single Video

If you have one video file to show repeatedly during the ad break:

```javascript
import { generateAdSegments } from './utils/adReplacementMiddleware.js';

const customAdUrls = ref(
  generateAdSegments(
    'https://your-cdn.com/my-ad.mp4',
    10,  // segment duration in seconds
    180  // total ad break duration in seconds
  )
);
```

## Example: Adult Swim Ad Slate

For the Adult Swim Rick and Morty stream example, here's what the middleware detects:

```m3u8
#EXT-X-DISCONTINUITY
#EXT-X-ASSET:CAID=0x0000000000000002
#EXT-X-CUE-OUT:180.180  ← Ad break starts (180 seconds)
#EXT-X-KEY:METHOD=NONE
#EXTINF:10.010,
https://adultswim-vodlive.cdn.turner.com/live/ad-slate/index_layer3_00001.ts
                                                         ^^^^^^^^ detected as ad slate
```

The middleware replaces these segments:
```
ad-slate/index_layer3_00001.ts → your-cdn.com/ad1.mp4
ad-slate/index_layer3_00002.ts → your-cdn.com/ad2.mp4
ad-slate/index_layer3_00003.ts → your-cdn.com/ad3.mp4
ad-slate/index_layer3_00004.ts → your-cdn.com/ad1.mp4 (rotates)
```

## Hosting Your Ad Videos

### Option 1: Self-Hosted

Host on your own CDN or web server with CORS enabled:

```nginx
# nginx configuration
location /ads/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, HEAD, OPTIONS';
}
```

### Option 2: Cloud Storage

Use cloud storage with public access:
- **AWS S3**: Enable CORS and make objects public
- **Cloudflare R2**: Configure CORS policy
- **Google Cloud Storage**: Set bucket to public-read

Example CORS configuration for S3:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Option 3: Video CDN Services

Professional CDN services:
- **Bunny CDN**
- **Cloudflare Stream**
- **Mux**

## Video Format Recommendations

### For HLS Streams (.m3u8)

1. **Use Transport Streams (.ts)**:
   ```bash
   ffmpeg -i input.mp4 \
     -c:v h264 -c:a aac \
     -f hls -hls_time 10 \
     -hls_list_size 0 \
     output.m3u8
   ```

2. **Match the original stream encoding**:
   - Video: H.264
   - Audio: AAC
   - Container: MPEG-TS

### For MP4 Fallback

If using MP4 files, ensure compatibility:
```bash
ffmpeg -i input.mp4 \
  -c:v h264 -profile:v baseline -level 3.0 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

## Testing

1. Add your ad URLs to `customAdUrls` in [src/App.vue](src/App.vue)
2. Load an IPTV stream that has ad breaks
3. Open browser DevTools → Network tab
4. Filter by `.m3u8` or `.ts`
5. Watch for ad break markers and verify your URLs are loaded

## Troubleshooting

### Ads Not Showing

1. **Check console for errors**: Look for CORS or network errors
2. **Verify ad URLs**: Test URLs directly in browser
3. **Check CORS headers**: Use browser DevTools Network tab
4. **Ensure middleware is registered**: Check VideoPlayer initialization

### Video Playback Issues

1. **Format mismatch**: Ensure ad video format matches stream format
2. **Discontinuity errors**: Try using HLS segments instead of MP4
3. **Resolution mismatch**: Match resolution to original stream

### CORS Errors

Add these headers to your ad hosting server:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Range
```

## Disabling Ad Replacement

To disable ad replacement, set `customAdUrls` to an empty array:

```javascript
const customAdUrls = ref([]);
```

Or remove the `:customAdUrls` prop from VideoPlayer in the template.

## API Reference

### `createAdReplacementMiddleware(customAdUrls)`

Creates Video.js middleware for ad replacement.

**Parameters:**
- `customAdUrls` (Array): Array of video URLs to use as replacement ads

**Returns:** Middleware function

### `generateAdSegments(videoUrl, segmentDuration, totalDuration)`

Generates array of segment URLs for a single video.

**Parameters:**
- `videoUrl` (String): URL of the video to repeat
- `segmentDuration` (Number): Duration of each segment in seconds (default: 10)
- `totalDuration` (Number): Total ad break duration in seconds (default: 180)

**Returns:** Array of video URLs

## Privacy & Ethics

**Important**: This feature is designed for:
- Replacing generic ad slates with your own content
- Testing and development purposes
- Personal use

Be aware of:
- Content licensing and distribution rights
- Terms of service for streaming services
- Local regulations regarding ad blocking/replacement

## Future Enhancements

Potential improvements:
- [ ] Ad scheduling/rotation logic
- [ ] Analytics tracking for ad views
- [ ] Dynamic ad insertion based on time/location
- [ ] Support for VAST/VMAP ad standards
- [ ] Ad skip after X seconds
- [ ] Companion banners
