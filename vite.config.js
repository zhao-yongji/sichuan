import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5180,
      open: true,
      proxy: {
        "/slau": {
          // 以 /slau 开头的请求代理到后端服务，并去掉 /slau 前缀
          target: "http://192.168.0.95:31307/", // 目标服务器
          changeOrigin: true, // 代理请求时将原始请求的 Host 头部换成目标服务器的 Host
          rewrite: (path) => path.replace(/^\/slau/, ""), // 重写路径
        }
      }
    }
  }
})
