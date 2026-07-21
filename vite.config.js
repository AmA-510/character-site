import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages stores this project under /character-site/.
  base: process.env.GITHUB_ACTIONS ? '/character-site/' : '/',
  plugins: [react()],
})
