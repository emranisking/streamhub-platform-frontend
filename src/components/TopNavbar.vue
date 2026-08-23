<!-- TopNavbar.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const query = ref('')
const menuOpen = ref(false)
const avatarWrapRef = ref(null)

function submitSearch() {
  const q = query.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}

function logout() {
  console.log('========== LOGOUT CLICKED ==========')
  console.log('1. auth.token BEFORE:', auth.token)
  console.log('2. auth.user BEFORE:', auth.user)
  console.log('3. localStorage token BEFORE:', localStorage.getItem('streamhub_token'))
  console.log('4. localStorage user BEFORE:', localStorage.getItem('streamhub_user'))
  
  auth.logout()
  
  console.log('5. auth.token AFTER:', auth.token)
  console.log('6. auth.user AFTER:', auth.user)
  console.log('7. localStorage token AFTER:', localStorage.getItem('streamhub_token'))
  console.log('8. localStorage user AFTER:', localStorage.getItem('streamhub_user'))
  console.log('========== LOGOUT FINISHED ==========')
  
  // Close menu after logout
  menuOpen.value = false
  
  // Navigate to home
  router.push({ name: 'home' })
  
  // Show toast
  ui.pushToast('You have been signed out.', 'success')
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

// Close menu when clicking outside
function handleClickOutside(event) {
  if (avatarWrapRef.value && !avatarWrapRef.value.contains(event.target)) {
    menuOpen.value = false
  }
}

// Close menu on escape key
function handleEscapeKey(event) {
  if (event.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
  }
}

// Close menu on route change
watch(() => route.fullPath, () => {
  menuOpen.value = false
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<template>
  <header class="navbar">
    <!-- Left section -->
    <div class="navbar-left">
      <button class="icon-btn" aria-label="Toggle menu" @click="ui.toggleSidebar">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>
        </svg>
      </button>
      <RouterLink to="/" class="brand">
        <svg width="28" height="20" viewBox="0 0 28 20">
          <rect width="28" height="20" rx="6" fill="var(--yt-red)" />
          <path d="M11 6l7 4-7 4z" fill="#fff" />
        </svg>
        <span class="brand-name">StreamHub</span>
      </RouterLink>
    </div>

    <!-- Search -->
    <form class="navbar-search" @submit.prevent="submitSearch">
      <input
        v-model="query"
        type="search"
        placeholder="Search"
        aria-label="Search videos"
      />
      <button type="submit" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5A4.5 4.5 0 0 1 9.5 14"/>
        </svg>
      </button>
    </form>

    <!-- Right section -->
    <div class="navbar-right">
      <!-- Theme toggle -->
      <button 
        class="icon-btn" 
        :aria-label="ui.theme === 'dark' ? 'Switch to light' : 'Switch to dark'" 
        @click="ui.toggleTheme"
      >
        <svg v-if="ui.theme === 'dark'" width="22" height="22" viewBox="0 0 24 24">
          <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.45.6l1.4-1.4" stroke="currentColor" stroke-width="1.6" fill="none"/>
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12.3 2a9.8 9.8 0 1 0 9.7 11.6 8 8 0 0 1-9.7-9.7c0-.6.1-1.3 0-1.9"/>
        </svg>
      </button>

      <!-- User menu - FIXED with click-outside -->
      <template v-if="auth.isAuthenticated">
        <div class="avatar-wrap" ref="avatarWrapRef">
          <button class="avatar-btn" @click="toggleMenu">
            <span class="avatar">{{ auth.displayName.charAt(0).toUpperCase() }}</span>
          </button>
          
          <div v-if="menuOpen" class="menu" role="menu">
            <div class="menu-header">
              <span class="avatar avatar-lg">{{ auth.displayName.charAt(0).toUpperCase() }}</span>
              <div>
                <div class="menu-name">{{ auth.displayName }}</div>
                <div class="menu-email">{{ auth.user?.email }}</div>
                <span class="badge" :class="{ 'badge-active': auth.isSubscribed }">
                  {{ auth.isSubscribed ? auth.user?.subscriptionTier ?? 'Subscribed' : 'Free account' }}
                </span>
              </div>
            </div>
            
            <RouterLink class="menu-item" to="/subscribe" @click="closeMenu">
              {{ auth.isSubscribed ? 'Manage subscription' : 'Subscribe' }}
            </RouterLink>
            <RouterLink class="menu-item" to="/playlists" @click="closeMenu">
              Your playlists
            </RouterLink>
            <RouterLink class="menu-item" to="/history" @click="closeMenu">
              Watch history
            </RouterLink>
            
            <RouterLink 
              v-if="auth.isAdmin" 
              class="menu-item" 
              to="/admin/categories" 
              @click="closeMenu"
            >
              Manage categories
            </RouterLink>
            
            <RouterLink 
              v-if="auth.isAnalytic" 
              class="menu-item" 
              to="/admin/analytics" 
              @click="closeMenu"
            >
              Analytics dashboard
            </RouterLink>
            
            <button 
              type="button"
              class="menu-item menu-item--danger" 
              @click="logout"
            >
              Sign out
            </button>
          </div>
        </div>
      </template>
      
      <!-- Guest/Unauthenticated -->
      <template v-else>
        <RouterLink to="/login" class="btn sign-in-btn">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5m0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5" stroke="currentColor"/>
          </svg>
          Sign in
        </RouterLink>
      </template>
    </div>
  </header>
</template>

<style scoped>
/* Your existing styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--yt-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--yt-bg);
  border-bottom: 1px solid var(--yt-border);
  z-index: 100;
  gap: 16px;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.navbar-search {
  flex: 1;
  max-width: 640px;
  display: flex;
  align-items: center;
}
.navbar-search input {
  flex: 1;
  height: 40px;
  border: 1px solid var(--yt-border);
  border-radius: 20px 0 0 20px;
  padding: 0 16px;
  font-size: 16px;
  background: var(--yt-bg);
  color: var(--yt-text);
  min-width: 0;
}
.navbar-search input:focus {
  outline: none;
  border-color: #1c62b9;
}
.navbar-search button {
  height: 40px;
  width: 64px;
  border: 1px solid var(--yt-border);
  border-left: none;
  border-radius: 0 20px 20px 0;
  background: var(--yt-bg-secondary);
  color: var(--yt-text);
  display: flex;
  align-items: center;
  justify-content: center;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.sign-in-btn {
  border: 1px solid var(--yt-border);
  color: #065fd4;
  font-weight: 500;
}
html.dark .sign-in-btn {
  color: #3ea6ff;
}
.avatar-wrap {
  position: relative;
}
.avatar-btn {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--yt-red);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.avatar-lg {
  width: 40px;
  height: 40px;
  font-size: 18px;
}
.menu {
  position: absolute;
  right: 0;
  top: 44px;
  width: 280px;
  background: var(--yt-bg);
  border: 1px solid var(--yt-border);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 8px 0;
  z-index: 200;
}
.menu-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}
.menu-name {
  font-weight: 600;
}
.menu-email {
  font-size: 13px;
  color: var(--yt-text-secondary);
}
.badge {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--yt-chip-bg);
  color: var(--yt-text-secondary);
}
.badge-active {
  background: #0f9d58;
  color: #fff;
}
.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 10px 16px;
  font-size: 14px;
  color: var(--yt-text);
  cursor: pointer;
  text-decoration: none;
}
.menu-item:hover {
  background: var(--yt-hover);
}
.menu-item--danger {
  color: var(--yt-red);
}
@media (max-width: 640px) {
  .brand-name {
    display: none;
  }
}
</style>