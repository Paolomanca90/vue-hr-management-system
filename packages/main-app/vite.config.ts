import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@presenze-in-web-frontend/core-lib': fileURLToPath(new URL('../core-lib/src', import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: ['..'] // Permette di accedere ai pacchetti del monorepo
    }
  }
})
