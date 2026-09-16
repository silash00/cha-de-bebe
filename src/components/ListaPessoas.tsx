import type { Pessoa, Status } from '../types';

interface Props {
  pessoas: Pessoa[];
  onChange: (indice: number, status: Status) => void;
}

export default function ListaPessoas({ pessoas, onChange }: Props) {
  return (
    <ul className="divide-y divide-sage/40 border-y border-sage/40">
      {pessoas.map((p, i) => {
        const vai = p.status === 'sim';
        const naoVai = p.status === 'nao';
        return (
          // A chave é o índice porque a POSIÇÃO é a identidade da pessoa neste
          // convite: o backend casa por posição, e o nome não serve de id —
          // dois "Carlos" na mesma família são normais.
          <li key={i} className="py-5">
            <p className="display text-center text-[1.25rem] font-semibold text-tinta">
              {p.nome}
            </p>
            <div
              role="radiogroup"
              aria-label={`${p.nome} vai ao chá de bebê?`}
              className="mt-3 flex gap-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={vai}
                onClick={() => onChange(i, 'sim')}
                className={'botao flex-1 ' + (vai ? 'botao-sim' : 'botao-contorno')}
              >
                Vou
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={naoVai}
                onClick={() => onChange(i, 'nao')}
                className={'botao flex-1 ' + (naoVai ? 'botao-nao' : 'botao-contorno')}
              >
                Não vou
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
