// api/playback.js
import http from './http'

// `x-session-id` is how we track guests against the free-play limit
export function getPlayback(videoId, sessionId) {
  return http.get(`/playback/${videoId}`, {
    headers: sessionId ? { 'x-session-id': sessionId } : {}
  })
}