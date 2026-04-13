import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vue3QueryBuilderNaiveUI',
      fileName: (format) => `vue3-querybuilder-naive-ui.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'naive-ui', '@vicons/ionicons5'],
      output: {
        globals: {
          vue: 'Vue',
          'naive-ui': 'NaiveUI',
          '@vicons/ionicons5': 'ViconsIonicons5',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'vue3-querybuilder-naive-ui.css'
          }
          return assetInfo.name || 'asset'
        },
      },
    },
  },
})

