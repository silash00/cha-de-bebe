import { useEffect, useMemo } from 'react';
import { EVENTO } from '../config';
import { NOME_ICS, textoIcs, urlGoogleAgenda } from '../calendario';
import Icone from './Icone';

/**
 * Os dados do evento. Dentro do papel não há cartão: a seção se delimita por
 * filete e por espaço, como num convite impresso.
 */
export default function InfoEvento() {
  // O .ics nasce aqui, do EVENTO, e não de um arquivo em public/: assim existe
  // um só lugar com a data. O Blob vira URL uma vez por montagem e é revogado
  // na saída — sem isso, cada troca de tela deixaria um arquivo pendurado na
  // memória da aba.
  const urlIcs = useMemo(
    () => URL.createObjectURL(new Blob([textoIcs()], { type: 'text/calendar;charset=utf-8' })),
    []
  );
  useEffect(() => () => URL.revokeObjectURL(urlIcs), [urlIcs]);

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
          {/* Dois caminhos porque são dois mundos: quem usa Google Agenda ganha
              o formulário pronto; quem usa iPhone ou Outlook ganha o arquivo,
              que o aparelho abre no calendário nativo. Detectar a plataforma
              pelo user-agent erraria caso demais e ainda esconderia a escolha. */}
          <dd className="mt-5">
            <span className="rotulo block">Adicionar ao calendário</span>
            <span className="mt-2 flex items-center justify-center gap-3">
              <a
                href={urlGoogleAgenda()}
                target="_blank"
                rel="noreferrer"
                className="elo text-[0.8125rem] uppercase"
                style={{ letterSpacing: '0.14em' }}
              >
                Google Agenda
              </a>
              <span aria-hidden="true" className="text-sage-deep/50">
                ·
              </span>
              {/* Sem `target`: o arquivo não é uma página a visitar. */}
              <a
                href={urlIcs}
                download={NOME_ICS}
                className="elo text-[0.8125rem] uppercase"
                style={{ letterSpacing: '0.14em' }}
              >
                Apple / Outlook
              </a>
            </span>
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
