import type { Pessoa, Status } from '../types';

interface Props {
  pessoas: Pessoa[];
  onChange: (indice: number, status: Status) => void;
}

export default function ListaPessoas({ pessoas, onChange }: Props) {
  return (
    <ul className="space-y-2">
      {pessoas.map((p, i) => (
        <li
          key={p.nome}
          className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 p-3"
        >
          <span className="text-stone-800">{p.nome}</span>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-pressed={p.status === 'sim'}
              onClick={() => onChange(i, 'sim')}
              className={
                'rounded-md px-3 py-1.5 text-sm ' +
                (p.status === 'sim' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600')
              }
            >
              Vou
            </button>
            <button
              type="button"
              aria-pressed={p.status === 'nao'}
              onClick={() => onChange(i, 'nao')}
              className={
                'rounded-md px-3 py-1.5 text-sm ' +
                (p.status === 'nao' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600')
              }
            >
              Não vou
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
