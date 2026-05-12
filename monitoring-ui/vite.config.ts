import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Dev proxy targets: use 127.0.0.1 so Node does not hit ::1 while Spring listens on IPv4 (common Windows ECONNABORTED source). */
const POLICY = 'http://127.0.0.1:8081'
const PAYMENT = 'http://127.0.0.1:8082'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Longer /api prefixes first so '/api/payment' does not steal '/api/payments' (prefix match).
      '/api/payments': {
        target: PAYMENT,
        changeOrigin: true,
      },
      '/api/payment': {
        target: PAYMENT,
        changeOrigin: true,
      },
      '/api/monitor': {
        target: POLICY,
        changeOrigin: true,
      },
      '/api/policies': {
        target: POLICY,
        changeOrigin: true,
      },
      '/ws': {
        target: POLICY,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
