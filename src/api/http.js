import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Every StreamHub response is wrapped as { success, message, data, timestamp }
// (see API_DOCUMENTATION.md §"Base URL"). This client attaches the bearer
// token when present, unwraps `data` on success, and normalizes errors to
// the { status, error, message, fieldErrors } shape from §12 so components
// never have to think about the envelope.

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
    // Unwrap the envelope. Keep the raw envelope available via `._envelope`
    // for the rare call site that wants `message` (e.g. "Subscription activated").
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
      // Token missing/expired/invalid — drop the stale session so the UI
      // falls back to guest behavior instead of looping on 401s.
      auth.clearSession()
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
