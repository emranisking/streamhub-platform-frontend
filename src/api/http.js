// src/api/http.js
import axios from 'axios'
import router from '../router'
import { useAuthStore } from '../stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const http = axios.create({ baseURL })

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      if (Array.isArray(body.data)) {
        body.data._envelope = body
      } else if (body.data && typeof body.data === 'object') {
        body.data._envelope = body
      }
      return body.data !== undefined ? body.data : body
    }
    return response.data
  },
  (error) => {
    const auth = useAuthStore()
    const envelope = error.response?.data

    if (error.response?.status === 401) {
      const wasAuthenticated = auth.isAuthenticated
      auth.clearSession()

      // Only bounce to login if we thought we were logged in and the
      // current route actually requires auth — avoids redirect loops
      // on public pages that happen to carry a stale token.
      if (wasAuthenticated && router.currentRoute.value.meta.requiresAuth) {
        router.replace({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
    }

    const normalized = {
      status: error.response?.status ?? 0,
      error: envelope?.error ?? 'Network Error',
      message:
        envelope?.message ??
        (error.response
          ? 'Something went wrong talking to StreamHub.'
          : 'Could not reach the StreamHub server. Is the backend running?'),
      fieldErrors: envelope?.fieldErrors ?? null
    }
    return Promise.reject(normalized)
  }
)

export default http