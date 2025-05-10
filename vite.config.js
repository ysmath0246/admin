import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/admin/', // ✅ dev에선 '/' / build에선 '/admin/'
  plugins: [react()],
}))
