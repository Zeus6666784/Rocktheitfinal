import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mockApiPlugin } from './vite/mockApi';

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    port: 5173,
    open: true,
  },
});
