import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  build: {
    // Ensures a clean, standard production build matrix
    minify: 'esbuild'
  }
})
// Force a clean rebuild on Vercel