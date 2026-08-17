import http from './http'

export function listLikes(params = {}) {
  return http.get('/likes', { params })
}

// Toggles like/unlike — see API_DOCUMENTATION.md §8.
export function toggleLike(videoId) {
  return http.post(`/likes/${videoId}`)
}
