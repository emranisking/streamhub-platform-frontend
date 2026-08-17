import { defineStore } from 'pinia'

const THEME_KEY = 'streamhub_theme'
const SIDEBAR_KEY = 'streamhub_sidebar_collapsed'

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: localStorage.getItem(THEME_KEY) || 'light',
    sidebarCollapsed: localStorage.getItem(SIDEBAR_KEY) === 'true',
    toasts: []
  }),
  actions: {
    initTheme() {
      applyTheme(this.theme)
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, this.theme)
      applyTheme(this.theme)
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem(SIDEBAR_KEY, String(this.sidebarCollapsed))
    },
    pushToast(message, variant = 'info') {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, message, variant })
      setTimeout(() => this.dismissToast(id), 3500)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }
  }
})
