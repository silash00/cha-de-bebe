import * as m from 'motion/react-m';
import { EVENTO } from '../config';
import Divisor, { LAYOUT_NOME } from './Ornamento';

interface Props {
  /** Ilustração sob o nome. Ausente nas telas que não são o convite em si. */
  ilustracao?: 'urso-lua' | 'urso-baloes' | null;
  /** Texto de abertura em Bodoni itálico — a saudação do convite. */
  saudacao?: string;
  /** Linha de apoio abaixo da saudação. */
  apoio?: string;
  /** A ação que a tela pede. Ganha destaque próprio, abaixo do apoio. */
  chamada?: string;
}

const ILUSTRACOES = {
  'urso-lua': { src: '/ilustracoes/urso-lua.webp', largura: 506, altura: 549, alt: '' },
  'urso-baloes': {
    src: '/ilustracoes/urso-baloes.webp',
    largura: 479,
    altura: 687,
    alt: '',
  },
} as const;

/**
 * Topo comum a todas as telas. O nome do bebê é o herói tipográfico: tudo em
 * volta — as caixas altas espaçadas, os divisores, o ar — existe para emoldurá-lo.
 */
export default function Cabecalho({ ilustracao = null, saudacao, apoio, chamada }: Props) {
  const arte = ilustracao ? ILUSTRACOES[ilustracao] : null;

  return (
    <header className="flex flex-col items-center text-center">
      <Divisor />

      <p
        className="mt-6 text-[0.6875rem] font-medium uppercase text-sage-deep"
        style={{ letterSpacing: '0.34em', textIndent: '0.34em' }}
      >
        Chá de bebê
      </p>

      <m.h1
        layoutId={LAYOUT_NOME}
        className="display relevo mt-1 text-[4rem] leading-[1.05] font-black text-tinta"
      >
        {EVENTO.bebe}
      </m.h1>

      <Divisor className="mt-6" />

      {arte && (
        <img
          src={arte.src}
          width={arte.largura}
          height={arte.altura}
          alt={arte.alt}
          // Está acima da dobra: nada de lazy, prioridade alta, e decode
          // síncrono. Com decode assíncrono o layout reserva o espaço e o
          // pinta vazio até a imagem ficar pronta — são 23 KB, o custo de
          // esperar é menor que o do buraco.
          fetchPriority="high"
          decoding="sync"
          className="anima-flutuar mt-8 h-auto w-44"
        />
      )}

      {saudacao && (
        <p className="display anima-subir mt-8 text-[1.5rem] leading-snug text-tinta italic">
          {saudacao}
        </p>
      )}

      {apoio && <p className="mt-3 max-w-xs text-[0.9375rem] text-tinta-suave">{apoio}</p>}

      {/* Mesmo rótulo das seções do papel — "QUANDO", "ONDE", "PRESENTE" —
          agora dizendo o que fazer. O destaque vem de ser outra voz tipográfica
          que a do apoio, e do ar em volta; não de cor quente nem de corpo
          maior, que disputariam com a saudação em Bodoni logo acima.

          A cor é a do texto de apoio, e não o sálvia dos rótulos de seção:
          assim a chamada pertence ao parágrafo que a antecede em vez de se
          anunciar como uma seção nova. O que a destaca é só a caixa alta e o
          ar em volta. */}
      {chamada && <p className="rotulo anima-subir mt-7 text-tinta-suave">{chamada}</p>}
    </header>
  );
}
