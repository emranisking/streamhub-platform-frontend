import http from './http'

export function subscribe(plan = 'basic') {
  return http.post('/subscriptions/subscribe', { plan })
}

export function cancelSubscription() {
  return http.post('/subscriptions/cancel')
}

export function mySubscriptions() {
  return http.get('/subscriptions/me')
}
