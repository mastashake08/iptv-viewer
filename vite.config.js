import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/iptv-viewer/', // Replace 'iptv-viewer' with your repository name
  plugins: [vue(), VitePWA({
    registerType: 'prompt',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'iptv-viewer',
      short_name: 'IPTV',
      description: 'A standalone IPTV PWA viewer. Load .m3u8 playlists and watch.',
      theme_color: '#000000',
      display: 'standalone',
      file_handlers: [
        {
          action: "/",
          accept: {
            "application/x-mpegURL": [".m3u8", ".m3u"]
          }
        }
      ],
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})