import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Fast Refresh is currently crashing with `$RefreshSig$ is not defined`.
  // Disabling it keeps dev working; you can re-enable after dependency cleanup.
  plugins: [react({ fastRefresh: false }),
    tailwindcss()
  ],
})
