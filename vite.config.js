import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three-core'
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'r3f'
          if (id.includes('postprocessing') || id.includes('@react-three/postprocessing')) return 'postprocessing'
          if (id.includes('framer-motion')) return 'motion'
        },
      },
    },
  },
})
