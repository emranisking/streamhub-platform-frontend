import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/results',
    name: 'search',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/watch/:id',
    name: 'watch',
    component: () => import('../views/WatchView.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/playlists',
    name: 'playlists',
    component: () => import('../views/PlaylistsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/playlists/:id',
    name: 'playlist-detail',
    component: () => import('../views/PlaylistDetailView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/liked',
    name: 'liked',
    component: () => import('../views/LikedVideosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscribe',
    name: 'subscribe',
    component: () => import('../views/SubscribeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('../views/admin/CategoriesAdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/analytics',
    name: 'admin-analytics',
    component: () => import('../views/admin/AnalyticsDashboardView.vue'),
    meta: { requiresAuth: true, requiresAnalytic: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const ui = useUiStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    ui.pushToast("You don't have access to that page.", 'error')
    return { name: 'home' }
  }
  if (to.meta.requiresAnalytic && !auth.isAnalytic) {
    ui.pushToast("You don't have access to that page.", 'error')
    return { name: 'home' }
  }
  return true
})

export default router
