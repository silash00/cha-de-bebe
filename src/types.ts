export type Status = 'pendente' | 'sim' | 'nao';

export interface Pessoa {
  nome: string;
  status: Status;
}

export interface Convite {
  saudacao: string;
  pessoas: Pessoa[];
  fralda: string | null;
  recado: string | null;
  respondidoEm: string | null;
}

export type RespostaGet =
  | {
      ok: true;
      saudacao: string;
      pessoas: Pessoa[];
      fralda: string | null;
      recado: string | null;
      respondido_em: string | null;
    }
  | { ok: false; erro: string };

export type RespostaPost = { ok: true } | { ok: false; erro: string };
