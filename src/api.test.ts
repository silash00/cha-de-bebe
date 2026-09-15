import { describe, it, expect, vi, afterEach } from 'vitest';
import { buscarConvite, confirmar } from './api';

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

  it('envia o token no parametro token, nunca em c', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', false);
    const url = String(spy.mock.calls[0][0]);
    expect(url).toContain('token=k3n8fq');
    expect(url).not.toMatch(/[?&]c=/);
  });

  it('passa preview=1 na URL quando preview e true', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', true);
    expect(String(spy.mock.calls[0][0])).toContain('preview=1');
  });

  it('nao passa preview na URL quando preview e false', async () => {
    const spy = mockFetch({
      ok: true, saudacao: 'x', pessoas: [], fralda: null, recado: null, respondido_em: null,
    });
    await buscarConvite('k3n8fq', false);
    expect(String(spy.mock.calls[0][0])).not.toContain('preview');
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
  it('envia o corpo como text/plain para nao disparar preflight', async () => {
    const spy = mockFetch({ ok: true });

    await confirmar('k3n8fq', [{ nome: 'Fulano', status: 'sim' }], 'oi');

    const init = spy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('text/plain');
    expect(JSON.parse(init.body as string)).toEqual({
      token: 'k3n8fq',
      pessoas: [{ nome: 'Fulano', status: 'sim' }],
      recado: 'oi',
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
