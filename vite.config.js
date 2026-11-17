import { defineConfig } from 'vitest/config';

// GitHub Pages sert le dépôt dans un sous-dossier :
// https://erdiskodjo.github.io/SpaceHeroes2/
// En local, le site reste à la racine. Le workflow pose PAGES=1.
const base = process.env.PAGES === '1' ? '/SpaceHeroes2/' : '/';

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
