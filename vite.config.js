// ecom/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://https://ecom-backend-16sc.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})