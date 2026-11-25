import http from './http'

export function register({ username, email, password }) {
  return http.post('/auth/register', { username, email, password }, { withCredentials: true })
}

export function login({ email, password }) {
  return http.post('/auth/login', { email, password }, { withCredentials: true })
}

export function refresh() {
  return http.post('/auth/refresh', {}, { withCredentials: true })
}

export function logout() {
  return http.post('/auth/logout', {}, { withCredentials: true })
}