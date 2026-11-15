import { defineConfig } from 'vite';

// GitHub Pages publie le dépôt à https://<compte>.github.io/SpaceHeroes2/
// En local, le site reste à la racine. Le workflow pose PAGES=1.
const base = process.env.PAGES === '1' ? '/SpaceHeroes2/' : '/';

export default defineConfig({
  base,
  root: '.',
  server: {
    host: true
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
