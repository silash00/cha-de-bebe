/**
 * Supabase. A publishable key (`sb_publishable_...`, o que antes se chamava
 * anon key) é pública por natureza — vai no bundle JS porque o navegador
 * precisa dela. Isso é previsto, não vazamento: ela resolve para o papel
 * `anon` do Postgres, que não tem grant em tabela nenhuma. As duas funções
 * RPC são a única superfície exposta.
 *
 * A secret key (`sb_secret_...`, antiga `service_role`) NUNCA entra aqui:
 * ela ignora RLS e permissões.
 *
 * SUPABASE_URL é a raiz do projeto, SEM /rest/v1 — o api.ts monta o caminho.
 */
export const SUPABASE_URL = 'https://pemswwaebhidbwjaqjub.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xZVxG7CdO5D_A9P9kcu3Fw_7CGEB8bp';

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
