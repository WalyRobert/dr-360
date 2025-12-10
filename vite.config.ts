import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({css: {
  postcss: {
    plugins: [require('tailwindcss'), require('autoprefixer')],
  },
},
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  }
});
