<script setup>
import { mediaUrl } from '../composables/useMediaUrl'
import { formatViews } from '../composables/useFormat'

defineProps({
  video: { type: Object, required: true },
  timestampLabel: { type: String, default: '' }
})
</script>

<template>
  <RouterLink :to="{ name: 'watch', params: { id: video.id } }" class="row">
    <div class="thumb">
      <img :src="mediaUrl(video.thumbnailUrl)" :alt="video.title" loading="lazy" />
    </div>
    <div class="info">
      <h3 class="row-title">{{ video.title }}</h3>
      <p class="row-sub">{{ video.categoryName }} · {{ formatViews(video.views) }}</p>
      <p v-if="timestampLabel" class="row-timestamp">{{ timestampLabel }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.row {
  display: flex;
  gap: 16px;
  padding: 8px;
  border-radius: 8px;
}
.row:hover {
  background: var(--yt-hover);
}
.thumb {
  width: 200px;
  aspect-ratio: 16 / 9;
  border-radius: var(--yt-radius);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--yt-bg-secondary);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  min-width: 0;
}
.row-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 6px;
}
.row-sub {
  font-size: 13px;
  color: var(--yt-text-secondary);
  margin: 0;
}
.row-timestamp {
  font-size: 12px;
  color: var(--yt-text-secondary);
  margin: 6px 0 0;
}
@media (max-width: 560px) {
  .thumb {
    width: 120px;
  }
}
</style>
