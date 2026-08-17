<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VideoGrid from '../components/VideoGrid.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { listVideos } from '../api/videos'
import { useUiStore } from '../stores/ui'

// The API has no dedicated search endpoint (see API_DOCUMENTATION.md §4 —
// GET /videos only filters by categoryId). We fetch a generous page of
// videos and filter by title/category on the client, which is fine for a
// catalog this size but won't scale to a huge library — swap this for a
// real backend search endpoint if the catalog grows.
const route = useRoute()
const ui = useUiStore()

const allVideos = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const page = await listVideos({ limit: 100 })
    allVideos.value = page.content
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

const results = computed(() => {
  const q = (route.query.q || '').toString().trim().toLowerCase()
  if (!q) return []
  return allVideos.value.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      (v.categoryName || '').toLowerCase().includes(q)
  )
})

onMounted(load)
watch(() => route.query.q, () => {
  if (!allVideos.value.length) load()
})
</script>

<template>
  <div>
    <h1 class="results-heading">Results for “{{ route.query.q }}”</h1>
    <LoadingSpinner v-if="loading" />
    <EmptyState
      v-else-if="!results.length"
      title="No matching videos"
      message="Try a different title or category name."
    />
    <VideoGrid v-else :videos="results" />
  </div>
</template>

<style scoped>
.results-heading {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 16px;
}
</style>
