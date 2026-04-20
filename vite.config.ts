import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // GitHub Pages部署时的基础路径
  // 如果是生产环境且有指定基础路径，使用指定路径
  // 否则使用根路径
  const isProduction = mode === 'production'
  let base = env.VITE_BASE_URL || '/'

  // 清理路径：确保不以文件系统路径形式出现
  if (base.includes(':')) {
    // 如果是文件系统路径（如 D:/Git/...），使用默认值
    base = '/'
  }

  // 确保基础路径格式正确
  if (base !== '/') {
    if (!base.startsWith('/')) base = '/' + base
    if (!base.endsWith('/')) base = base + '/'
  }

  console.log(`🚀 构建配置: mode=${mode}, base=${base}`)

  return {
    base,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // 确保资源路径正确
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        }
      }
    },
  }
})
