<script setup>
import { onMounted, ref } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import VideoListRow from '../components/VideoListRow.vue'
import * as historyApi from '../api/history'
import { formatRelativeTime } from '../composables/useFormat'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()
const items = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const nextCursor = ref(null)
const hasNext = ref(false)

async function loadFirstPage() {
  loading.value = true
  try {
    const page = await historyApi.listHistory({ limit: 20 })
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
    const page = await historyApi.listHistory({ cursor: nextCursor.value })
    items.value = items.value.concat(page.content)
    nextCursor.value = page.nextCursor
    hasNext.value = page.hasNext
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loadingMore.value = false
  }
}

onMounted(loadFirstPage)
</script>

<template>
  <div class="page">
    <h1>Watch history</h1>
    <LoadingSpinner v-if="loading" />
    <EmptyState
      v-else-if="!items.length"
      title="No watch history yet"
      message="Videos you watch will show up here."
    />
    <template v-else>
      <div class="list">
        <VideoListRow
          v-for="entry in items"
          :key="entry.id"
          :video="entry.video"
          :timestamp-label="`Watched ${formatRelativeTime(entry.watchedAt)}`"
        />
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
.load-more {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}
</style>
