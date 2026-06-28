import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('..', import.meta.url)), '');
  return {
    plugins: [react(), tailwindcss()],
    envDir: fileURLToPath(new URL('..', import.meta.url)),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@convex': fileURLToPath(new URL('../convex', import.meta.url)),
      },
    },
    define: {
      'import.meta.env.VITE_CONVEX_URL': JSON.stringify(
        env.EXPO_PUBLIC_CONVEX_URL || env.VITE_CONVEX_URL || '',
      ),
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
  };
});
