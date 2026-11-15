import { defineConfig } from 'vitest/config';

// GitHub Pages sert le dépôt dans un sous-dossier (https://jodm007.github.io/SpaceHeros/).
// Une base relative suit le nom du dépôt. En local, le site reste à la racine.
// Le workflow pose PAGES=1.
const base = process.env.PAGES === '1' ? './' : '/';

export default defineConfig({
  base,
  root: '.',
  server: {
    host: true
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
    passWithNoTests: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});
