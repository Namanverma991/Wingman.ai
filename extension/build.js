import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sharedConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
};

async function runBuilds() {
  console.log('=== Building UI elements (Popup & Sidepanel) ===');
  await build({
    ...sharedConfig,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
          popup: resolve(__dirname, 'src/popup/popup.html'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  });

  const scripts = [
    { name: 'serviceWorker', input: resolve(__dirname, 'src/background/serviceWorker.ts') },
    { name: 'whatsappContent', input: resolve(__dirname, 'src/content/whatsapp/extractor.ts') },
    { name: 'instagramContent', input: resolve(__dirname, 'src/content/instagram/extractor.ts') },
  ];

  for (const script of scripts) {
    console.log(`=== Building ${script.name} (isolated IIFE) ===`);
    await build({
      ...sharedConfig,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        rollupOptions: {
          input: script.input,
          output: {
            entryFileNames: `${script.name}.js`,
            format: 'iife',
          },
        },
      },
    });
  }

  // Run the manifest builder
  console.log('=== Generating production manifest.json ===');
  const manifestPath = resolve(__dirname, 'manifest.json');
  const distManifestPath = resolve(__dirname, 'dist', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  manifest.background.service_worker = 'serviceWorker.js';
  manifest.content_scripts[0].js = ['whatsappContent.js'];
  manifest.content_scripts[1].js = ['instagramContent.js'];

  if (manifest.action && manifest.action.default_icon) {
    for (const key in manifest.action.default_icon) {
      manifest.action.default_icon[key] = manifest.action.default_icon[key].replace(/^public\//, '');
    }
  }
  if (manifest.icons) {
    for (const key in manifest.icons) {
      manifest.icons[key] = manifest.icons[key].replace(/^public\//, '');
    }
  }

  fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2));
  console.log('Production manifest.json successfully written to dist!');
}

runBuilds().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
