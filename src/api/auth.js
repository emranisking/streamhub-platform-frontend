import http from './http'

export function register({ username, email, password }) {
  return http.post('/auth/register', { username, email, password })
}

export function login({ email, password }) {
  return http.post('/auth/login', { email, password })
}

export function fetchMe() {
  return http.get('/users/me')
}
