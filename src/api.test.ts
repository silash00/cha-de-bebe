import { describe, it, expect, vi, afterEach } from 'vitest';
import { buscarConvite, confirmar } from './api';

// Sem isso cada teste de falha esperaria 2,4s de backoff real.
vi.mock('./config', async (original) => ({
  ...(await original<typeof import('./config')>()),
  BACKOFF_MS: [0, 0, 0],
}));

function mockFetch(payload: unknown, ok = true) {
  const spy = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal('fetch', spy);
  return spy;
}

afterEach(() => vi.unstubAllGlobals());

describe('buscarConvite', () => {
  it('mapeia a resposta de sucesso para o formato interno', async () => {
    mockFetch({
      ok: true,
      saudacao: 'Fulano e Ciclana',
      pessoas: [{ nome: 'Fulano', status: 'sim' }],
      fralda: 'P',
      recado: null,
      respondido_em: '2026-09-19 21:06',
    });

    const r = await buscarConvite('k3n8fq', false);

    expect(r).toEqual({
      tipo: 'ok',
      convite: {
        saudacao: 'Fulano e Ciclana',
        pessoas: [{ nome: 'Fulano', status: 'sim' }],
        fralda: 'P',
        recado: null,
        respondidoEm: '2026-09-19 21:06',
      },
    });
  });

  it('devolve nao_encontrado quando o backend nao acha o token', async () => {
    mockFetch({ ok: false, erro: 'nao_encontrado' });
    expect(await buscarConvite('xxx', false)).toEqual({ tipo: 'nao_encontrado' });
  });

  it('devolve erro quando o backend falha internamente', async () => {
    mockFetch({ ok: false, erro: 'interno' });
    expect(await buscarConvite('k3n8fq', false)).toEqual({ tipo: 'erro' });
  });

  it('devolve erro quando a rede falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await buscarConvite('k3n8fq', false)).toEqual({ tipo: 'erro' });
  });

  it('chama get_convite passando token e preview no corpo', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', false);
    expect(String(spy.mock.calls[0][0])).toContain('/rest/v1/rpc/get_convite');
    expect(JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)).toEqual({
      p_token: 'k3n8fq',
      p_preview: false,
    });
  });

  it('nao consulta tabela direto — so RPC', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', false);
    const url = String(spy.mock.calls[0][0]);
    expect(url).toContain('/rest/v1/rpc/');
    expect(url).not.toMatch(/\/rest\/v1\/(convites|pessoas)/);
  });

  it('passa p_preview true quando preview e true', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', true);
    expect(JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string).p_preview).toBe(true);
  });

  it('passa p_preview false quando preview e false', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', false);
    expect(JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string).p_preview).toBe(false);
  });

  it('devolve erro quando a resposta chega sem o array de pessoas', async () => {
    mockFetch({
      ok: true, saudacao: 'x', pessoas: null, fralda: null, recado: null, respondido_em: null,
    });
    expect(await buscarConvite('k3n8fq', false)).toEqual({ tipo: 'erro' });
  });

  it('devolve erro quando o corpo nao e JSON (Apps Script devolve HTML)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON');
        },
      })
    );
    expect(await buscarConvite('k3n8fq', false)).toEqual({ tipo: 'erro' });
  });

  it('confia no campo ok do corpo, nao no status HTTP', async () => {
    // Decisao deliberada: o Apps Script responde 200 com {ok:false} em erro de
    // negocio, e ja devolveu corpo JSON valido junto de status nao-2xx. Nao
    // adicione `if (!resp.ok) throw` — este teste existe para travar isso.
    mockFetch(
      { ok: true, saudacao: 'Fulano', pessoas: [], fralda: null, recado: null, respondido_em: null },
      false
    );
    const r = await buscarConvite('k3n8fq', false);
    expect(r.tipo).toBe('ok');
  });
});

describe('confirmar', () => {
  it('chama a funcao confirmar com os argumentos nomeados do RPC', async () => {
    const spy = mockFetch({ ok: true });

    await confirmar('k3n8fq', [{ nome: 'Fulano', status: 'sim' }], 'oi');

    expect(String(spy.mock.calls[0][0])).toContain('/rest/v1/rpc/confirmar');
    const init = spy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(init.method).toBe('POST');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.apikey).toBeTruthy();
    expect(headers.Authorization).toContain('Bearer ');
    expect(JSON.parse(init.body as string)).toEqual({
      p_token: 'k3n8fq',
      p_pessoas: [{ nome: 'Fulano', status: 'sim' }],
      p_recado: 'oi',
    });
  });

  it('devolve ok quando o backend confirma', async () => {
    mockFetch({ ok: true });
    expect(await confirmar('k3n8fq', [], '')).toEqual({ tipo: 'ok' });
  });

  it('devolve erro quando o backend recusa', async () => {
    mockFetch({ ok: false, erro: 'nao_encontrado' });
    expect(await confirmar('k3n8fq', [], '')).toEqual({ tipo: 'erro' });
  });

  it('devolve erro quando a rede falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await confirmar('k3n8fq', [], '')).toEqual({ tipo: 'erro' });
  });

  it('distingue convite_mudou de erro generico', async () => {
    mockFetch({ ok: false, erro: 'convite_mudou' });
    expect(await confirmar('k3n8fq', [], '')).toEqual({ tipo: 'convite_mudou' });
  });

  it('devolve erro quando o corpo do POST nao e JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
      })
    );
    expect(await confirmar('k3n8fq', [], '')).toEqual({ tipo: 'erro' });
  });
});

describe('retry', () => {
  it('repete falha de rede e devolve o sucesso da tentativa seguinte', async () => {
    const spy = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true, saudacao: 'Fulano', pessoas: [], fralda: null,
          recado: null, respondido_em: null,
        }),
      });
    vi.stubGlobal('fetch', spy);

    const r = await buscarConvite('k3n8fq', false);

    expect(r.tipo).toBe('ok');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('desiste depois de esgotar as tentativas', async () => {
    const spy = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', spy);

    expect(await buscarConvite('k3n8fq', false)).toEqual({ tipo: 'erro' });
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('NAO repete resposta de negocio: nao_encontrado e final', async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, erro: 'nao_encontrado' }),
    });
    vi.stubGlobal('fetch', spy);

    expect(await buscarConvite('xxx', false)).toEqual({ tipo: 'nao_encontrado' });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('NAO repete convite_mudou: insistir gravaria errado', async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, erro: 'convite_mudou' }),
    });
    vi.stubGlobal('fetch', spy);

    expect(await confirmar('k3n8fq', [], '')).toEqual({ tipo: 'convite_mudou' });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
