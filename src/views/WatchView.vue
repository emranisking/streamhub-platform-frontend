<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VideoPlayer from '../components/VideoPlayer.vue'
import LockedOverlay from '../components/LockedOverlay.vue'
import PlaylistPickerModal from '../components/PlaylistPickerModal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import VideoCard from '../components/VideoCard.vue'
import { fetchVideo, bumpViews, listVideos } from '../api/videos'
import { getPlayback } from '../api/playback'
import { listLikes, toggleLike } from '../api/likes'
import { mediaUrl } from '../composables/useMediaUrl'
import { formatViews, formatRelativeTime } from '../composables/useFormat'
import { useGuestSession } from '../composables/useGuestSession'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  id: { type: String, required: true }
})

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()

const video = ref(null)
const playback = ref(null)
const related = ref([])
const loading = ref(true)
const liked = ref(false)
const likeBusy = ref(false)
const showPlaylistModal = ref(false)

const manifestSrc = computed(() =>
  playback.value && !playback.value.locked ? mediaUrl(playback.value.manifestUrl) : null
)

async function load() {
  loading.value = true
  liked.value = false
  playback.value = null
  try {
    const sessionId = auth.isAuthenticated ? undefined : useGuestSession()

    const [videoData, playbackData] = await Promise.all([
      fetchVideo(props.id),
      getPlayback(props.id, sessionId)
    ])
    video.value = videoData
    playback.value = playbackData

    // Fire-and-forget: bumps the view counter and (if logged in) writes a
    // history row. Not blocking the render on this.
    bumpViews(props.id).then((updated) => {
      if (video.value) video.value.views = updated.views
    }).catch(() => {})

    if (auth.isAuthenticated) {
      listLikes({ limit: 100 })
        .then((page) => {
          liked.value = page.content.some((item) => item.video.id === props.id)
        })
        .catch(() => {})
    }

    listVideos({ categoryId: videoData.categoryId, limit: 12 })
      .then((page) => {
        related.value = page.content.filter((v) => v.id !== props.id)
      })
      .catch(() => {})
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function onToggleLike() {
  if (!auth.isAuthenticated) {
    ui.pushToast('Sign in to like videos.', 'error')
    return
  }
  likeBusy.value = true
  try {
    const result = await toggleLike(props.id)
    liked.value = result.liked
    if (video.value) video.value.likes = result.likes
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    likeBusy.value = false
  }
}

function onSaveClick() {
  if (!auth.isAuthenticated) {
    ui.pushToast('Sign in to save videos to a playlist.', 'error')
    return
  }
  showPlaylistModal.value = true
}

onMounted(load)
watch(() => props.id, load)
watch(() => route.params.id, () => {
  if (route.params.id !== props.id) load()
})
</script>

<template>
  <div class="watch-layout">
    <div class="watch-main">
      <LoadingSpinner v-if="loading" />
      <template v-else-if="video">
        <div class="player-wrap">
          <VideoPlayer v-if="manifestSrc" :src="manifestSrc" />
          <div v-else class="player-placeholder"></div>
          <LockedOverlay
            v-if="playback?.locked"
            :reason="playback.reason"
            :is-authenticated="auth.isAuthenticated"
          />
        </div>

        <h1 class="title">{{ video.title }}</h1>

        <div class="meta-row">
          <p class="meta-sub">
            {{ formatViews(video.views) }} · {{ formatRelativeTime(video.createdAt) }}
            <span class="category-pill">{{ video.categoryName }}</span>
          </p>
          <div class="actions">
            <button class="btn like-btn" :class="{ 'like-btn--active': liked }" :disabled="likeBusy" @click="onToggleLike">
              <svg width="18" height="18" viewBox="0 0 24 24"><path :fill="liked ? 'var(--yt-red)' : 'currentColor'" d="M12 21s-7.2-4.5-9.6-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.6 6c-2.4 4.5-9.6 9-9.6 9"/></svg>
              {{ video.likes }}
            </button>
            <button class="btn" @click="onSaveClick">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h12v2H3zm0 5h12v2H3zm0 5h8v2H3zM17 9v10l7-5z"/></svg>
              Save
            </button>
          </div>
        </div>

        <div class="description">
          <p>{{ video.description }}</p>
        </div>
      </template>
    </div>

    <aside class="watch-related">
      <h2 class="related-heading">Up next</h2>
      <VideoCard v-for="v in related" :key="v.id" :video="v" />
      <p v-if="!loading && !related.length" class="no-related">No related videos in this category yet.</p>
    </aside>

    <PlaylistPickerModal
      v-if="showPlaylistModal"
      :video-id="props.id"
      @close="showPlaylistModal = false"
    />
  </div>
</template>

<style scoped>
.watch-layout {
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}
.watch-main {
  flex: 1;
  min-width: 0;
}
.player-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--yt-radius);
  overflow: hidden;
}
.player-placeholder {
  width: 100%;
  height: 100%;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 8px;
}
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--yt-border);
}
.meta-sub {
  color: var(--yt-text-secondary);
  font-size: 14px;
  margin: 0;
}
.category-pill {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 10px;
  border-radius: 10px;
  background: var(--yt-chip-bg);
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
.like-btn--active {
  color: var(--yt-red);
}
.description {
  background: var(--yt-bg-secondary);
  border-radius: var(--yt-radius);
  padding: 16px;
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.watch-related {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.related-heading {
  font-size: 16px;
  margin: 0 0 4px;
}
.no-related {
  color: var(--yt-text-secondary);
  font-size: 14px;
}
@media (max-width: 1100px) {
  .watch-layout {
    flex-direction: column;
  }
  .watch-related {
    width: 100%;
  }
}
</style>
