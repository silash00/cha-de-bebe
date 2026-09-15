import { describe, it, expect } from 'vitest';
import { lerToken } from './token';

describe('lerToken', () => {
  it('extrai o token de ?c=', () => {
    expect(lerToken('?c=k3n8fq')).toEqual({ token: 'k3n8fq', preview: false });
  });

  it('devolve token nulo quando nao ha querystring', () => {
    expect(lerToken('')).toEqual({ token: null, preview: false });
  });

  it('devolve token nulo quando c esta vazio', () => {
    expect(lerToken('?c=')).toEqual({ token: null, preview: false });
  });

  it('remove espacos em volta do token', () => {
    expect(lerToken('?c=%20k3n8fq%20').token).toBe('k3n8fq');
  });

  it('reconhece preview=1', () => {
    expect(lerToken('?c=k3n8fq&preview=1')).toEqual({ token: 'k3n8fq', preview: true });
  });

  it('ignora preview com outro valor', () => {
    expect(lerToken('?c=k3n8fq&preview=0').preview).toBe(false);
  });

  it('ignora outros parametros', () => {
    expect(lerToken('?utm_source=whatsapp&c=k3n8fq').token).toBe('k3n8fq');
  });
});
