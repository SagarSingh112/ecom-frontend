import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ecom-backend-16sc.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})