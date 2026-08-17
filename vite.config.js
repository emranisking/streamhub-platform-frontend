import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// StreamHub frontend dev server.
// The API base URL itself is configured in `.env` (VITE_API_BASE_URL) —
// see src/api/http.js. This proxy is only a convenience for local dev so
// you can hit /api/v1/... from the Vite dev server without CORS pain if
// you don't set VITE_API_BASE_URL at all.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/media': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
