<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import * as playlistsApi from '../api/playlists'
import { mediaUrl } from '../composables/useMediaUrl'
import { formatViews } from '../composables/useFormat'
import { useUiStore } from '../stores/ui'

// GET /playlists returns every playlist with its items (there's no
// single-playlist-by-id endpoint — see API_DOCUMENTATION.md §6), so we
// fetch the full list and pick the one we need.
const props = defineProps({
  id: { type: String, required: true }
})

const ui = useUiStore()
const router = useRouter()

const playlists = ref([])
const loading = ref(true)
const busyVideoId = ref(null)

const playlist = computed(() => playlists.value.find((p) => p.id === props.id))
const sortedItems = computed(() =>
  [...(playlist.value?.items ?? [])].sort((a, b) => a.position - b.position)
)

async function load() {
  loading.value = true
  try {
    playlists.value = await playlistsApi.listPlaylists()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function removeItem(videoId) {
  busyVideoId.value = videoId
  try {
    await playlistsApi.removeFromPlaylist(props.id, videoId)
    await load()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busyVideoId.value = null
  }
}

async function move(item, direction) {
  const newPosition = item.position + direction
  if (newPosition < 0 || newPosition >= sortedItems.value.length) return
  busyVideoId.value = item.video.id
  try {
    await playlistsApi.movePlaylistItem(props.id, item.video.id, newPosition)
    await load()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busyVideoId.value = null
  }
}

async function removePlaylist() {
  if (!playlist.value) return
  if (!confirm(`Delete "${playlist.value.title}"? This can't be undone.`)) return
  try {
    await playlistsApi.deletePlaylist(props.id)
    ui.pushToast('Playlist deleted.', 'success')
    router.push({ name: 'playlists' })
  } catch (e) {
    ui.pushToast(e.message, 'error')
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <LoadingSpinner v-if="loading" />
    <template v-else-if="playlist">
      <div class="header-row">
        <div>
          <h1>{{ playlist.title }}</h1>
          <p class="sub">{{ sortedItems.length }} video{{ sortedItems.length === 1 ? '' : 's' }}</p>
        </div>
        <button class="btn btn-danger-outline delete-btn" @click="removePlaylist">Delete playlist</button>
      </div>

      <EmptyState
        v-if="!sortedItems.length"
        title="This playlist is empty"
        message="Add videos to it from any watch page using the Save button."
      />
      <ol v-else class="item-list">
        <li v-for="(item, idx) in sortedItems" :key="item.id" class="item-row">
          <span class="position">{{ idx + 1 }}</span>
          <RouterLink :to="{ name: 'watch', params: { id: item.video.id } }" class="item-thumb">
            <img :src="mediaUrl(item.video.id, item.video.thumbnailUrl)" :alt="item.video.title" />
          </RouterLink>
          <div class="item-info">
            <RouterLink :to="{ name: 'watch', params: { id: item.video.id } }" class="item-title">
              {{ item.video.title }}
            </RouterLink>
            <p class="item-sub">{{ item.video.categoryName }} · {{ formatViews(item.video.views) }}</p>
          </div>
          <div class="item-actions">
            <button
              class="icon-btn move-btn"
              aria-label="Move up"
              :disabled="idx === 0 || busyVideoId === item.video.id"
              @click="move(item, -1)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 7l-6 6h4v5h4v-5h4z"/>
              </svg>
            </button>
            <button
              class="icon-btn move-btn"
              aria-label="Move down"
              :disabled="idx === sortedItems.length - 1 || busyVideoId === item.video.id"
              @click="move(item, 1)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 17l6-6h-4V6h-4v5H6z"/>
              </svg>
            </button>
            <button
              class="icon-btn remove-btn"
              aria-label="Remove from playlist"
              :disabled="busyVideoId === item.video.id"
              @click="removeItem(item.video.id)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.88 18.3 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/>
              </svg>
            </button>
          </div>
        </li>
      </ol>
    </template>
    <EmptyState v-else title="Playlist not found" message="It may have been deleted." />
  </div>
</template>

<style scoped>
/* ============================================================
   Base Styles
   ============================================================ */
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
}

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.header-row h1 {
  font-size: 20px;
  margin: 0 0 4px;
  word-break: break-word;
}

.sub {
  color: var(--yt-text-secondary);
  font-size: 14px;
  margin: 0;
}

.delete-btn {
  flex-shrink: 0;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.item-row:hover {
  background: var(--yt-hover);
}

.position {
  width: 20px;
  text-align: center;
  color: var(--yt-text-secondary);
  font-size: 13px;
  flex-shrink: 0;
}

.item-thumb {
  width: 140px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--yt-bg-secondary);
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0; /* Allows text truncation to work */
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  display: block;
  /* Title truncation for long titles */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.item-sub {
  font-size: 13px;
  color: var(--yt-text-secondary);
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--yt-text);
  cursor: pointer;
  transition: background 0.15s ease;
}

.icon-btn:hover:not(:disabled) {
  background: var(--yt-hover);
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ============================================================
   Tablet Styles
   ============================================================ */
@media (max-width: 768px) {
  .page {
    padding: 0 12px;
  }

  .item-row {
    gap: 8px;
    padding: 6px;
  }

  .item-thumb {
    width: 100px;
  }

  .item-title {
    font-size: 13px;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  .item-sub {
    font-size: 12px;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .position {
    width: 16px;
    font-size: 12px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
  }

  .icon-btn svg {
    width: 16px;
    height: 16px;
  }

  .header-row h1 {
    font-size: 18px;
  }
}

/* ============================================================
   Mobile Styles
   ============================================================ */
@media (max-width: 480px) {
  .page {
    padding: 0 8px;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-row h1 {
    font-size: 16px;
  }

  .delete-btn {
    width: 100%;
    justify-content: center;
  }

  .item-row {
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 4px;
  }

  .item-thumb {
    width: 80px;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    min-width: 0;
    max-width: calc(100% - 80px - 30px); /* Account for thumbnail + actions */
  }

  .item-title {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }

  .item-sub {
    font-size: 11px;
    -webkit-line-clamp: 1;
  }

  .position {
    width: 14px;
    font-size: 11px;
  }

  .item-actions {
    gap: 0;
    width: 100%;
    justify-content: flex-end;
    padding-top: 4px;
    border-top: 1px solid var(--yt-border);
  }

  .icon-btn {
    width: 28px;
    height: 28px;
  }

  .icon-btn svg {
    width: 14px;
    height: 14px;
  }

  .move-btn,
  .remove-btn {
    opacity: 0.7;
  }
}

/* ============================================================
   Very Small Phones (<= 360px)
   ============================================================ */
@media (max-width: 360px) {
  .item-thumb {
    width: 60px;
  }

  .item-info {
    max-width: calc(100% - 60px - 20px);
  }

  .item-title {
    font-size: 11px;
  }

  .item-sub {
    font-size: 10px;
  }

  .position {
    display: none;
  }
}

/* ============================================================
   Landscape Phones
   ============================================================ */
@media (max-width: 768px) and (orientation: landscape) {
  .item-thumb {
    width: 120px;
  }

  .item-title {
    font-size: 14px;
    -webkit-line-clamp: 1;
  }

  .item-actions {
    flex-wrap: nowrap;
  }
}

/* ============================================================
   Dark Mode
   ============================================================ */
html.dark .item-row:hover {
  background: var(--yt-hover);
}

html.dark .move-btn,
html.dark .remove-btn {
  color: var(--yt-text-secondary);
}

html.dark .move-btn:hover:not(:disabled),
html.dark .remove-btn:hover:not(:disabled) {
  color: var(--yt-text);
}
</style>