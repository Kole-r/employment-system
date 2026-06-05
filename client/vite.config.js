import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
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
    port: 5174,
    proxy: {
      '/webApi': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/newsuploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/avataruploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        configure: (proxy) => {
          // SSE流式接口禁用缓冲
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.url.includes('/stream')) {
              proxyReq.setHeader('X-Accel-Buffering', 'no');
            }
          });
        },
      }
    }
  }
})
