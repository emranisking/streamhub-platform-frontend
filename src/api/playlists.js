import http from './http'

export function listPlaylists() {
  return http.get('/playlists')
}

export function createPlaylist(title) {
  return http.post('/playlists', { title })
}

export function addToPlaylist(playlistId, videoId) {
  return http.post(`/playlists/${playlistId}/add/${videoId}`)
}

export function removeFromPlaylist(playlistId, videoId) {
  return http.delete(`/playlists/${playlistId}/remove/${videoId}`)
}

export function movePlaylistItem(playlistId, videoId, newPosition) {
  return http.patch(`/playlists/${playlistId}/move/${videoId}/${newPosition}`)
}

export function deletePlaylist(playlistId) {
  return http.delete(`/playlists/${playlistId}`)
}
