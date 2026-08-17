const STORAGE_KEY = 'streamhub_guest_session_id'

function generateId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// A guest is tracked by this locally-generated id (sent as `x-session-id`)
// so their free-play count follows the browser tab, not an IP — see
// API_PURPOSE.md §2. Registered users are tracked by their account instead,
// so this id is irrelevant once logged in, but harmless to keep sending.
export function useGuestSession() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
