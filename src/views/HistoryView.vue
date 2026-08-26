<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import VideoListRow from '../components/VideoListRow.vue'
import * as historyApi from '../api/history'
import { formatRelativeTime } from '../composables/useFormat'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()

const items = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const nextCursor = ref(null)
const hasNext = ref(false)
const error = ref(null)

// Check if user is authenticated
const isAuthenticated = computed(() => auth.isAuthenticated)

async function loadFirstPage() {
  // Check authentication first
  if (!auth.isAuthenticated) {
    ui.pushToast('Please sign in to view your watch history.', 'error')
    loading.value = false
    router.push({ name: 'login', query: { redirect: '/history' } })
    return
  }

  loading.value = true
  error.value = null
  
  try {
    console.log('📜 Loading history...')
    const page = await historyApi.listHistory({ limit: 20 })
    console.log('📜 History data:', page)
    
    items.value = page.content || []
    nextCursor.value = page.nextCursor || null
    hasNext.value = page.hasNext || false
  } catch (e) {
    console.error('❌ Error loading history:', e)
    error.value = e.message || 'Failed to load watch history'
    ui.pushToast(error.value, 'error')
    
    // If 401 or 403, redirect to login
    if (e.status === 401 || e.status === 403) {
      auth.clearSession()
      router.push({ name: 'login', query: { redirect: '/history' } })
    }
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasNext.value || loadingMore.value) return
  
  loadingMore.value = true
  try {
    console.log('📜 Loading more history...')
    const page = await historyApi.listHistory({ cursor: nextCursor.value })
    items.value = items.value.concat(page.content || [])
    nextCursor.value = page.nextCursor || null
    hasNext.value = page.hasNext || false
  } catch (e) {
    console.error('❌ Error loading more history:', e)
    ui.pushToast(e.message || 'Failed to load more history', 'error')
  } finally {
    loadingMore.value = false
  }
}

// Retry loading if auth state changes
function retryLoad() {
  if (auth.isAuthenticated) {
    loadFirstPage()
  }
}

onMounted(() => {
  // Wait a moment for auth store to hydrate
  setTimeout(() => {
    loadFirstPage()
  }, 100)
})
</script>

<template>
  <div class="page">
    <h1>Watch history</h1>
    
    <!-- Not Authenticated -->
    <div v-if="!isAuthenticated && !loading" class="auth-required">
      <EmptyState
        title="Sign in required"
        message="Please sign in to view your watch history."
      >
        <RouterLink to="/login" class="btn btn-primary">
          Sign in
        </RouterLink>
      </EmptyState>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-else-if="loading" />
    
    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <EmptyState
        title="Something went wrong"
        :message="error"
      >
        <button class="btn btn-primary" @click="retryLoad">
          Try again
        </button>
      </EmptyState>
    </div>

    <!-- Empty History -->
    <EmptyState
      v-else-if="!items.length"
      title="No watch history yet"
      message="Videos you watch will show up here."
    />

    <!-- History List -->
    <template v-else>
      <div class="list">
        <VideoListRow
          v-for="entry in items"
          :key="entry.id"
          :video="entry.video"
          :timestamp-label="`Watched ${formatRelativeTime(entry.watchedAt)}`"
        />
      </div>
      
      <!-- Load More -->
      <div v-if="hasNext" class="load-more">
        <button class="btn" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px;
}

.page h1 {
  font-size: 20px;
  margin: 0 0 16px;
  color: var(--yt-text);
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

.auth-required,
.error-state {
  padding: 40px 0;
}

.error-state .btn {
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .page {
    padding: 0 12px;
  }
  
  .page h1 {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 0 8px;
  }
  
  .page h1 {
    font-size: 16px;
  }
}
</style>