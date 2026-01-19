<script setup>
import { ref, onMounted } from "vue";
import HelloWorld from './components/HelloWorld.vue';
import PWABadge from './components/PWABadge.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import { Parser } from 'm3u8-parser';


onMounted(() => {
  let params = new URLSearchParams(document.location.search);
  let url = params.get("url"); // is the string "Jonathan"
  if (url) {
    videoUrl.value = url;
    loadUrl();
  }
});
const parser = new Parser();
// State
const videoOptions = ref(null);
const isDragging = ref(false);
const videoUrl = ref(""); // For the text input URL
const newChannelName = ref("");
const newChannelUrl = ref("");

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
const buyPlaylist = async () => {
  const response = await fetch("https://shaketv.jyroneparker.com/api/create-intent");
  const data = await response.json();
  window.open(data.url, "_blank");
};

const savePlaylist = () => {
  if (!videoOptions.value || !videoOptions.value.playlist) {
    alert("No playlist loaded to save.");
    return;
  }

  // Generate M3U8 format
  let m3u8Content = "#EXTM3U\n";
  
  videoOptions.value.playlist.forEach((item) => {
    const duration = -1; // Unknown duration for live streams
    const title = item.name || "Untitled";
    const url = item.sources[0].src;
    
    m3u8Content += `#EXTINF:${duration},${title}\n`;
    m3u8Content += `${url}\n`;
  });

  // Create blob and download
  const blob = new Blob([m3u8Content], { type: "application/x-mpegURL" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "playlist.m3u8";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const addToPlaylist = () => {
  if (!newChannelName.value || !newChannelUrl.value) {
    alert("Please enter both channel name and URL.");
    return;
  }

  const newChannel = {
    sources: [{
      src: newChannelUrl.value,
      type: "application/x-mpegURL",
    }],
    name: newChannelName.value,
    poster: '/favicon.svg'
  };

  // If no playlist exists, create a new one
  if (!videoOptions.value) {
    videoOptions.value = {
      enableSmoothSeeking: true,
      enableDocumentPictureInPicture: true,
      liveui: true,
      controls: true,
      autoplay: true,
      controlBar: {
        skipButtons: {
          forward: 10,
          backward: 10
        }
      },
      preload: "auto",
      sources: [newChannel.sources[0]],
      playlist: [newChannel],
    };
  } else {
    // Add to existing playlist
    const updatedPlaylist = [...videoOptions.value.playlist, newChannel];
    videoOptions.value = {
      ...videoOptions.value,
      playlist: updatedPlaylist,
      sources: updatedPlaylist[0].sources,
    };
  }

  // Clear form
  newChannelName.value = "";
  newChannelUrl.value = "";
};

const parseManifest = (manifest) => {
  parser.push(manifest);
    parser.end();

    const parsedManifest = parser.manifest;
 
   try {
    let sources = parsedManifest.segments.map((segment) => ({
     sources:[{
      src: segment.uri,
      type: "application/x-mpegURL",
     }], 
      name: segment.title.match(/group-title="[^"]*",(.+)/)[1] ?? null,
      poster: '/favicon.svg'
    }));
   if (sources.length === 0) {
     sources = parsedManifest.playlists.map((playlist) => ({
      sources:[{
        src: segment.uri,
        type: "application/x-mpegURL",
      }], 
       name: playlist.title.match(/group-title="[^"]*",(.+)/)[1] ?? null,
       poster: '/favicon.svg'
     }));
    }
    return sources;
   } catch (error) {
    let sources = parsedManifest.segments.map((segment) => ({
     sources:[{
      src: segment.uri,
      type: "application/x-mpegURL",
     }], 
      name: segment.title.match(/group-title="[^"]*",(.+)/) ?? null,
      poster: '/favicon.svg'
    }));
   if (sources.length === 0) {
     sources = parsedManifest.playlists.map((playlist) => ({
      sources:[{
        src: segment.uri,
        type: "application/x-mpegURL",
      }], 
       name: playlist.title.match(/group-title="[^"]*",(.+)/) ?? null,
       poster: '/favicon.svg'
     }));
    }
    return sources;
   }
    
};
// Load File
const loadFile = async (file) => {
  if (file && (file.name.endsWith(".m3u8") || file.name.endsWith(".m3u"))) {
    const manifest = await file.text();
    const sources = parseManifest(manifest);
    videoOptions.value = {
      enableSmoothSeeking: true,
      enableDocumentPictureInPicture: true,
      liveui:true,
      controls: true,
      autoplay: true,
      controlBar: {
        skipButtons: {
          forward: 10,
          backward: 10
        }
      },
      preload: "auto",
      sources: sources,
      playlist: sources,
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
      enableSmoothSeeking: true,
      enableDocumentPictureInPicture: true,
      liveui:true,
      controlBar: {
        skipButtons: {
          forward: 10,
          backward: 10
        }
      },
      controls: true,
      autoplay: true,
      preload: "auto",
      sources: sources,
      playlist: sources,
    };
  } else {
    alert("Please enter a valid URL.");
  }
};

// File Handler for Launcher Window
if ("launchQueue" in window) {
  launchQueue.setConsumer(async (launchParams) => {
   
    for (const fileHandle of launchParams.files) {
      // Handle the file.
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
    :class="{ 'bg-blue-50': isDragging }"
    class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors"
  >
    <div class="w-full flex flex-col items-center justify-center">
      <img src="/favicon.svg" class="w-24 h-24 my-6" alt="iptv-viewer logo" />
      <HelloWorld msg="IPTV Viewer by Mastashake" />
      <ins class="adsbygoogle my-4"
        style="display:block"
        data-ad-client="ca-pub-7023023584987784"
        data-ad-slot="2843635239"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>

      <button class="mt-3 mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        @click="buyPlaylist">
        Get over 5000 IPTV channels from around the world!
      </button>
      
      <button v-if="videoOptions" 
        class="mb-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        @click="savePlaylist">
        💾 Save Playlist
      </button>
      
      <PWABadge class="mb-4" />

      <p v-if="!videoOptions" class="text-gray-700 dark:text-gray-200 mb-2 text-center w-full max-w-md mx-auto">
        Drag and drop a <code>.m3u8</code> or <code>.m3u</code> file, upload one, or enter a URL to load the video.
      </p>

      <div class="w-full max-w-md flex flex-col items-center gap-2 mb-4">
        <!-- File Upload Button -->
        <input
          type="file"
          accept=".m3u8,.m3u"
          @change="handleFileUpload"
          class="w-full block mb-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-white"
        />

        <!-- URL Input -->
        <div class="flex w-full gap-2">
          <input
            type="text"
            v-model="videoUrl"
            placeholder="Enter video URL"
            class="text-white flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
          />
          <button
            @click="loadUrl"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Load URL
          </button>
        </div>
        
        <!-- Add to Playlist Section -->
        <div class="w-full border-t border-gray-300 dark:border-gray-700 pt-4 mt-2">
          <p class="text-gray-700 dark:text-gray-200 text-sm mb-2 text-center font-semibold">
            Add Channel to Playlist
          </p>
          <div class="flex flex-col gap-2">
            <input
              type="text"
              v-model="newChannelName"
              placeholder="Channel name (e.g., CNN)"
              class="text-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-center"
            />
            <div class="flex gap-2">
              <input
                type="text"
                v-model="newChannelUrl"
                placeholder="Stream URL"
                class="text-white flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-center"
              />
              <button
                @click="addToPlaylist"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition whitespace-nowrap"
              >
                ➕ Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Player -->
      <div class="w-full max-w-3xl flex justify-center">
        <VideoPlayer v-if="videoOptions" :options="videoOptions" />
      </div>
    </div>
  </div>

  <!-- Features and How-to Section -->
  <section class="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-800 dark:text-gray-100 text-center">
    <h2 class="text-2xl font-bold mb-2">Features</h2>
    <ul class="list-disc list-inside mb-4 space-y-1 text-left mx-auto max-w-md">
      <li>Load and play <code>.m3u8</code> or <code>.m3u</code> IPTV playlists</li>
      <li>Drag-and-drop or use file picker to open playlists</li>
      <li>Paste playlist URLs for instant access</li>
      <li>Responsive Video.js player with playlist navigation</li>
      <li>Installable as a Progressive Web App (PWA)</li>
      <li>In-app purchases for premium playlists</li>
    </ul>
    <h2 class="text-2xl font-bold mb-2">How to Use</h2>
    <ol class="list-decimal list-inside space-y-1 text-left mx-auto max-w-md">
      <li>Drag and drop your <code>.m3u8</code> or <code>.m3u</code> file onto the app, or use the file picker.</li>
      <li>Or paste a playlist URL and click "Load URL".</li>
      <li>Browse channels and click to play.</li>
      <li>Use your device’s media controls for playback.</li>
      <li>For premium playlists, use the in-app purchase option.</li>
    </ol>
  </section>

  <!-- Footer with Socials, Patreon, and GitHub -->
  <footer class="text-center py-6 bg-gray-50 dark:bg-gray-900 mt-8">
    <div class="flex flex-wrap justify-center gap-4 text-lg">
      <a href="https://x.com/mastashake08" target="_blank" rel="noopener" class="hover:underline text-blue-600 dark:text-blue-400">Twitter/X</a>
      <span>|</span>
      <a href="https://instagram.com/mastashake08" target="_blank" rel="noopener" class="hover:underline text-pink-600 dark:text-pink-400">Instagram</a>
      <span>|</span>
      <a href="https://youtube.com/c/jyroneparker" target="_blank" rel="noopener" class="hover:underline text-red-600 dark:text-red-400">YouTube</a>
      <span>|</span>
      <a href="https://jyroneparker.com" target="_blank" rel="noopener" class="hover:underline text-gray-700 dark:text-gray-200">Website</a>
      <span>|</span>
      <a href="https://patreon.com/mastashake08" target="_blank" rel="noopener" class="font-bold text-orange-600 dark:text-orange-400 hover:underline">Support on Patreon</a>
      <span>|</span>
      <a href="https://github.com/mastashake08/iptv-viewer" target="_blank" rel="noopener" class="hover:underline text-gray-800 dark:text-gray-300 font-semibold">GitHub Repo</a>
    </div>
  </footer>
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
