<template>
  <div>
    <!-- Video.js Player -->
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-fluid"
      :id="playerId"
      controls
      preload="auto"
    ></video>

    <!-- Default Playlist UI -->
    <div class="vjs-playlist"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-playlist";
import "videojs-playlist-ui";
import "videojs-playlist-ui/dist/videojs-playlist-ui.css";


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
  }
);

// Methods
const initializePlayer = (options = props.options) => {
  player = videojs(videoPlayer.value, options, () => {
    console.log("Video.js player is ready!");
  });

  // Initialize the playlist
  if (options.sources && options.sources.length > 0) {
    player.playlist(options.sources); // Set the playlist
    player.playlistUi(); // Enable the default playlist UI
  } else {
    console.error("No sources available for the playlist.");
  }
};
</script>

<style scoped>
/* Add any custom styles for the default playlist UI if needed */
.vjs-playlist {
  margin-top: 1em;
}

.vjs-playlist-item {
  cursor: pointer;
}

.vjs-playlist-item:hover {
  background-color: #f0f0f0;
}
</style>