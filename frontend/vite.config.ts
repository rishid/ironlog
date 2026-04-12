import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

const gitHash = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return 'unknown' }
})()
const buildDate = new Date().toISOString().split('T')[0]

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(gitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      manifest: false, // using public/manifest.json
      workbox: {
        // Exclude HTML from precache so navigation requests always hit the
        // network — this lets Authelia (forward-auth proxy) intercept and
        // redirect unauthenticated requests instead of serving a cached page.
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Navigation requests (HTML) — NetworkFirst so Authelia can auth-check.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:8090',
      '/_': 'http://localhost:8090',
    },
  },
})
