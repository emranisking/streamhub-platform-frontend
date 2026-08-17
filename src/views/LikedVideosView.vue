<script setup>
import { onMounted, ref } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import VideoListRow from '../components/VideoListRow.vue'
import * as likesApi from '../api/likes'
import { formatRelativeTime } from '../composables/useFormat'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()
const items = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const nextCursor = ref(null)
const hasNext = ref(false)
const busyId = ref(null)

async function loadFirstPage() {
  loading.value = true
  try {
    const page = await likesApi.listLikes({ limit: 20 })
    items.value = page.content
    nextCursor.value = page.nextCursor
    hasNext.value = page.hasNext
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasNext.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const page = await likesApi.listLikes({ cursor: nextCursor.value })
    items.value = items.value.concat(page.content)
    nextCursor.value = page.nextCursor
    hasNext.value = page.hasNext
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loadingMore.value = false
  }
}

async function unlike(videoId) {
  busyId.value = videoId
  try {
    await likesApi.toggleLike(videoId)
    items.value = items.value.filter((item) => item.video.id !== videoId)
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busyId.value = null
  }
}

onMounted(loadFirstPage)
</script>

<template>
  <div class="page">
    <h1>Liked videos</h1>
    <LoadingSpinner v-if="loading" />
    <EmptyState
      v-else-if="!items.length"
      title="No liked videos yet"
      message="Tap the heart on a video to save it here."
    />
    <template v-else>
      <div class="list">
        <div v-for="entry in items" :key="entry.video.id" class="row-wrap">
          <VideoListRow :video="entry.video" :timestamp-label="`Liked ${formatRelativeTime(entry.likedAt)}`" />
          <button class="btn unlike-btn" :disabled="busyId === entry.video.id" @click="unlike(entry.video.id)">
            Unlike
          </button>
        </div>
      </div>
      <div v-if="hasNext" class="load-more">
        <button class="btn" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page h1 {
  font-size: 20px;
  margin: 0 0 16px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 800px;
}
.row-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.row-wrap > :first-child {
  flex: 1;
  min-width: 0;
}
.unlike-btn {
  flex-shrink: 0;
}
.load-more {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}
</style>
