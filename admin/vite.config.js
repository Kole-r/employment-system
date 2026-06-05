import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    proxy: {
      '/adminApi': {
        target: 'http://localhost:3000', // 目标服务器地址
        changeOrigin: true, // 是否改变请求源
      },
      '/avataruploads': {
        target: 'http://localhost:3000', // 目标服务器地址
        changeOrigin: true, // 是否改变请求源
      },
      '/newsuploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000', // AI服务地址
        changeOrigin: true,
      }
    }
  }
})
