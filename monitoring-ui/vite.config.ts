import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev proxy targets:
 * - Local: 127.0.0.1 avoids Windows localhost → ::1 vs IPv4 JVM issues.
 * - Docker Compose: set VITE_POLICY_PROXY_TARGET / VITE_PAYMENT_PROXY_TARGET to http://policy-service:8081 etc.
 */
const POLICY = process.env.VITE_POLICY_PROXY_TARGET || 'http://127.0.0.1:8081'
const PAYMENT = process.env.VITE_PAYMENT_PROXY_TARGET || 'http://127.0.0.1:8082'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
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
