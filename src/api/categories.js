import http from './http'

export function listCategories() {
  return http.get('/categories')
}

export function createCategory(name) {
  return http.post('/categories', { name })
}

export function updateCategory(id, name) {
  return http.put(`/categories/${id}`, { name })
}

export function deleteCategory(id) {
  return http.delete(`/categories/${id}`)
}
