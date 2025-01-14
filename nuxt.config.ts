// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    injectManifest: {
      swSrc: 'service-worker.js',
      globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
    },
    registerType: 'autoUpdate',
    manifest: {
      name: 'pwa app',
      short_name:'PWA',
      description: 'description',
      theme_color:'#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      screenshots: [
        {
          src: '/screenshots/screenshot1.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
        },
        {
          src: '/screenshots/screenshot2.png',
          sizes: '720x1280',
          type: 'image/png',
          form_factor: 'narrow',
        },
      ]
    },
    workbox: {
      navigateFallback: '/offline',
      runtimeCaching: [
        {
          urlPattern: /^\/offline$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'offline-cache',
          },
        },
        {
          urlPattern: ({ request }) => ['style', 'script', 'worker'].includes(request.destination), // Для CSS, JS, worker
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'assets-cache',
          },
        },
        {
          urlPattern: ({request}) => ['image'].includes(request.destination), // Для изображений
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
            },
          },
        }
      ],
    }
  }
})

