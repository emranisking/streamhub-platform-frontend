import http from './http'

export function trackVisit(sessionId) {
  return http.post('/analytics/track', sessionId ? { sessionId } : {})
}

export function fetchVisits(range = 'DAILY') {
  return http.get('/analytics/visits', { params: { range } })
}

export function fetchRegistrations(range = 'SIX_MONTHS') {
  return http.get('/analytics/registrations', { params: { range } })
}

export function fetchDashboard() {
  return http.get('/analytics/dashboard')
}
