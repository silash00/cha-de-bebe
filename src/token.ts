export interface TokenLido {
  token: string | null;
  preview: boolean;
}

/** Lê o token do convite e o modo preview da querystring do próprio site. */
export function lerToken(search: string): TokenLido {
  const params = new URLSearchParams(search);
  const bruto = (params.get('c') ?? '').trim();
  return {
    token: bruto === '' ? null : bruto,
    preview: params.get('preview') === '1',
  };
}
