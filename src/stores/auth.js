// stores/auth.js
import { defineStore } from 'pinia'
import * as authApi from '../api/auth'

const TOKEN_KEY = 'streamhub_token'
const USER_KEY = 'streamhub_user'

// Decode the JWT payload without verifying the signature.
// The backend remains the source of truth for auth; this is purely
// to avoid showing a "logged in" UI for an already-expired token.
function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false // no exp claim -> let the server decide
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true // malformed token -> treat as expired
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    ready: false
  }),

  getters: {
    // Now also requires a non-expired token.
    isAuthenticated: (state) => !!state.token && !isTokenExpired(state.token),
    isSubscribed: (state) => !!state.user?.subscribed,
    isAdmin: (state) => state.user?.roleType === 'ADMIN',
    isAnalytic: (state) =>
      state.user?.roleType === 'ADMIN' || state.user?.roleType === 'ANALYTIC',
    displayName: (state) => state.user?.username ?? ''
  },

  actions: {
    hydrate() {
      const token = localStorage.getItem(TOKEN_KEY)
      const rawUser = localStorage.getItem(USER_KEY)

      if (token && rawUser && !isTokenExpired(token)) {
        try {
          this.token = token
          this.user = JSON.parse(rawUser)
        } catch {
          this.clearSession()
        }
      } else if (token || rawUser) {
        // Expired or half-present session -> wipe it so the UI
        // immediately falls back to guest behavior.
        this.clearSession()
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

    async refreshMe() {
      if (!this.token) return
      const user = await authApi.fetchMe()
      this.user = user
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  }
})