/**
 * Supabase. A anon key é pública por natureza — vai no bundle JS porque o
 * navegador precisa dela. Isso é previsto, não vazamento: as tabelas não têm
 * grant para `anon`, e as duas funções RPC são a única superfície exposta.
 *
 * A chave `service_role` NUNCA entra aqui.
 */
export const SUPABASE_URL = 'COLE_AQUI_A_PROJECT_URL';
export const SUPABASE_ANON_KEY = 'COLE_AQUI_A_ANON_KEY';

export const TIMEOUT_MS = 15000;

/** Esperas entre tentativas, em ms. O comprimento define o total de tentativas. */
export const BACKOFF_MS = [0, 600, 1800];

export const EVENTO = {
  data: 'Segunda-feira, 12 de outubro de 2026',
  hora: '12h',
  local: 'Espaço Rizo',
  endereco: 'Rua Alvilândia, 231 — Rochdale, Osasco/SP',
  referencia: 'em cima da UBS',
  mapa: 'https://maps.app.goo.gl/xtqXCiMMBhBNzEB68',
  whatsappAnfitriao: 'https://wa.me/5511982112619',
} as const;
