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
    minify: true,
    keepNames: true
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://aiva-lfxq.onrender.com',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
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
