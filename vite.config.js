import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  const port = parseInt(env.VITE_DEV_SERVER_PORT) || 5173
  const host = env.VITE_DEV_SERVER_HOST || '0.0.0.0'
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8080'

  console.log(`🚀 Starting dev server on http://${host}:${port}`)
  console.log(`📡 Proxying API to ${apiTarget}`)

  return {
    plugins: [vue()],
    server: {
      port: port,
      host: host, // 0.0.0.0 allows network access
      strictPort: false, // If port is taken, try next available
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path
        },
        '/media': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    // Optional: Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})