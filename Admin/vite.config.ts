import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('..', import.meta.url)), '');
  const projectRoot = fileURLToPath(new URL('..', import.meta.url));
  return {
    plugins: [react(), tailwindcss()],
    envDir: fileURLToPath(new URL('..', import.meta.url)),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      // The dashboard reads one variable; accept either name so the root
      // .env.local can stay a single source of truth for both apps.
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
      ),
    },
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      open: false,
      clearScreen: false,
      fs: {
        allow: [projectRoot],
      },
    },
    preview: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
    },
  };
});
