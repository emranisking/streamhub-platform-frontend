<script setup>
import { onMounted, ref } from 'vue'
import * as playlistsApi from '../api/playlists'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  videoId: { type: String, required: true }
})
defineEmits(['close'])
const ui = useUiStore()

const playlists = ref([])
const loading = ref(true)
const newTitle = ref('')
const creating = ref(false)
const busyId = ref(null)

function videoInPlaylist(playlist) {
  return playlist.items?.some((item) => item.video.id === props.videoId)
}

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

async function toggle(playlist) {
  busyId.value = playlist.id
  try {
    if (videoInPlaylist(playlist)) {
      await playlistsApi.removeFromPlaylist(playlist.id, props.videoId)
    } else {
      await playlistsApi.addToPlaylist(playlist.id, props.videoId)
    }
    await load()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busyId.value = null
  }
}

async function createAndAdd() {
  const title = newTitle.value.trim()
  if (!title) return
  creating.value = true
  try {
    const playlist = await playlistsApi.createPlaylist(title)
    await playlistsApi.addToPlaylist(playlist.id, props.videoId)
    newTitle.value = ''
    await load()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Save to playlist">
      <div class="modal-header">
        <h2>Save video to…</h2>
        <button class="icon-btn" aria-label="Close" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.88 18.3 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/></svg>
        </button>
      </div>

      <p v-if="loading" class="modal-loading">Loading your playlists…</p>
      <ul v-else class="playlist-list">
        <li v-for="p in playlists" :key="p.id">
          <label class="check-row">
            <input
              type="checkbox"
              :checked="videoInPlaylist(p)"
              :disabled="busyId === p.id"
              @change="toggle(p)"
            />
            {{ p.title }}
          </label>
        </li>
        <li v-if="!playlists.length" class="modal-empty">No playlists yet — create one below.</li>
      </ul>

      <form class="new-playlist" @submit.prevent="createAndAdd">
        <input v-model="newTitle" type="text" placeholder="New playlist name" maxlength="80" />
        <button class="btn btn-primary" type="submit" :disabled="creating || !newTitle.trim()">
          Create
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.modal {
  width: 360px;
  max-width: 90vw;
  background: var(--yt-bg);
  border-radius: 12px;
  padding: 16px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.modal-header h2 {
  font-size: 16px;
  margin: 0;
}
.modal-loading,
.modal-empty {
  color: var(--yt-text-secondary);
  font-size: 14px;
  padding: 8px 0;
}
.playlist-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  font-size: 14px;
  cursor: pointer;
}
.check-row input {
  width: 18px;
  height: 18px;
}
.new-playlist {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  border-top: 1px solid var(--yt-border);
  padding-top: 12px;
}
.new-playlist input {
  flex: 1;
  border: 1px solid var(--yt-border);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--yt-bg);
  color: var(--yt-text);
}
</style>
