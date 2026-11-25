// stores/auth.js
import { defineStore } from 'pinia'
import * as authApi from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null, // In-memory only
    user: null,
    ready: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isSubscribed: (state) => !!state.user?.subscribed,
    isAdmin: (state) => state.user?.roleType === 'ADMIN',
    isAnalytic: (state) => state.user?.roleType === 'ADMIN' || state.user?.roleType === 'ANALYTIC',
    displayName: (state) => state.user?.username ?? ''
  },

  actions: {
    setSession({ token, user }) {
      this.accessToken = token
      this.user = user
    },

    clearSession() {
      this.accessToken = null
      this.user = null
    },

    async login(payload) {
      const data = await authApi.login(payload)
      this.setSession({ token: data.token, user: data.user })
      return data
    },

    async logout() {
      try {
        await authApi.logout() // Calls backend to clear cookie
      } catch (e) {
        console.error("Logout error", e)
      } finally {
        this.clearSession()
      }
    },

    // This runs on page load (main.js) to get a new Access Token via the HttpOnly cookie
    async silentLogin() {
      try {
        const data = await authApi.refresh() // Calls /auth/refresh
        this.setSession({ token: data.token, user: data.user })
      } catch (e) {
        this.clearSession() // Cookie is invalid/expired
      } finally {
        this.ready = true
      }
    }
  }
})