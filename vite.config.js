import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/admin/', // ✅ 꼭 마지막 '/' 포함!
  plugins: [react()],
})
