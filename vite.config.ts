import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 이미 있던 React 플러그인
import tailwindcss from '@tailwindcss/vite' // 방금 설치한 Tailwind 플러그인

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 이 한 줄로 Tailwind가 빌드 과정에 끼워짐
  ],
})