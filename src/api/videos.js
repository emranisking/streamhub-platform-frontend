import http from './http'

// `params` may include categoryId, page, limit, or cursor — see
// API_DOCUMENTATION.md §11. Pass whichever the caller supplied and let the
// backend's signed cursor drive subsequent pages.
export function listVideos(params = {}) {
  return http.get('/videos', { params })
}

export function fetchVideo(id) {
  return http.get(`/videos/${id}`)
}

export function bumpViews(id) {
  return http.patch(`/videos/${id}/views`)
}

export function checkLimit(id, sessionId) {
  return http.get(`/videos/${id}/check-limit`, {
    params: sessionId ? { sessionId } : {}
  })
}

export function incrementWatch(id, sessionId) {
  return http.post(`/videos/${id}/increment-watch`, null, {
    params: sessionId ? { sessionId } : {}
  })
}

export function setVideoCategory(id, categoryId) {
  return http.patch(`/videos/${id}/category`, null, { params: { categoryId } })
}

export function deleteVideo(id) {
  return http.delete(`/videos/${id}`)
}
