import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { fileURLToPath } from 'url'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      sourcemap: true,
      lib: {
        entry: path.join(__dirname, 'src/electron/main.ts'),
      },
    },
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/electron/riot/certs',
            dest: '.',
          },
          {
            src: 'src/electron/.env',
            dest: '.',
          },
        ],
      }),
    ],
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      sourcemap: true,
      lib: {
        entry: path.join(__dirname, 'src/electron/preload.ts'),
        formats: ['cjs'],
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: '.',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src/renderer', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
    plugins: [vue(), tailwindcss()],
  },
})
