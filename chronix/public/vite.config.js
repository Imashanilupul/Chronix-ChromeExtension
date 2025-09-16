import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";
import { copyFile, mkdir } from 'fs/promises';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle: async () => {
        try {
          // Copy manifest.json
          await copyFile('manifest.json', 'dist/manifest.json');
          
          // Copy background.js
          await copyFile('background.js', 'dist/background.js');
          
          // Copy icons directory
          try {
            await mkdir('dist/icons', { recursive: true });
            await copyFile('icons/icon-16.png', 'dist/icons/icon-16.png');
            await copyFile('icons/icon-48.png', 'dist/icons/icon-48.png');
            await copyFile('icons/icon-128.png', 'dist/icons/icon-128.png');
          } catch (err) {
            console.warn('Could not copy icons:', err.message);
          }
          
          console.log('✅ Extension files copied successfully!');
        } catch (err) {
          console.error('❌ Error copying extension files:', err);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/[name].[ext]`;
          }
          if (/css/i.test(extType)) {
            return `assets/[name].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
        chunkFileNames: `assets/[name]-[hash].js`,
        entryFileNames: `assets/[name]-[hash].js`,
      }
    },
  },
});
