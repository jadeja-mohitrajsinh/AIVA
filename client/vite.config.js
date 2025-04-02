import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
      fastRefresh: true,
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx'],
      },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react-hook-form', 'firebase/app', 'firebase/storage', 'framer-motion'],
    exclude: ['framer-motion/dist/es/components/AnimatePresence/index.mjs', 'framer-motion/dist/es/motion/index.mjs']
  },
  esbuild: {
    loader: 'jsx',
    include: /\.[jt]sx?$/,
    exclude: [],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8800',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
});
