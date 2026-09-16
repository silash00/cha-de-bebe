import { EVENTO } from '../config';
import Divisor from './Ornamento';

interface Props {
  /** Ilustração sob o nome. Ausente nas telas que não são o convite em si. */
  ilustracao?: 'urso-lua' | 'urso-baloes' | null;
  /** Texto de abertura em Bodoni itálico — a saudação do convite. */
  saudacao?: string;
  /** Linha de apoio abaixo da saudação. */
  apoio?: string;
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
export default function Cabecalho({ ilustracao = null, saudacao, apoio }: Props) {
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

      <h1 className="display relevo anima-subir mt-1 text-[4rem] leading-[1.05] font-black text-tinta">
        {EVENTO.bebe}
      </h1>

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
    </header>
  );
}
