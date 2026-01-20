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
      <div class="vjs-playlist max-h-96 overflow-y-auto"></div>
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
</script>