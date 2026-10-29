import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/web-matematica-basica-y-pensamiento-matematico/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: {
          'vendor-katex': ['katex'],
          'vendor-graph': ['function-plot'],
          'vendor-db': ['dexie'],
          'vendor-pdf': ['jspdf', 'qrcode']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    modulePreload: {
      polyfill: true
    },
    cssCodeSplit: true,
    reportCompressedSize: true
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  optimizeDeps: {
    include: ['katex', 'function-plot', 'dexie'],
    exclude: ['jspdf', 'qrcode']
  },
  css: {
    devSourcemap: true
  }
});