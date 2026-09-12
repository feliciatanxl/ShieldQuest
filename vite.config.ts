import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * ShieldQuest is delivered by QR code to a phone that may be on a school
 * network, so the build targets a first load that survives a bad connection:
 * Three.js is split out so the shell and the accessible DOM board can paint
 * before the 3D layer arrives.
 *
 * The service worker and web app manifest are hand-written in `public/` rather
 * than generated — see the header of `public/sw.js` for why.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Three.js is a third of the bundle and the flat board never needs it.
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
});
