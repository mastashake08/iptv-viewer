<script setup>
import HelloWorld from './components/HelloWorld.vue'
import PWABadge from './components/PWABadge.vue'
if ("launchQueue" in window) {
  launchQueue.setConsumer(async (launchParams) => {
    const file = launchParams.files[0]; 
    const url = URL.createObjectURL(await file.getFile());
    console.log(url);
    }
  });
}
</script>

<template>
  <div>
   <img src="/favicon.svg" class="logo" alt="iptv-viewer logo" />
   
  </div>
  <HelloWorld msg="iptv-viewer" />
  <PWABadge />
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
</style>
