import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {globSync} from 'glob';

const htmlFiles = globSync('public_html/**/*.html').reduce((acc, file) => {
  if (file.includes('dist/') || file.includes('public_html/public/')) return acc;
  const name = path.relative('public_html', file).replace(/\.html$/, '');
  acc[name] = path.resolve(process.cwd(), file);
  return acc;
}, {});

export default defineConfig(() => {
  return {
    root: 'public_html',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: htmlFiles
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
