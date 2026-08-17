import http from './http'

export function recordHistory(videoId) {
  return http.post(`/history/${videoId}`)
}

export function listHistory(params = {}) {
  return http.get('/history', { params })
}
