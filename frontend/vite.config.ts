import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 監聽 0.0.0.0，可用區網 IP 從手機存取（執行時終端會顯示 Network 網址）
    port: 5173,
  },
})
