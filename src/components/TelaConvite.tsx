import { useState } from 'react';
import type { Convite, Pessoa, Status } from '../types';
import { EVENTO } from '../config';
import InfoEvento from './InfoEvento';
import ListaPessoas from './ListaPessoas';

export type AvisoEnvio = null | 'falha' | 'convite_mudou';

interface Props {
  convite: Convite;
  enviando: boolean;
  aviso: AvisoEnvio;
  onConfirmar: (pessoas: Pessoa[], recado: string) => void;
}

export default function TelaConvite({ convite, enviando, aviso, onConfirmar }: Props) {
  const [pessoas, setPessoas] = useState<Pessoa[]>(convite.pessoas);
  const [recado, setRecado] = useState(convite.recado ?? '');

  function alterar(indice: number, status: Status) {
    setPessoas((atual) => atual.map((p, i) => (i === indice ? { ...p, status } : p)));
  }

  const nenhumRespondido = pessoas.every((p) => p.status === 'pendente');

  return (
    <main className="mx-auto max-w-md space-y-8 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-5xl" aria-hidden="true">
          👶
        </p>
        <h1 className="text-2xl text-stone-800">Olá, {convite.saudacao}!</h1>
        <p className="text-stone-600">Você foi convidado para o nosso chá de bebê.</p>
      </header>

      <InfoEvento />

      {convite.fralda && (
        <section className="rounded-lg bg-stone-100 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Sugestão de presente
          </p>
          <p className="text-stone-800">Fraldas tamanho {convite.fralda}</p>
          <p className="mt-1 text-sm text-stone-600">
            Separamos os tamanhos entre os convidados para não faltar nem sobrar.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-stone-800">Quem vem?</h2>
        <ListaPessoas pessoas={pessoas} onChange={alterar} />
      </section>

      <section className="space-y-2">
        <label htmlFor="recado" className="block text-sm text-stone-600">
          Quer deixar um recado? (opcional)
        </label>
        <textarea
          id="recado"
          value={recado}
          onChange={(e) => setRecado(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-stone-200 bg-white p-3 text-stone-800"
        />
      </section>

      {aviso === 'convite_mudou' && (
        <div role="alert" className="rounded-lg border border-stone-300 bg-white p-4">
          <p className="text-stone-800">A lista deste convite foi atualizada.</p>
          <p className="mt-1 text-sm text-stone-600">
            Recarregamos os nomes acima. Confira e confirme de novo, por favor.
          </p>
        </div>
      )}

      {aviso === 'falha' && (
        <div role="alert" className="rounded-lg border border-stone-300 bg-white p-4">
          <p className="text-stone-800">Não conseguimos registrar sua resposta.</p>
          <p className="mt-1 text-sm text-stone-600">
            Suas escolhas continuam aqui — é só tentar de novo. Se insistir em falhar,{' '}
            <a href={EVENTO.whatsappAnfitriao} className="underline underline-offset-2">
              nos chame no WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={enviando || nenhumRespondido}
        onClick={() => onConfirmar(pessoas, recado)}
        className="min-h-12 w-full rounded-lg bg-stone-800 text-white disabled:opacity-40"
      >
        {enviando ? 'Enviando…' : 'Confirmar'}
      </button>

      {nenhumRespondido && (
        <p className="-mt-6 text-center text-sm text-stone-500">
          Marque quem vai antes de confirmar.
        </p>
      )}
    </main>
  );
}
