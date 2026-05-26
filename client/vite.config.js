import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  legacy: {
    // This completely bypasses Vite 8's experimental Rolldown pipeline on cloud environments
    buildSsgBuild: false
  },
  build: {
    // Ensures a clean, standard production build matrix
    minify: 'esbuild'
  }
})
// Force a clean rebuild on Vercel