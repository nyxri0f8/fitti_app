import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Prevents exposing original file structure to website copiers
    minify: 'esbuild', // Obfuscates code making it hard to reverse engineer
  }
})
