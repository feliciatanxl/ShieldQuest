import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'ShieldQuest',
        short_name: 'ShieldQuest',
        description:
          'Practise the decision before it costs anything. An interactive crime-prevention and scam-awareness experience for youths.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        // navy-950, matching tokens.css and index.html.
        theme_color: '#061527',
        // The player app opens on the dark game skin, so the splash should too.
        background_color: '#061527',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        // Do not cache private/session API data. Only the app shell and bundled demos work offline.
      },
    }),
  ],
  server: { port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3001' } },
  preview: { port: 4173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3001' } },
});
