// composables/useMediaUrl.js
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/**
 * Generate URL for video thumbnail
 * @param {string} videoId - The video ID
 * @param {string} thumbnailPath - The thumbnail path from the API (optional)
 * @returns {string} The thumbnail URL
 */
export function mediaUrl(videoId, thumbnailPath) {
  if (!videoId) return ''
  
  // If it's already a full URL, return it
  if (thumbnailPath && /^https?:\/\//i.test(thumbnailPath)) {
    return thumbnailPath
  }

  // Use the video thumbnail endpoint
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  return `${base}/videos/${videoId}/thumbnail`
}

// For backward compatibility - if called with just a path
export function mediaUrlLegacy(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  
  // If it's a thumbnail path, extract video ID from it
  // This is a fallback for places where we don't have video ID
  const match = path.match(/\/([a-f0-9-]+)_thumb/i)
  if (match && match[1]) {
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
    return `${base}/videos/${match[1]}/thumbnail`
  }
  
  return path
}

export function useMediaUrl() {
  return { mediaUrl, mediaUrlLegacy }
}