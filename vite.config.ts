/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5173,
    // 운영 ALB 경로 라우팅과 동일한 구조를 로컬에서 재현 (CORS 설정 불필요)
    //   /api/events/** → event-service(8081),  그 외 /api/** → monolith(8080)
    // 더 구체적인 경로를 먼저 둔다.
    proxy: {
      '/api/events': 'http://localhost:8081',
      '/api': 'http://localhost:8080',
    },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
});
