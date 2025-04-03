import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      sourcemap: true,
      lib: {
        entry: path.join(__dirname, 'electron/main.ts'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      sourcemap: true,
      lib: {
        entry: path.join(__dirname, 'electron/preload.ts'),
        formats: ['cjs'],
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
    plugins: [vue(), tailwindcss()],
  },
})
