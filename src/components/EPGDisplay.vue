<template>
  <div class="epg-container bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        📺 Program Guide
      </h2>
      <button
        @click="refresh"
        class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Load EPG Section -->
    <div v-if="!hasEpgData" class="mb-4">
      <div class="flex gap-2">
        <input
          v-model="epgUrl"
          type="url"
          placeholder="Enter EPG/XMLTV URL"
          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          @click="loadEpgFromUrl"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
        >
          Load EPG
        </button>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Enter an XMLTV EPG URL to see program information
      </p>
    </div>

    <!-- Current Program Display -->
    <div v-if="currentProgram" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <div class="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
            NOW PLAYING
          </div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {{ currentProgram.title }}
          </h3>
          <p v-if="currentProgram.subtitle" class="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {{ currentProgram.subtitle }}
          </p>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ formatTime(currentProgram.start) }} - {{ formatTime(currentProgram.stop) }}
            <span class="ml-2 text-gray-500">({{ getDuration(currentProgram.start, currentProgram.stop) }})</span>
          </div>
        </div>
        <div v-if="currentProgram.icon" class="ml-4">
          <img :src="currentProgram.icon" alt="Program icon" class="w-16 h-16 rounded object-cover" />
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="mt-3">
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-600 transition-all duration-1000"
            :style="{ width: `${programProgress}%` }"
          ></div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ programProgress }}% complete
        </div>
      </div>
      
      <p v-if="currentProgram.description" class="text-sm text-gray-700 dark:text-gray-300 mt-3">
        {{ currentProgram.description }}
      </p>
      
      <div v-if="currentProgram.category" class="mt-2">
        <span class="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
          {{ currentProgram.category }}
        </span>
      </div>
    </div>

    <!-- Next Program -->
    <div v-if="nextProgram" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div class="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">
        UP NEXT
      </div>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h4 class="text-md font-semibold text-gray-900 dark:text-white">
            {{ nextProgram.title }}
          </h4>
          <p v-if="nextProgram.subtitle" class="text-sm text-gray-600 dark:text-gray-400">
            {{ nextProgram.subtitle }}
          </p>
          <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {{ formatTime(nextProgram.start) }} - {{ formatTime(nextProgram.stop) }}
          </div>
        </div>
        <div v-if="nextProgram.icon" class="ml-3">
          <img :src="nextProgram.icon" alt="Program icon" class="w-12 h-12 rounded object-cover" />
        </div>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div v-if="todaysPrograms.length > 0" class="mt-4">
      <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-2">
        Today's Schedule
      </h3>
      <div class="max-h-64 overflow-y-auto space-y-2">
        <div
          v-for="(program, index) in todaysPrograms"
          :key="index"
          class="p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          :class="{
            'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700': isCurrentProgram(program)
          }"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ program.title }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ formatTime(program.start) }} - {{ formatTime(program.stop) }}
              </div>
            </div>
            <span v-if="isCurrentProgram(program)" class="text-xs px-2 py-1 bg-blue-600 text-white rounded">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No EPG Data Message -->
    <div v-if="hasEpgData && !currentProgram && !nextProgram" class="text-center py-8 text-gray-600 dark:text-gray-400">
      <p>No program information available for this channel</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  parseEPG,
  getCurrentProgram,
  getNextProgram,
  getTodaysPrograms,
  formatProgramTime,
  formatDuration,
  getProgramProgress
} from '../utils/epgParser.js';

const props = defineProps({
  channelId: {
    type: String,
    default: null
  },
  tvgId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['epg-loaded']);

// State
const epgUrl = ref('');
const loading = ref(false);
const epgData = ref(null);
const currentProgram = ref(null);
const nextProgram = ref(null);
const todaysPrograms = ref([]);
const programProgress = ref(0);
const updateInterval = ref(null);

// Computed
const hasEpgData = computed(() => epgData.value !== null);

const activeChannelId = computed(() => {
  return props.tvgId || props.channelId;
});

// Methods
const loadEpgFromUrl = async () => {
  if (!epgUrl.value) {
    alert('Please enter an EPG URL');
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(epgUrl.value);
    
    // Check if the content is gzipped
    const isGzipped = epgUrl.value.endsWith('.gz') || 
                      response.headers.get('content-encoding') === 'gzip';
    
    let xmlContent;
    
    if (isGzipped) {
      console.log('Detected gzipped EPG, decompressing...');
      
      // Get the response as an ArrayBuffer
      const compressedData = await response.arrayBuffer();
      
      // Decompress using DecompressionStream API
      const decompressedStream = new Response(
        new Blob([compressedData])
          .stream()
          .pipeThrough(new DecompressionStream('gzip'))
      );
      
      xmlContent = await decompressedStream.text();
      console.log('EPG decompressed successfully');
    } else {
      xmlContent = await response.text();
    }
    
    epgData.value = parseEPG(xmlContent);
    
    // Store EPG URL in localStorage for future use
    localStorage.setItem('epgUrl', epgUrl.value);
    localStorage.setItem('epgData', JSON.stringify(epgData.value));
    
    updateProgramInfo();
    emit('epg-loaded', epgData.value);
    
    console.log('EPG loaded successfully:', epgData.value);
  } catch (error) {
    console.error('Failed to load EPG:', error);
    alert('Failed to load EPG data. Please check the URL and try again.');
  } finally {
    loading.value = false;
  }
};

const loadStoredEpg = () => {
  const storedUrl = localStorage.getItem('epgUrl');
  const storedData = localStorage.getItem('epgData');
  
  if (storedUrl && storedData) {
    epgUrl.value = storedUrl;
    try {
      epgData.value = JSON.parse(storedData);
      updateProgramInfo();
    } catch (error) {
      console.error('Failed to parse stored EPG data:', error);
      localStorage.removeItem('epgData');
    }
  }
};

const updateProgramInfo = () => {
  if (!epgData.value || !activeChannelId.value) {
    currentProgram.value = null;
    nextProgram.value = null;
    todaysPrograms.value = [];
    return;
  }

  const channelId = activeChannelId.value;
  
  currentProgram.value = getCurrentProgram(epgData.value.programs, channelId);
  nextProgram.value = getNextProgram(epgData.value.programs, channelId);
  todaysPrograms.value = getTodaysPrograms(epgData.value.programs, channelId);
  
  if (currentProgram.value) {
    programProgress.value = getProgramProgress(currentProgram.value);
  }
};

const refresh = () => {
  if (epgUrl.value) {
    loadEpgFromUrl();
  } else {
    loadStoredEpg();
  }
};

const formatTime = (date) => {
  return formatProgramTime(date);
};

const getDuration = (start, stop) => {
  return formatDuration(start, stop);
};

const isCurrentProgram = (program) => {
  const now = new Date();
  return now >= program.start && now < program.stop;
};

// Lifecycle
onMounted(() => {
  loadStoredEpg();
  
  // Update program info every 30 seconds
  updateInterval.value = setInterval(() => {
    updateProgramInfo();
  }, 30000);
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
});

// Watch for channel changes
watch(() => activeChannelId.value, () => {
  updateProgramInfo();
});

// Watch for EPG data changes
watch(() => props.channelId, () => {
  updateProgramInfo();
});
</script>

<style scoped>
.epg-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
}

:global(.dark) .overflow-y-auto::-webkit-scrollbar-track {
  background-color: #1f2937;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 0.25rem;
}

:global(.dark) .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

:global(.dark) .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}
</style>
