import { API_URL, TIMEOUT_MS } from './config';
import type { Convite, Pessoa, RespostaGet, RespostaPost } from './types';

export type ResultadoBusca =
  | { tipo: 'ok'; convite: Convite }
  | { tipo: 'nao_encontrado' }
  | { tipo: 'erro' };

export type ResultadoEnvio = { tipo: 'ok' } | { tipo: 'erro' };

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

    return data && data.ok === true ? { tipo: 'ok' } : { tipo: 'erro' };
  } catch {
    return { tipo: 'erro' };
  }
}
