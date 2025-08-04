// Plugins
import components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import fonts from 'unplugin-fonts/vite'
import type { MinifyOptions } from 'terser'
// Utilities
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'url'
import path from 'path'

export default defineConfig(({ mode }) => {
  console.log(mode)
  // 先加載基礎的 .env 文件
  const baseEnv = loadEnv('', process.cwd())
  // 載入目標 .env 文件
  const env = loadEnv(baseEnv.VITE_CURRENT_ENV || 'development', process.cwd())

  return {
    plugins: [
      vue({
        template: { transformAssetUrls }
      }),
      vuetify(),
      components({
        resolvers: [VuetifyResolver()]
      }),
      fonts({
        fontsource: {
          families: [
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic']
            }
          ]
        }
      })
    ],
    base: env.VITE_BASE || '/',
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src')
      }
    },
    build: {
      sourcemap: env.VITE_SOURCEMAP ? env.VITE_SOURCEMAP === 'true' : false,
      outDir: env.VITE_OUT_DIR || 'dist',
      terserOptions: {
        compress: {
          drop_console: env.VITE_DROP_CONSOLE ? env.VITE_DROP_CONSOLE === 'true' : false,
          drop_debugger: env.VITE_DROP_DEBUGGER ? env.VITE_DROP_DEBUGGER === 'true' : true
        }
      } as MinifyOptions
    },
    optimizeDeps: {
      exclude: ['vuetify']
    },
    define: {
      'process.env': {
        VITE_BASE: `${env.VITE_BASE}`,
        VITE_API_URL: `${env.VITE_API_URL}`,
        VITE_API_INV_URL: `${env.VITE_API_INV_URL}`
      }
    }
  }
})
