import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        journey: resolve(__dirname, 'scent-journey.html'),
        warranty: resolve(__dirname, 'warranty.html'),
        advisor: resolve(__dirname, 'fragrance-advisor.html'),
      }
    }
  }
})
