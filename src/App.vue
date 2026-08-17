<script setup>
import { onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TopNavbar from './components/TopNavbar.vue'
import SidebarNav from './components/SidebarNav.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useUiStore } from './stores/ui'
import { useGuestSession } from './composables/useGuestSession'
import { useAuthStore } from './stores/auth'
import * as analyticsApi from './api/analytics'

const ui = useUiStore()
const auth = useAuthStore()
const route = useRoute()

ui.initTheme()

onMounted(async () => {
  // One visit per app load, not per API call — see API_PURPOSE.md §6.
  try {
    const sessionId = auth.isAuthenticated ? undefined : useGuestSession()
    await analyticsApi.trackVisit(sessionId)
  } catch {
    // Analytics tracking is best-effort; never block the app on it.
  }
})
</script>

<template>
  <div class="shell">
    <TopNavbar />
    <div class="shell-body">
      <SidebarNav v-if="route.name !== 'watch'" />
      <main class="shell-main" :class="{ 'shell-main--watch': route.name === 'watch' }">
        <RouterView />
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.shell-body {
  display: flex;
  flex: 1;
  padding-top: var(--yt-header-height);
}
.shell-main {
  flex: 1;
  min-width: 0;
  padding: 24px;
}
.shell-main--watch {
  padding: 24px 24px 0;
}
@media (max-width: 640px) {
  .shell-main {
    padding: 12px;
  }
}
</style>
