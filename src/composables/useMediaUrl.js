// composables/useMediaUrl.js
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/**
 * Generate URL for video thumbnail
 * @param {string} videoIdOrPath - The video ID or thumbnail path
 * @param {string} thumbnailPath - The thumbnail path from the API (optional)
 * @returns {string} The thumbnail URL
 */
export function mediaUrl(videoIdOrPath, thumbnailPath) {
  console.log('🔍 mediaUrl called with:', { videoIdOrPath, thumbnailPath })
  
  if (!videoIdOrPath) return ''
  
  // If thumbnailPath is provided and is a full URL, return it
  if (thumbnailPath && /^https?:\/\//i.test(thumbnailPath)) {
    return thumbnailPath
  }
  
  // Check if videoIdOrPath is actually a file path (contains /home/ or /thumbnails/)
  if (typeof videoIdOrPath === 'string') {
    // If it's a full file system path, extract just the filename
    if (videoIdOrPath.includes('/home/') || 
        videoIdOrPath.includes('/thumbnails/') || 
        videoIdOrPath.includes('/media/') ||
        videoIdOrPath.includes('.jpg') ||
        videoIdOrPath.includes('.png') ||
        videoIdOrPath.includes('.webp')) {
      
      // Extract filename from the path
      const parts = videoIdOrPath.split('/')
      const filename = parts[parts.length - 1]
      console.log('📸 Extracted filename from path:', filename)
      
      // Use the thumbnail endpoint with filename
      const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
      return `${base}/videos/thumbnail/${encodeURIComponent(filename)}`
    }
    
    // Check if it's a UUID (video ID) - simple check for UUID format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoIdOrPath)
    if (isUuid) {
      const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
      return `${base}/videos/${videoIdOrPath}/thumbnail`
    }
  }
  
  // If videoIdOrPath is a full URL, return it
  if (/^https?:\/\//i.test(videoIdOrPath)) {
    return videoIdOrPath
  }
  
  // Default: treat as video ID
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  return `${base}/videos/${videoIdOrPath}/thumbnail`
}

/**
 * ⭐ NEW: Get thumbnail by filename directly (for backward compatibility)
 * @param {string} filename - The thumbnail filename
 * @returns {string} The thumbnail URL
 */
export function getThumbnailByFilename(filename) {
  if (!filename) return ''
  
  console.log('📸 getThumbnailByFilename called with:', filename)
  
  // If it's a full path, extract just the filename
  let cleanFilename = filename
  if (cleanFilename.includes('/')) {
    cleanFilename = cleanFilename.split('/').pop()
  }
  if (cleanFilename.includes('\\')) {
    cleanFilename = cleanFilename.split('\\').pop()
  }
  
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  return `${base}/videos/thumbnail/${encodeURIComponent(cleanFilename)}`
}

/**
 * Generate URL for video playback (HLS manifest)
 * @param {string} manifestPath - The manifest path from the API
 * @returns {string} The full manifest URL
 */
export function getManifestUrl(manifestPath) {
  if (!manifestPath) return ''
  
  console.log('🎬 getManifestUrl input:', manifestPath)
  
  // If it's already a full URL, return it
  if (/^https?:\/\//i.test(manifestPath)) {
    return manifestPath
  }
  
  // Get the base URL without /api/v1
  const base = apiBase.replace(/\/api\/v1\/?$/, '') || ''
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  
  // If it's a file system path, extract the relative path
  if (manifestPath.includes('/home/') || manifestPath.includes('/video_hls/')) {
    let relativePath = manifestPath
    // Extract everything after video_hls/
    if (relativePath.includes('/video_hls/')) {
      relativePath = relativePath.substring(relativePath.indexOf('/video_hls/') + 11)
    } else {
      // Just get the filename
      const parts = relativePath.split('/')
      relativePath = parts[parts.length - 1]
    }
    
    // Ensure it's a valid path
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath
    }
    
    const url = `${cleanBase}/media${relativePath}`
    console.log('🎬 getManifestUrl output (from file path):', url)
    return url
  }
  
  // If it's an absolute path starting with /, use it directly
  if (manifestPath.startsWith('/')) {
    const url = `${cleanBase}${manifestPath}`
    console.log('🎬 getManifestUrl output (absolute):', url)
    return url
  }
  
  // Otherwise, treat as relative path under media
  const url = `${cleanBase}/media/${manifestPath}`
  console.log('🎬 getManifestUrl output (relative):', url)
  return url
}

/**
 * Check if a string is a UUID
 * @param {string} str - The string to check
 * @returns {boolean} True if it's a UUID
 */
export function isUuid(str) {
  if (!str || typeof str !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Extract filename from a path
 * @param {string} path - The file path
 * @returns {string} The filename
 */
export function extractFilename(path) {
  if (!path) return ''
  if (path.includes('/')) {
    return path.split('/').pop()
  }
  if (path.includes('\\')) {
    return path.split('\\').pop()
  }
  return path
}

// For backward compatibility - if called with just a path
export function mediaUrlLegacy(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  
  // If it's a thumbnail path, extract video ID from it
  const match = path.match(/\/([a-f0-9-]+)_thumb/i)
  if (match && match[1]) {
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
    return `${base}/videos/${match[1]}/thumbnail`
  }
  
  // If it's a file path, extract filename
  if (path.includes('/home/') || path.includes('/thumbnails/')) {
    const filename = extractFilename(path)
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
    return `${base}/videos/thumbnail/${encodeURIComponent(filename)}`
  }
  
  return path
}

export function useMediaUrl() {
  return { 
    mediaUrl, 
    getManifestUrl, 
    mediaUrlLegacy,
    getThumbnailByFilename,
    isUuid,
    extractFilename
  }
}