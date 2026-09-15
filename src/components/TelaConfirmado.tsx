import type { Convite } from '../types';
import InfoEvento from './InfoEvento';

interface Props {
  convite: Convite;
  onEditar: () => void;
}

export default function TelaConfirmado({ convite, onEditar }: Props) {
  const vao = convite.pessoas.filter((p) => p.status === 'sim');
  const naoVao = convite.pessoas.filter((p) => p.status === 'nao');
  const ninguemVai = vao.length === 0;

  return (
    <main className="mx-auto max-w-md space-y-8 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-5xl" aria-hidden="true">
          {ninguemVai ? '💛' : '🎉'}
        </p>
        <h1 className="text-2xl text-stone-800">
          {ninguemVai ? 'Que pena!' : 'Presença confirmada!'}
        </h1>
        <p className="text-stone-600">
          {ninguemVai
            ? 'Vamos sentir sua falta. Obrigado por avisar.'
            : 'Já anotamos. Estamos ansiosos para ver você!'}
        </p>
      </header>

      <section className="space-y-1 rounded-lg bg-stone-100 p-4 text-stone-700">
        {vao.length > 0 && (
          <p>
            <strong>{vao.length === 1 ? 'Vai:' : 'Vão:'}</strong>{' '}
            {vao.map((p) => p.nome).join(', ')}
          </p>
        )}
        {naoVao.length > 0 && (
          <p>
            <strong>{naoVao.length === 1 ? 'Não vai:' : 'Não vão:'}</strong>{' '}
            {naoVao.map((p) => p.nome).join(', ')}
          </p>
        )}
        {convite.fralda && !ninguemVai && (
          <p>
            <strong>Presente combinado:</strong> fraldas tamanho {convite.fralda}
          </p>
        )}
      </section>

      {!ninguemVai && <InfoEvento />}

      <button
        type="button"
        onClick={onEditar}
        className="min-h-11 w-full rounded-lg border border-stone-300 text-stone-700"
      >
        Alterar minha resposta
      </button>
    </main>
  );
}
