<script setup>
import { mediaUrl } from '../composables/useMediaUrl'
import { formatViews, formatRelativeTime } from '../composables/useFormat'

defineProps({
  video: { type: Object, required: true }
})

// Helper to handle image load errors
function handleImageError(event) {
  // You can set a placeholder image here
  // event.target.src = '/placeholder-thumbnail.jpg'
  event.target.style.display = 'none'
  // Or show a fallback div
  const parent = event.target.parentElement
  const fallback = document.createElement('div')
  fallback.className = 'thumb-fallback'
  fallback.textContent = '📹'
  parent.appendChild(fallback)
}
</script>

<template>
  <RouterLink :to="{ name: 'watch', params: { id: video.id } }" class="video-card">
    <div class="thumb-wrap">
      <img 
        :src="mediaUrl(video.id, video.thumbnailUrl)" 
        :alt="video.title" 
        loading="lazy"
        @error="handleImageError"
      />
    </div>
    <div class="video-meta">
      <div class="avatar-dot">{{ (video.categoryName || '?').charAt(0) }}</div>
      <div class="video-text">
        <h3 class="video-title">{{ video.title }}</h3>
        <p class="video-sub">{{ video.categoryName }}</p>
        <p class="video-sub">
          {{ formatViews(video.views) }} · {{ formatRelativeTime(video.createdAt) }}
        </p>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.video-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.thumb-wrap {
  aspect-ratio: 16 / 9;
  border-radius: var(--yt-radius);
  overflow: hidden;
  background: var(--yt-bg-secondary);
  position: relative;
}
.thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}
.video-card:hover .thumb-wrap img {
  transform: scale(1.02);
}
.thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: var(--yt-bg-secondary);
  color: var(--yt-text-secondary);
}
.video-meta {
  display: flex;
  gap: 12px;
}
.avatar-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--yt-chip-bg);
  color: var(--yt-text-secondary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
}
.video-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.video-sub {
  font-size: 13px;
  color: var(--yt-text-secondary);
  margin: 0;
}
</style>