import http from './http'

// `x-session-id` is how we track guests against the free-play limit —
// see API_PURPOSE.md §2. Always send the same locally-generated id for
// the whole guest session (see src/composables/useGuestSession.js).
export function getPlayback(videoId, sessionId) {
  return http.get(`/playback/${videoId}`, {
    headers: sessionId ? { 'x-session-id': sessionId } : {}
  })
}
