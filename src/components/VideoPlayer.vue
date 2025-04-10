<template>
  <div>
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-fluid"
      :id="playerId"
      controls
      preload="auto"
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Props
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

// Refs
const videoPlayer = ref(null);
let player = null;

// Lifecycle hooks
onMounted(() => {
  initializePlayer();
  setupMediaSession();
});

onBeforeUnmount(() => {
  if (player) {
    player.dispose();
  }
});

// Watch for changes in options to reload the player
watch(
  () => props.options,
  (newOptions) => {
    if (player) {
      player.dispose();
    }
    initializePlayer(newOptions);
    setupMediaSession();
  }
);

// Methods
const initializePlayer = (options = props.options) => {
  player = videojs(videoPlayer.value, options, () => {
    console.log("Video.js player is ready!");
  });
};

const setupMediaSession = () => {
  if (!("mediaSession" in navigator)) return;

  const video = videoPlayer.value;

  // Set media metadata
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "IPTV Viewer",
    artist: "Mastashake",
    album: "IPTV Playlist",
    artwork: [
      { src: "/favicon.svg", sizes: "96x96", type: "image/svg+xml" },
    ],
  });

  // Media session action handlers
  navigator.mediaSession.setActionHandler("play", () => {
    video.play();
  });

  navigator.mediaSession.setActionHandler("pause", () => {
    video.pause();
  });

  navigator.mediaSession.setActionHandler("seekbackward", (details) => {
    video.currentTime = Math.max(video.currentTime - (details.seekOffset || 10), 0);
  });

  navigator.mediaSession.setActionHandler("seekforward", (details) => {
    video.currentTime = Math.min(video.currentTime + (details.seekOffset || 10), video.duration);
  });

  navigator.mediaSession.setActionHandler("seekto", (details) => {
    if (details.fastSeek && "fastSeek" in video) {
      video.fastSeek(details.seekTime);
    } else {
      video.currentTime = details.seekTime;
    }
  });

  navigator.mediaSession.setActionHandler("stop", () => {
    video.pause();
    video.currentTime = 0;
  });
};
</script>

<style scoped>
/* Add any custom styles for your video player here */
</style>