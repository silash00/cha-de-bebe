/**
 * URL /exec do Apps Script. Imutável depois do disparo dos convites.
 *
 * O parâmetro enviado é `token`, não `c`: o frontend do script.google.com
 * rejeita `?c=` com HTTP 400 antes de a requisição chegar ao script. O link
 * público do convidado continua usando `?c=`, que é do nosso domínio.
 */
export const API_URL =
  'https://script.google.com/macros/s/AKfycbxRd2JaGDAcrvbP9laQaEcg06wkCtzUMdQnoBs-461LKI7g0hUPhy47lMky31Thi-cbyQ/exec';

/** Apps Script tem cold start de alguns segundos após ociosidade. */
export const TIMEOUT_MS = 15000;

export const EVENTO = {
  data: 'Segunda-feira, 12 de outubro de 2026',
  hora: '12h',
  local: 'Espaço Rizo',
  endereco: 'Rua Alvilândia, 231 — Rochdale, Osasco/SP',
  referencia: 'em cima da UBS',
  mapa: 'https://maps.app.goo.gl/xtqXCiMMBhBNzEB68',
  whatsappAnfitriao: 'https://wa.me/5511982112619',
} as const;
