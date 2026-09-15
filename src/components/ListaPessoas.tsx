import type { Pessoa, Status } from '../types';

interface Props {
  pessoas: Pessoa[];
  onChange: (indice: number, status: Status) => void;
}

const BOTAO_BASE =
  'flex min-h-11 min-w-20 items-center justify-center gap-1 rounded-lg px-4 text-sm ' +
  'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800';

export default function ListaPessoas({ pessoas, onChange }: Props) {
  return (
    <ul className="space-y-2">
      {pessoas.map((p, i) => {
        const vai = p.status === 'sim';
        const naoVai = p.status === 'nao';
        return (
          // A chave é o índice porque a POSIÇÃO é a identidade da pessoa neste
          // convite: o backend casa por posição, e o nome não serve de id —
          // dois "Carlos" na mesma família são normais.
          <li
            key={i}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3"
          >
            <span className="text-stone-800">{p.nome}</span>
            <div
              role="radiogroup"
              aria-label={`${p.nome} vai ao chá de bebê?`}
              className="flex shrink-0 gap-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={vai}
                onClick={() => onChange(i, 'sim')}
                className={
                  BOTAO_BASE +
                  (vai
                    ? ' bg-stone-800 font-medium text-white'
                    : ' bg-stone-100 text-stone-700 hover:bg-stone-200')
                }
              >
                {vai && <span aria-hidden="true">✓</span>}
                Vou
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={naoVai}
                onClick={() => onChange(i, 'nao')}
                className={
                  BOTAO_BASE +
                  (naoVai
                    ? ' bg-stone-800 font-medium text-white'
                    : ' bg-stone-100 text-stone-700 hover:bg-stone-200')
                }
              >
                {naoVai && <span aria-hidden="true">✓</span>}
                Não vou
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
