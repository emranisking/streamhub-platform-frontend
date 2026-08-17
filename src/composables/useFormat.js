export function formatCount(n) {
  if (n === null || n === undefined) return '0'
  if (n < 1000) return `${n}`
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function formatViews(n) {
  return `${formatCount(n)} view${n === 1 ? '' : 's'}`
}

export function formatDuration(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return ''
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const pad = (v) => String(v).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const then = new Date(isoString).getTime()
  const now = Date.now()
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000))

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ]

  for (const [label, secondsInUnit] of units) {
    const value = Math.floor(diffSeconds / secondsInUnit)
    if (value >= 1) return `${value} ${label}${value === 1 ? '' : 's'} ago`
  }
  return 'just now'
}
