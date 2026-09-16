import { EVENTO } from '../config';
import Icone from './Icone';

/**
 * Os dados do evento. Dentro do papel não há cartão: a seção se delimita por
 * filete e por espaço, como num convite impresso.
 */
export default function InfoEvento() {
  return (
    <section>
      <dl className="space-y-7 text-center">
        <div>
          <dt className="rotulo">
            <Icone nome="calendario" atraso={0.2} />
            Quando
          </dt>
          <dd className="display mt-2 text-[1.375rem] leading-snug font-semibold text-tinta">
            {EVENTO.dataCurta}
          </dd>
          <dd className="mt-1 text-sm text-tinta-suave">
            {EVENTO.diaSemana}, a partir das {EVENTO.hora}
          </dd>
        </div>

        <div aria-hidden="true" className="filete mx-auto w-10" />

        <div>
          <dt className="rotulo">
            <Icone nome="pin" atraso={0.32} />
            Onde
          </dt>
          <dd className="display mt-2 text-[1.375rem] leading-snug font-semibold text-tinta">
            {EVENTO.local}
          </dd>
          <dd className="mt-1 text-sm text-tinta-suave">{EVENTO.endereco}</dd>
          <dd className="text-sm text-tinta-suave">({EVENTO.referencia})</dd>
          <dd className="mt-4">
            <a
              href={EVENTO.mapa}
              target="_blank"
              rel="noreferrer"
              className="elo text-[0.8125rem] uppercase"
              style={{ letterSpacing: '0.14em' }}
            >
              Ver no mapa
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
