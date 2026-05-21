import { defineConfig } from 'vite'

// Dev server proxy: forward /api to backend running on localhost:4000
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
