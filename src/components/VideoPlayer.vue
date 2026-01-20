<template>
  <div class="flex flex-col items-center w-full">
    <div class="w-full max-w-3xl mx-auto">
      <video
        ref="videoPlayer"
        :id="playerId"
        class="video-js vjs-fluid vjs-big-play-centered vjs-theme-fantasy w-full rounded-lg shadow-lg"
        controls
        playsinline
        preload="auto"
      ></video>
      <!-- Scrollable playlist container -->
      <div class="vjs-playlist max-h-96 overflow-y-auto playlist-scrollable"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-playlist";
import "videojs-playlist-ui";
import "videojs-playlist-ui/dist/videojs-playlist-ui.css";
import '@videojs/themes/dist/city/index.css';
// Fantasy
import '@videojs/themes/dist/fantasy/index.css';
import { createAdReplacementMiddleware } from '../utils/adReplacementMiddleware.js';

// Import Chrome PiP - only import once
import '@bnnvara/videojs-chrome-pip';

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
  playerId: {
    type: String,
    default: "video-player",
  },
  customAdUrls: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['channel-changed']);

const videoPlayer = ref(null);
let player = null;

const setupPlaylist = (options) => {
  if (options.playlist && options.playlist.length > 0) {
    player.playlist(options.playlist);
    // Attach playlist UI to the correct element
    player.playlistUi({ el: player.el().querySelector('.vjs-playlist') });
    
    // Update title metadata when playlist item changes
    player.on('playlistitem', () => {
      const currentItem = player.playlist()[player.playlist.currentItem()];
      if (currentItem && currentItem.name) {
        // Update document title
        document.title = `${currentItem.name} - IPTV Viewer`;
        
        // Emit channel change event for EPG integration
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
  }
  
  // Register ad replacement middleware if custom ads are provided
  if (props.customAdUrls && props.customAdUrls.length > 0) {
    videojs.use('application/x-mpegURL', createAdReplacementMiddleware(props.customAdUrls));
    videojs.use('application/vnd.apple.mpegurl', createAdReplacementMiddleware(props.customAdUrls));
  }
};

const initializePlayer = (options = props.options) => {
  player = videojs(videoPlayer.value, options, () => {
    // Initialize Chrome PiP plugin for enhanced PiP support
    if (player.chromePip) {
      player.chromePip();
    }
  });
  setupPlaylist(options);
  
  // Add language badges to playlist items
  if (options.playlist) {
    setTimeout(() => {
      addLanguageBadges(options.playlist);
    }, 100);
  }
};

const addLanguageBadges = (playlist) => {
  const playlistEl = document.querySelector('.vjs-playlist');
  if (!playlistEl) return;
  
  const items = playlistEl.querySelectorAll('.vjs-playlist-item');
  
  items.forEach((item, index) => {
    if (playlist[index]?.tvgLanguage) {
      const language = playlist[index].tvgLanguage;
      
      // Check if badge already exists
      if (item.querySelector('.language-badge')) return;
      
      // Create language badge
      const badge = document.createElement('span');
      badge.className = 'language-badge';
      badge.textContent = language.toUpperCase();
      badge.style.cssText = `
        display: inline-block;
        padding: 2px 6px;
        margin-left: 8px;
        font-size: 10px;
        font-weight: bold;
        background: #3b82f6;
        color: white;
        border-radius: 4px;
        vertical-align: middle;
      `;
      
      // Add to the title element
      const titleEl = item.querySelector('.vjs-playlist-name');
      if (titleEl) {
        titleEl.appendChild(badge);
      }
    }
  });
};

onMounted(() => {
  initializePlayer();
});

onBeforeUnmount(() => {
  if (player) {
    player.dispose();
  }
});

watch(
  () => props.options,
  (newOptions) => {
    if (player) {
      player.dispose();
    }
    initializePlayer(newOptions);
  }
);
</script></script>

<style scoped>
/* Mobile-friendly scrollable playlist */
.playlist-scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

/* Ensure smooth scrolling on all devices */
.vjs-playlist {
  scroll-behavior: smooth;
}
</style>
