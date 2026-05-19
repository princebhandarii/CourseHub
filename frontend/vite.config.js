import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Only used in local dev — in production VITE_API_URL points to Render
      '/api':     { target: 'http://localhost:5002', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5002', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
