<template>
  <div class="flex flex-col items-center w-full">
    <div class="w-full max-w-3xl mx-auto">
      <video
        ref="videoPlayer"
        :id="playerId"
        class="video-js vjs-fluid vjs-big-play-centered vjs-theme-city w-full rounded-lg shadow-lg"
        controls
        playsinline
        preload="auto"
      ></video>
      <div class="vjs-playlist"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-playlist";
import chromePip from '@bnnvara/videojs-chrome-pip';
import "@bnnvara/videojs-chrome-pip/dist/videojs-chrome-pip.min.js";
import "videojs-playlist-ui";
import "videojs-playlist-ui/dist/videojs-playlist-ui.css";
import '@videojs/themes/dist/city/index.css';

// Register the Chrome PiP plugin
videojs.registerPlugin('chromePip', chromePip);

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
  playerId: {
    type: String,
    default: "video-player",
  },
});

const videoPlayer = ref(null);
let player = null;

const setupPlaylist = (options) => {
  if (options.playlist && options.playlist.length > 0) {
    player.playlist(options.playlist);
    // Attach playlist UI to the correct element
    player.playlistUi({ el: player.el().querySelector('.vjs-playlist') });
  }
};

const initializePlayer = (options = props.options) => {
  player = videojs(videoPlayer.value, options, () => {
    // Initialize Chrome PiP plugin
    player.chromePip();
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