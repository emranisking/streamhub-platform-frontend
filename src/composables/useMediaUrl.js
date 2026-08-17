// Thumbnails and HLS manifests come back as origin-relative paths, e.g.
// "/media/intro-to-spring-boot/intro-to-spring-boot_thumb.jpg" (see
// API_DOCUMENTATION.md §4). They live at the backend's root, not under
// /api/v1, so we strip the API path off VITE_API_BASE_URL to get the
// media origin.
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const mediaOrigin = apiBase.replace(/\/api\/v1\/?$/, '')

export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${mediaOrigin}${path}`
}

export function useMediaUrl() {
  return { mediaUrl }
}
