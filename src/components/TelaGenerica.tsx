import { EVENTO } from '../config';
import * as m from 'motion/react-m';
import Cabecalho from './Cabecalho';
import Divisor from './Ornamento';
import InfoEvento from './InfoEvento';

interface Props {
  motivo: 'sem-token' | 'invalido';
}

/**
 * Serve dois casos que não são erro do convidado: abriu o domínio direto, ou o
 * link chegou sem a querystring (encaminhamento no WhatsApp costuma cortar).
 * Nos dois, a pessoa recebe a informação do evento normalmente — por isso a
 * tela é o convite inteiro, não um aviso.
 */
export default function TelaGenerica({ motivo }: Props) {
  return (
    <m.main
      className="papel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Cabecalho ilustracao="urso-lua" apoio="Você está convidado para o nosso chá de bebê." />

      <Divisor className="mt-10" />

      <div className="mt-10">
        <InfoEvento />
      </div>

      <div aria-hidden="true" className="filete mt-10" />

      <section className="mt-10 text-center">
        <p className="rotulo">Confirmar presença</p>
        {motivo === 'invalido' && (
          <p className="display mt-2 text-[1.25rem] font-semibold text-tinta">
            Não reconhecemos esse link.
          </p>
        )}
        <p className="mt-2 text-sm text-tinta-suave">
          Abra o link que enviamos para você no WhatsApp — ele é pessoal e já vem com o
          nome de quem foi convidado.
        </p>
        <p className="mt-4">
          <a
            href={EVENTO.whatsappAnfitriao}
            className="elo text-[0.8125rem] uppercase"
            style={{ letterSpacing: '0.14em' }}
          >
            Falar com a gente
          </a>
        </p>
      </section>

      <Divisor className="mt-10" />
    </m.main>
  );
}
