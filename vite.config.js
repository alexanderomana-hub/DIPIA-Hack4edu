import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/login': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/register': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/materials': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/analyze': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/video_feed': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/start_camera': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/stop_camera': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  },
  root: '.',
  publicDir: 'src/public'
})