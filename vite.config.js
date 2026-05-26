import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/super-marquee.js'),
      name: 'SuperMarquee',
      fileName: 'super-marquee',
      formats: ['es'],
    },
    outDir: 'dist',
    minify: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: false,
  },
});
