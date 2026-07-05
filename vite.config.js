import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    watch: {
      ignored: [
        '**/*.png',
        '**/*.docx',
        '**/nature_alchemy*.db',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**'
      ]
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html'),
        admin: path.resolve(process.cwd(), 'admin/index.html')
      }
    }
  }
});
