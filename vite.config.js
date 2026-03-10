import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:         resolve(__dirname, 'index.html'),
        journey:      resolve(__dirname, 'scent-journey.html'),
        warranty:     resolve(__dirname, 'warranty.html'),
        advisor:      resolve(__dirname, 'fragrance-advisor.html'),
        firstUse:     resolve(__dirname, 'tutorial-first-use.html'),
        cleaning:     resolve(__dirname, 'tutorial-cleaning.html'),
        changeScent:  resolve(__dirname, 'tutorial-change-scent.html'),
        troubleshoot: resolve(__dirname, 'tutorial-troubleshoot.html'),
      }
    }
  }
})
