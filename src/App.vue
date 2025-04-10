<script setup>
import { ref } from "vue";
import HelloWorld from './components/HelloWorld.vue';
import PWABadge from './components/PWABadge.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import { Parser } from 'm3u8-parser';

const parser = new Parser();
// State
const videoOptions = ref(null);
const isDragging = ref(false);
const videoUrl = ref(""); // For the text input URL

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
  loadFile(file);
};

// File Upload Handler
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  loadFile(file);
};

const parseManifest = (manifest) => {
  parser.push(manifest);
    parser.end();

    const parsedManifest = parser.manifest;
    console.log(parsedManifest);
    let sources = parsedManifest.segments.map((segment) => ({
      src: segment.uri,
      type: "application/x-mpegURL",
      name: segment.uri
    }));
   if (sources.length === 0) {
     sources = parsedManifest.playlists.map((playlist) => ({
       src: playlist.uri,
       type: "application/x-mpegURL",
       name: playlist.uri
     }));
    }
    sources = sources.filter((source) => source.src.startsWith("https://"));
    console.log(sources);
    return sources;
};
// Load File
const loadFile = async (file) => {
  if (file && (file.name.endsWith(".m3u8") || file.name.endsWith(".m3u"))) {
    const manifest = await file.text();
    const sources = parseManifest(manifest);
    videoOptions.value = {
      controls: true,
      autoplay: false,
      controlBar: {
        skipButtons: {
          forward: 10,
          back: 10
        }
      },
      preload: "auto",
      sources: sources,
    };
  } else {
    alert("Please upload a valid .m3u8 or .m3u file.");
  }
};

// Load URL
const loadUrl = async () => {
  if (videoUrl.value) {
    const manifest = await fetch(videoUrl.value).then((res) => res.text());
    const sources = parseManifest(manifest);
    videoOptions.value = {
      controlBar: {
        skipButtons: {
          forward: 10,
          back: 10
        }
      },
      controls: true,
      autoplay: false,
      preload: "auto",
      sources: sources,
    };
  } else {
    alert("Please enter a valid URL.");
  }
};

// File Handler for Launcher Window
if ("launchQueue" in window) {
  launchQueue.setConsumer(async (launchParams) => {
    console.log(launchParams);
    for (const fileHandle of launchParams.files) {
      // Handle the file.
      console.log(fileHandle);
      loadFile(await fileHandle.getFile());
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

    <p v-if="!videoOptions">Drag and drop a .m3u8 or .m3u file, upload one, or enter a URL to load the video.</p>

    <!-- File Upload Button -->
    <input type="file" accept=".m3u8,.m3u" @change="handleFileUpload" />

    <!-- URL Input -->
    <div>
      <input
        type="text"
        v-model="videoUrl"
        placeholder="Enter video URL"
        class="url-input"
      />
      <button @click="loadUrl">Load URL</button>
    </div>

    <!-- Video Player -->
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

.url-input {
  margin: 1em 0;
  padding: 0.5em;
  width: 80%;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
