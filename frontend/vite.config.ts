import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    __APP_BUILD__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
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
