import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const certDirectory = fileURLToPath(new URL('./.certs/', import.meta.url))
const useHttps = process.env.AURA_HTTPS === '1'
const https = useHttps
  ? {
      key: readFileSync(resolve(certDirectory, 'server-key.pem')),
      cert: readFileSync(resolve(certDirectory, 'server.pem')),
    }
  : undefined

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyRequest) => {
            proxyRequest.setHeader('X-Forwarded-Proto', useHttps ? 'https' : 'http')
          })
        },
      },
    },
  },
})
