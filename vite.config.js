import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // Base sobreescribible: BASE_URL para desplegar en cualquier subpath
  base: process.env.BASE_URL || '/web-matematica-basica-y-pensamiento-matematico/',
  publicDir: 'public',
  // Nota: function-plot se retiró junto con InteractiveGraph/FormulaExplorer (código muerto)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        // Vite 8 (rolldown): manualChunks solo acepta función
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) return 'vendor-katex';
            if (id.includes('dexie')) return 'vendor-db';
          }
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
    cssCodeSplit: true,
    reportCompressedSize: true
  },
  server: {
    port: 3000,
    open: false,
    cors: true
  },
  optimizeDeps: {
    include: ['katex', 'dexie'],
    exclude: ['jspdf']
  },
  css: {
    devSourcemap: true
  }
});