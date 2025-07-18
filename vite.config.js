import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react-icons/fa',
        'firebase/auth',
        'firebase/firestore',
        'firebase/app'
      ]
    }
  },
  optimizeDeps: {
    include: [
      'react-icons',
      'react-icons/fa',
      'firebase/auth',
      'firebase/firestore',
      'firebase/app'
    ]
  }
});
