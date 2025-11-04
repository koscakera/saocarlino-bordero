import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    allowedHosts: [
      '8080-ip8q1qx3sgbioi0l71tj4-096a483e.manus.computer'
    ]
  }
})
