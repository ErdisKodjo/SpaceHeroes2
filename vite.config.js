import { defineConfig } from 'vitest/config';

// GitHub Pages sert le dépôt à la racine (https://jodm007.github.io/SpaceHeroes2/).
// Une base relative vide ou '/' fonctionne correctement.
// Le workflow pose PAGES=1 pour activer le mode déploiement.
const base = process.env.PAGES === '1' ? '/' : '/';

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
