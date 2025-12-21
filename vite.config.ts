import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.LOCAL_API_BASE': JSON.stringify(env.LOCAL_API_BASE),
        'process.env.LOCAL_MODEL': JSON.stringify(env.LOCAL_MODEL),
        'process.env.LOCAL_CHAT_MODEL': JSON.stringify(env.LOCAL_CHAT_MODEL),
        'process.env.LOCAL_EMBED_MODEL': JSON.stringify(env.LOCAL_EMBED_MODEL),
        'process.env.FORCE_LOCAL_RAG': JSON.stringify(env.FORCE_LOCAL_RAG)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
