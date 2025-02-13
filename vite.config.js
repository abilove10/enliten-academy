import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const isDevelopment = mode === 'development'
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: isDevelopment ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    },
    define: {
      __API_URL__: JSON.stringify(isDevelopment 
        ? 'http://localhost:5000' 
        : 'https://api.enliten.org.in'
      )
    }
  }
})