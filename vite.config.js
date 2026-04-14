import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Required for Stellar SDK to work in browser environment
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Node.js polyfills needed by Stellar SDK
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
