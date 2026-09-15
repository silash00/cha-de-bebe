import { BACKOFF_MS, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, TIMEOUT_MS } from './config';
import type { Convite, Pessoa, RespostaGet, RespostaPost } from './types';

export type ResultadoBusca =
  | { tipo: 'ok'; convite: Convite }
  | { tipo: 'nao_encontrado' }
  | { tipo: 'erro' };

/**
 * 'convite_mudou': a lista de pessoas no banco divergiu do que o convidado tem
 * na tela. Nada foi gravado — a tela precisa recarregar antes de tentar de novo.
 */
export type ResultadoEnvio =
  | { tipo: 'ok' }
  | { tipo: 'convite_mudou' }
  | { tipo: 'erro' };

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Uma chamada RPC. Lança em rede, timeout ou corpo não-JSON. */
async function chamar(fn: string, body: Record<string, unknown>): Promise<unknown> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await resp.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Chama com backoff. Só repete o que é transitório: falha de rede, timeout e
 * corpo malformado. Uma resposta de negócio — inclusive `ok:false` — é final.
 */
async function comRetry(fn: string, body: Record<string, unknown>): Promise<unknown> {
  let ultimo: unknown;
  for (let i = 0; i < BACKOFF_MS.length; i++) {
    if (BACKOFF_MS[i] > 0) await esperar(BACKOFF_MS[i]);
    try {
      return await chamar(fn, body);
    } catch (e) {
      ultimo = e;
    }
  }
  throw ultimo;
}

export async function buscarConvite(token: string, preview: boolean): Promise<ResultadoBusca> {
  try {
    const data = (await comRetry('get_convite', {
      p_token: token,
      p_preview: preview,
    })) as RespostaGet;

    if (!data || data.ok !== true) {
      const erro = data && 'erro' in data ? data.erro : '';
      return erro === 'nao_encontrado' ? { tipo: 'nao_encontrado' } : { tipo: 'erro' };
    }

    // O banco sempre manda array, mas uma resposta malformada passaria como
    // convite válido e estouraria depois, num .map() de componente.
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
    // Retry é seguro na escrita porque `confirmar` é idempotente: reenviar o
    // mesmo corpo produz o mesmo estado.
    const data = (await comRetry('confirmar', {
      p_token: token,
      p_pessoas: pessoas,
      p_recado: recado,
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
