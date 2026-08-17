<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoryChips from '../components/CategoryChips.vue'
import VideoGrid from '../components/VideoGrid.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { listCategories } from '../api/categories'
import { listVideos } from '../api/videos'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const categories = ref([])
const videos = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const nextCursor = ref(null)
const hasNext = ref(false)

async function loadCategories() {
  try {
    categories.value = await listCategories()
  } catch {
    categories.value = []
  }
}

async function loadFirstPage() {
  loading.value = true
  videos.value = []
  nextCursor.value = null
  try {
    const page = await listVideos({
      categoryId: route.query.categoryId || undefined,
      limit: 20
    })
    videos.value = page.content
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
    const page = await listVideos({
      categoryId: route.query.categoryId || undefined,
      cursor: nextCursor.value
    })
    videos.value = videos.value.concat(page.content)
    nextCursor.value = page.nextCursor
    hasNext.value = page.hasNext
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loadingMore.value = false
  }
}

function selectCategory(categoryId) {
  router.push({ path: '/', query: categoryId ? { categoryId } : {} })
}

onMounted(() => {
  loadCategories()
  loadFirstPage()
})

watch(() => route.query.categoryId, loadFirstPage)
</script>

<template>
  <div>
    <CategoryChips
      :categories="categories"
      :active-id="route.query.categoryId || null"
      @select="selectCategory"
    />

    <LoadingSpinner v-if="loading" />
    <EmptyState
      v-else-if="!videos.length"
      title="No videos yet"
      message="Nothing has been uploaded to this category yet."
    />
    <template v-else>
      <VideoGrid :videos="videos" />
      <div v-if="hasNext" class="load-more">
        <button class="btn" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.load-more {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}
</style>
