import { EVENTO } from '../config';
import * as m from 'motion/react-m';
import Cabecalho from './Cabecalho';
import Divisor, { PAPEL, SECAO } from './Ornamento';
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
      variants={PAPEL}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <Cabecalho ilustracao="urso-lua" apoio="Você está convidado para o nosso chá de bebê." />

      <m.div variants={SECAO} className="mt-10">
        <Divisor />
      </m.div>

      <m.div variants={SECAO} className="mt-10">
        <InfoEvento />
      </m.div>

      <m.div variants={SECAO} aria-hidden="true" className="filete mt-10" />

      <m.section variants={SECAO} className="mt-10 text-center">
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
      </m.section>

      <m.div variants={SECAO} className="mt-10">
        <Divisor />
      </m.div>
    </m.main>
  );
}
