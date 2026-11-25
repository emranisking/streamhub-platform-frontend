import axios from 'axios'
import router from '../router'
import { useAuthStore } from '../stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const http = axios.create({ baseURL })

// 1. Request Interceptor: Attach Access Token
http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

// 2. Response Interceptor: Handle 401 with Refresh Token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

http.interceptors.response.use(
  (response) => {
    // Unwrap standard envelope
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      return body.data !== undefined ? body.data : body
    }
    return response.data
  },
  async (error) => {
    const auth = useAuthStore()
    const originalRequest = error.config

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return http(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh endpoint (using a fresh axios instance or direct axios to avoid loops)
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
        
        // Backend returns { success, data: { token, user } }
        const newToken = data.data.token
        auth.accessToken = newToken
        
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return http(originalRequest)
        
      } catch (refreshError) {
        processQueue(refreshError, null)
        auth.clearSession()
        router.push({ name: 'login' })
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Standard error normalization
    const envelope = error.response?.data
    const normalized = {
      status: error.response?.status ?? 0,
      error: envelope?.error ?? 'Network Error',
      message: envelope?.message ?? 'Something went wrong.',
      fieldErrors: envelope?.fieldErrors ?? null
    }
    return Promise.reject(normalized)
  }
)

export default http