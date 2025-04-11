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

    <!-- Search Bar -->
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search playlist..."
        class="search-bar"
      />
    </div>

    <!-- Default Playlist UI -->
    <div class="vjs-playlist"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
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
const searchQuery = ref(""); // Search query for filtering
let player = null;

// Computed property for filtered playlist
const filteredSources = computed(() => {
  if (!props.options.sources) return [];
  return props.options.sources.filter((item) =>
    (item.name || item.src).toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Lifecycle hooks
onMounted(() => {
  initializePlayer();
});

onBeforeUnmount(() => {
  if (player) {
    player.dispose();
  }
});

// Watch for changes in options or search query
watch(
  () => [props.options, searchQuery.value],
  () => {
    if (player) {
      player.playlist(filteredSources.value); // Update playlist with filtered sources
    }
  },
  { deep: true }
);

// Methods
const initializePlayer = (options = props.options) => {
  player = videojs(videoPlayer.value, options, () => {
    console.log("Video.js player is ready!");
  });

  // Initialize the playlist
  if (options.sources && options.sources.length > 0) {
    player.playlist(filteredSources.value); // Set the filtered playlist
    player.playlistUi(); // Enable the default playlist UI
  } else {
    console.error("No sources available for the playlist.");
  }
};
</script>

<style scoped>
/* Add styles for the search bar */
.search-container {
  margin: 1em 0;
  text-align: center;
}

.search-bar {
  padding: 0.5em;
  width: 80%;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

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