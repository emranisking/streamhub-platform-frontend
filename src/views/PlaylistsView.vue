<script setup>
import { onMounted, ref } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import * as playlistsApi from '../api/playlists'
import { mediaUrl } from '../composables/useMediaUrl'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()
const playlists = ref([])
const loading = ref(true)
const newTitle = ref('')
const creating = ref(false)

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

async function createPlaylist() {
  const title = newTitle.value.trim()
  if (!title) return
  creating.value = true
  try {
    await playlistsApi.createPlaylist(title)
    newTitle.value = ''
    await load()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    creating.value = false
  }
}

async function removePlaylist(playlist) {
  if (!confirm(`Delete "${playlist.title}"? This can't be undone.`)) return
  try {
    await playlistsApi.deletePlaylist(playlist.id)
    playlists.value = playlists.value.filter((p) => p.id !== playlist.id)
    ui.pushToast('Playlist deleted.', 'success')
  } catch (e) {
    ui.pushToast(e.message, 'error')
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <h1>Your playlists</h1>

    <form class="create-row" @submit.prevent="createPlaylist">
      <input v-model="newTitle" type="text" placeholder="New playlist name" maxlength="80" />
      <button class="btn btn-primary" type="submit" :disabled="creating || !newTitle.trim()">
        Create playlist
      </button>
    </form>

    <LoadingSpinner v-if="loading" />
    <EmptyState
      v-else-if="!playlists.length"
      title="No playlists yet"
      message="Create one above and start saving videos to it."
    />
    <div v-else class="grid">
      <div v-for="p in playlists" :key="p.id" class="card">
        <RouterLink :to="{ name: 'playlist-detail', params: { id: p.id } }" class="card-thumb">
          <img v-if="p.items?.[0]" :src="mediaUrl(p.items[0].video.thumbnailUrl)" :alt="p.title" />
          <div v-else class="card-thumb-empty">No videos yet</div>
          <span class="count-badge">{{ p.items?.length ?? 0 }} videos</span>
        </RouterLink>
        <div class="card-footer">
          <RouterLink :to="{ name: 'playlist-detail', params: { id: p.id } }" class="card-title">
            {{ p.title }}
          </RouterLink>
          <button class="icon-btn" aria-label="Delete playlist" @click="removePlaylist(p)">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5zM6 8h12l-1 13H7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page h1 {
  font-size: 20px;
  margin: 0 0 16px;
}
.create-row {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  max-width: 480px;
}
.create-row input {
  flex: 1;
  border: 1px solid var(--yt-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--yt-bg);
  color: var(--yt-text);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.card {
  border-radius: var(--yt-radius);
  overflow: hidden;
  border: 1px solid var(--yt-border);
}
.card-thumb {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  background: var(--yt-bg-secondary);
}
.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-thumb-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--yt-text-secondary);
  font-size: 13px;
}
.count-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
}
.card-title {
  font-size: 14px;
  font-weight: 500;
}
</style>
