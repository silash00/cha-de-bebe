import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');

  // Falha o BUILD em vez de publicar um site que não fala com o backend.
  // Um erro aqui aparece no CI; um site mudo só aparece para o convidado.
  if (command === 'build') {
    const faltando = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'].filter(
      (k) => !env[k]
    );
    if (faltando.length > 0) {
      throw new Error(
        `Variáveis de build ausentes: ${faltando.join(', ')}.\n` +
          'Local: crie um .env.local (veja .env.example).\n' +
          'CI: cadastre os secrets em Settings > Secrets and variables > Actions.'
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    base: '/',
  };
});
