import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/jovensmja/',
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.mjs', '.json'],
  },
})
