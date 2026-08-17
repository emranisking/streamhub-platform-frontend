import { defineStore } from 'pinia'
import * as authApi from '../api/auth'

const TOKEN_KEY = 'streamhub_token'
const USER_KEY = 'streamhub_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    ready: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isSubscribed: (state) => !!state.user?.subscribed,
    isAdmin: (state) => state.user?.roleType === 'ADMIN',
    isAnalytic: (state) =>
      state.user?.roleType === 'ADMIN' || state.user?.roleType === 'ANALYTIC',
    displayName: (state) => state.user?.username ?? ''
  },
  actions: {
    // Read a previously saved session back into memory on app boot.
    hydrate() {
      const token = localStorage.getItem(TOKEN_KEY)
      const rawUser = localStorage.getItem(USER_KEY)
      if (token && rawUser) {
        try {
          this.token = token
          this.user = JSON.parse(rawUser)
        } catch {
          this.clearSession()
        }
      }
      this.ready = true
    },
    setSession({ token, user }) {
      this.token = token
      this.user = user
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
    async register(payload) {
      const data = await authApi.register(payload)
      this.setSession(data)
      return data
    },
    async login(payload) {
      const data = await authApi.login(payload)
      this.setSession(data)
      return data
    },
    logout() {
      this.clearSession()
    },
    // Call after subscribing/cancelling so header badges & gates update
    // without forcing a full re-login.
    async refreshMe() {
      if (!this.token) return
      const user = await authApi.fetchMe()
      this.user = user
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  }
})
