/**
 * Configuração do Supabase, vinda de variáveis de build.
 *
 * O prefixo VITE_ é obrigatório: só variáveis com ele são expostas ao código
 * do cliente pelo Vite.
 *
 * Sobre a publishable key: ela NÃO é segredo e não há como torná-la um. O Vite
 * a compila para dentro do bundle, que todo visitante baixa — qualquer um lê no
 * DevTools. Mantê-la fora do repositório é higiene, não proteção. O que
 * realmente protege é o banco: as tabelas não têm grant para `anon`, e as duas
 * funções RPC exigem um token de convite válido.
 *
 * A secret key (`sb_secret_...`) NUNCA entra aqui nem em variável VITE_.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const TIMEOUT_MS = 15000;

/** Esperas entre tentativas, em ms. O comprimento define o total de tentativas. */
export const BACKOFF_MS = [0, 600, 1800];

export const EVENTO = {
  bebe: 'Yuri',
  data: 'Segunda-feira, 12 de outubro de 2026',
  // Quebrada em duas para o cartão editorial: a data em Bodoni grande, o
  // resto em corpo pequeno logo abaixo.
  dataCurta: '12 de outubro de 2026',
  diaSemana: 'Segunda-feira (feriado)',
  hora: '12h',
  local: 'Espaço Rizo',
  endereco: 'Rua Alvilândia, 231 — Rochdale, Osasco/SP',
  referencia: 'em cima da UBS',
  mapa: 'https://maps.app.goo.gl/xtqXCiMMBhBNzEB68',
  // Convite de calendário servido de public/. É um arquivo estático, e não um
  // Blob montado no navegador, porque o Safari do iOS é irregular com
  // `blob:` + download — e o iPhone é o aparelho da maioria dos convidados.
  // O preço é repetir aqui o que está lá; src/calendario.test.ts costura os dois.
  calendario: 'cha-do-yuri.ics',
  whatsappAnfitriao: 'https://wa.me/5511982112619',
} as const;
