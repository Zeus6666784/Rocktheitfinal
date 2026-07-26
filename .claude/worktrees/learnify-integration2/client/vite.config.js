import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mockApiPlugin } from './vite/mockApi';

/**
 * Mock backend runs only when VITE_USE_MOCK=true.
 * Default is the real Express server at VITE_API_URL or same-origin /api.
 */
const useMock = String(process.env.VITE_USE_MOCK).toLowerCase() === 'true';

export default defineConfig({
  plugins: [react(), ...(useMock ? [mockApiPlugin()] : [])],
  server: {
    port: 5173,
    open: true,
    proxy: useMock
      ? undefined
      : {
          '/api': {
            target: process.env.VITE_API_PROXY || 'http://localhost:5000',
            changeOrigin: true,
          },
        },
  },
});