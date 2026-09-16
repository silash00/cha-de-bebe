import * as m from 'motion/react-m';
import { EVENTO } from '../config';
import { Estrela, LAYOUT_NOME } from './Ornamento';

/**
 * Sem JavaScript de animação e sem imagem: só CSS e um SVG inline, para pintar
 * no primeiro frame. Carregar uma biblioteca para anunciar que algo está
 * carregando deixaria a tela branca justamente durante a espera.
 */
export default function TelaCarregando() {
  return (
    <m.div
      className="flex min-h-svh flex-col items-center justify-center gap-8 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <p
        className="anima-surgir text-[0.6875rem] font-medium uppercase text-sage-deep"
        style={{ letterSpacing: '0.34em', textIndent: '0.34em' }}
      >
        Chá de bebê
      </p>

      <m.p
        layoutId={LAYOUT_NOME}
        className="display relevo text-[3rem] leading-none font-black text-tinta"
      >
        {EVENTO.bebe}
      </m.p>

      <div className="flex gap-3" aria-hidden="true">
        {/* O atraso escalonado faz as três estrelas pulsarem em onda. */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="anima-pulsar inline-flex"
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <Estrela className="size-3 text-sage" />
          </span>
        ))}
      </div>

      <p className="sr-only" role="status">
        Abrindo seu convite…
      </p>
    </m.div>
  );
}
