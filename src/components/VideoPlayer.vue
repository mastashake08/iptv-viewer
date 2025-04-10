<template>
  <div>
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-fluid"
      :id="playerId"
      controls
      preload="auto"
    ></video>
    <div class="playlist-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search playlist..."
        class="search-bar"
      />
      <ul class="playlist">
        <li
          v-for="(item, index) in filteredPlaylist"
          :key="index"
          @click="playItem(index)"
          class="playlist-item"
        >
          {{ item.name || item.src }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-playlist-ui";
import "videojs-playlist-ui/dist/videojs-playlist-ui.css";
import "videojs-playlist";
import "videojs-contrib-ads";
import "videojs-contrib-ads/dist/videojs-contrib-ads.css";
import "videojs-preroll-v2";
import "videojs-preroll-v2/dist/videojs-preroll.css";
import * as chromecast from "@silvermine/videojs-chromecast";
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
const searchQuery = ref("");
let player = null;

// Computed property for filtered playlist with original indexes
const filteredPlaylist = computed(() => {
  if (!props.options.sources) return [];
  return props.options.sources
    .map((item, index) => ({ ...item, originalIndex: index })) // Add original index
    .filter((item) =>
      (item.name || item.src).toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

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
    // console.log(chromecast.videojs)
    // player.chromecast({
    //       appId: "2E433510",
    //     })
    player.playlist(options.sources);
    player.playlistUi();
    // player.preroll({
    //   src:"https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_480_1_5MG.mp4"
    // });

  });
  
};

const playItem = (index) => {
  if (player) {
    const originalIndex = filteredPlaylist.value[index].originalIndex; // Get the original index
    player.playlist.currentItem(originalIndex); // Use the original index
    player.play();
  }
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
.playlist-container {
  margin-top: 1em;
}

.search-bar {
  margin-bottom: 1em;
  padding: 0.5em;
  width: 100%;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.playlist {
  list-style: none;
  padding: 0;
}

.playlist-item {
  padding: 0.5em;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
}

.playlist-item:hover {
  background-color: #f0f0f0;
}
</style>