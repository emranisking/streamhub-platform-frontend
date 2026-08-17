<script setup>
import VideoCard from './VideoCard.vue'

defineProps({
  videos: { type: Array, required: true }
})
</script>

<template>
  <div class="grid">
    <VideoCard v-for="v in videos" :key="v.id" :video="v" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px 16px;
}
</style>
