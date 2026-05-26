import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/marquee-wc.js'),
      name: 'MarqueeWc',
      fileName: 'marquee-wc',
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
