import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    strictPort: true, // Don't try another port if 5173 is taken
    hmr: {
      timeout: 120000, // Increase timeout to 2 minutes
      overlay: true,   // Show errors as overlay
    },
  },
})
