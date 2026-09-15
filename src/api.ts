import { API_URL, TIMEOUT_MS } from './config';
import type { Convite, Pessoa, RespostaGet, RespostaPost } from './types';

export type ResultadoBusca =
  | { tipo: 'ok'; convite: Convite }
  | { tipo: 'nao_encontrado' }
  | { tipo: 'erro' };

/**
 * 'convite_mudou': a lista de pessoas na planilha divergiu do que o convidado
 * tem na tela (linha inserida, removida, reordenada ou nome corrigido). Nada
 * foi gravado — a tela precisa recarregar o convite antes de tentar de novo.
 */
export type ResultadoEnvio =
  | { tipo: 'ok' }
  | { tipo: 'convite_mudou' }
  | { tipo: 'erro' };

async function comTimeout(url: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    return await resp.json();
  } finally {
    clearTimeout(t);
  }
}

export async function buscarConvite(token: string, preview: boolean): Promise<ResultadoBusca> {
  const url = new URL(API_URL);
  // 'token', nunca 'c': o script.google.com rejeita ?c= com HTTP 400.
  url.searchParams.set('token', token);
  if (preview) url.searchParams.set('preview', '1');

  try {
    const data = (await comTimeout(url.toString())) as RespostaGet;

    if (!data || data.ok !== true) {
      const erro = data && 'erro' in data ? data.erro : '';
      return erro === 'nao_encontrado' ? { tipo: 'nao_encontrado' } : { tipo: 'erro' };
    }

    // O backend sempre manda um array, mas a resposta ja chegou malformada em
    // falha intermitente do Apps Script. Sem esta guarda o convite passa como
    // valido e o estouro acontece la na frente, num .map() de componente.
    if (!Array.isArray(data.pessoas)) return { tipo: 'erro' };

    return {
      tipo: 'ok',
      convite: {
        saudacao: data.saudacao,
        pessoas: data.pessoas,
        fralda: data.fralda,
        recado: data.recado,
        respondidoEm: data.respondido_em,
      },
    };
  } catch {
    return { tipo: 'erro' };
  }
}

export async function confirmar(
  token: string,
  pessoas: Pessoa[],
  recado: string
): Promise<ResultadoEnvio> {
  try {
    const data = (await comTimeout(API_URL, {
      method: 'POST',
      // text/plain evita o preflight de CORS, que o Apps Script nao responde.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ token, pessoas, recado }),
    })) as RespostaPost;

    if (data && data.ok === true) return { tipo: 'ok' };
    if (data && 'erro' in data && data.erro === 'convite_mudou') {
      return { tipo: 'convite_mudou' };
    }
    return { tipo: 'erro' };
  } catch {
    return { tipo: 'erro' };
  }
}
