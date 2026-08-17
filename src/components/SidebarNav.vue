<script setup>
import { onMounted, ref } from 'vue'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { listCategories } from '../api/categories'

const ui = useUiStore()
const auth = useAuthStore()
const categories = ref([])

onMounted(async () => {
  try {
    categories.value = await listCategories()
  } catch {
    categories.value = []
  }
})
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--mini': ui.sidebarCollapsed }">
    <nav>
      <RouterLink to="/" class="nav-item" active-class="nav-item--active" exact-active-class="nav-item--active">
        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z"/></svg>
        <span class="nav-label">Home</span>
      </RouterLink>

      <template v-if="auth.isAuthenticated">
        <div class="divider"></div>
        <p class="section-label">Library</p>
        <RouterLink to="/history" class="nav-item" active-class="nav-item--active">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13 3a9 9 0 1 0 8.94 10H19.9A7 7 0 1 1 13 5v4l5-4-5-4z"/></svg>
          <span class="nav-label">History</span>
        </RouterLink>
        <RouterLink to="/liked" class="nav-item" active-class="nav-item--active">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.2-4.5-9.6-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.6 6c-2.4 4.5-9.6 9-9.6 9"/></svg>
          <span class="nav-label">Liked videos</span>
        </RouterLink>
        <RouterLink to="/playlists" class="nav-item" active-class="nav-item--active">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h12v2H3zm0 5h12v2H3zm0 5h8v2H3zM17 9v10l7-5z"/></svg>
          <span class="nav-label">Playlists</span>
        </RouterLink>
      </template>

      <div class="divider"></div>
      <p class="section-label">Membership</p>
      <RouterLink to="/subscribe" class="nav-item" active-class="nav-item--active">
        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l2.6 6.6L21 9l-5 4.3L17.5 21 12 17.3 6.5 21 8 13.3 3 9l6.4-.4z"/></svg>
        <span class="nav-label">{{ auth.isSubscribed ? 'Manage subscription' : 'Subscribe' }}</span>
      </RouterLink>

      <template v-if="auth.isAdmin || auth.isAnalytic">
        <div class="divider"></div>
        <p class="section-label">Admin</p>
        <RouterLink v-if="auth.isAdmin" to="/admin/categories" class="nav-item" active-class="nav-item--active">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"/></svg>
          <span class="nav-label">Categories</span>
        </RouterLink>
        <RouterLink v-if="auth.isAnalytic" to="/admin/analytics" class="nav-item" active-class="nav-item--active">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z"/></svg>
          <span class="nav-label">Analytics</span>
        </RouterLink>
      </template>

      <template v-if="categories.length">
        <div class="divider"></div>
        <p class="section-label">Browse</p>
        <RouterLink
          v-for="c in categories"
          :key="c.id"
          :to="{ path: '/', query: { categoryId: c.id } }"
          class="nav-item"
        >
          <span class="dot"></span>
          <span class="nav-label">{{ c.name }}</span>
        </RouterLink>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--yt-sidebar-width);
  flex-shrink: 0;
  padding: 12px 8px;
  overflow-y: auto;
  height: calc(100vh - var(--yt-header-height));
  position: sticky;
  top: var(--yt-header-height);
}
.sidebar--mini {
  width: var(--yt-sidebar-width-mini);
}
.sidebar--mini .nav-label,
.sidebar--mini .section-label {
  display: none;
}
.sidebar--mini .nav-item {
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
  padding: 12px 4px;
}
nav {
  display: flex;
  flex-direction: column;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--yt-text);
}
.nav-item:hover {
  background: var(--yt-hover);
}
.nav-item--active {
  background: var(--yt-chip-bg);
  font-weight: 600;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--yt-red);
  margin-left: 8px;
  flex-shrink: 0;
}
.divider {
  height: 1px;
  background: var(--yt-border);
  margin: 12px 0;
}
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--yt-text-secondary);
  padding: 0 12px;
  margin: 4px 0;
}
@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
}
</style>
