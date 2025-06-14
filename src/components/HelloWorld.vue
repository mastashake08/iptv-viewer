<script setup>
defineProps({
  msg: String,
})
</script>

<template>
  <h1 class="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 text-center">{{ msg }}</h1>
  <div class="card bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
    <p class="text-lg text-gray-700 dark:text-gray-200">
      Watch your favorite IPTV channels in your browser.
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
