<script setup>
import { ref } from "vue";
import HelloWorld from './components/HelloWorld.vue';
import PWABadge from './components/PWABadge.vue';
import VideoPlayer from './components/VideoPlayer.vue';

// State
const videoOptions = ref(null);
const isDragging = ref(false);

// Drag-and-Drop Handlers
const handleDragOver = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;

  const file = event.dataTransfer.files[0];
  if (file && (file.name.endsWith(".m3u8") || file.name.endsWith(".m3u"))) {
    const url = URL.createObjectURL(file);
    videoOptions.value = {
      controls: true,
      autoplay: true, // Automatically play the new file
      preload: "auto",
      sources: [
        {
          src: url,
          type: "application/x-mpegURL",
        },
      ],
    };
  } else {
    alert("Please drop a valid .m3u8 or .m3u file.");
  }
};

// File Handler for Launcher Window
if ("launchQueue" in window) {
  launchQueue.setConsumer(async (launchParams) => {
    const file = launchParams.files[0];
    if (file && (file.name.endsWith(".m3u8") || file.name.endsWith(".m3u"))) {
      const url = URL.createObjectURL(await file.getFile());
      videoOptions.value = {
        controls: true,
        autoplay: true, // Automatically play the new file
        preload: "auto",
        sources: [
          {
            src: url,
            type: "application/x-mpegURL",
          },
        ],
      };
    } else {
      alert("Please open a valid .m3u8 or .m3u file.");
    }
  });
}
</script>

<template>
  <div
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="{ 'dragging': isDragging }"
    class="drop-zone"
  >
    <img src="/favicon.svg" class="logo" alt="iptv-viewer logo" />
    <HelloWorld msg="IPTV Viewer by Mastashake" />
    <PWABadge />
    <p v-if="!videoOptions">Drag and drop a .m3u8 or .m3u file, or open one via the launcher.</p>
    <VideoPlayer v-if="videoOptions" :options="videoOptions" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 2em;
  text-align: center;
  transition: background-color 0.3s;
}
.drop-zone.dragging {
  background-color: #f0f8ff;
}
</style>
