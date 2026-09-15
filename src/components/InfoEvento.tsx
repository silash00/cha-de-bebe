import { EVENTO } from '../config';

export default function InfoEvento() {
  return (
    <section className="space-y-3 text-stone-700">
      <div>
        <p className="text-xs uppercase tracking-wide text-stone-400">Quando</p>
        <p>
          {EVENTO.data}, às {EVENTO.hora}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-stone-400">Onde</p>
        <p>{EVENTO.local}</p>
        <p className="text-sm text-stone-500">{EVENTO.endereco}</p>
        <p className="text-sm text-stone-500">({EVENTO.referencia})</p>
        <a
          href={EVENTO.mapa}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm underline underline-offset-2"
        >
          Ver no mapa
        </a>
      </div>
    </section>
  );
}
