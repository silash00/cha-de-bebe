/**
 * Ornamentos editoriais: a estrela das referências, redesenhada em SVG, e o
 * divisor que dá o ritmo entre as seções.
 *
 * A estrela é SVG e não recorte de aquarela porque ela se repete muitas vezes,
 * em tamanhos diferentes, e precisa mudar de cor — um PNG faria as três coisas
 * mal.
 */

const ESTRELA =
  'M12 1 L14.7 8.28 L22.46 8.6 L16.37 13.42 L18.47 20.9 ' +
  'L12 16.6 L5.53 20.9 L7.63 13.42 L1.54 8.6 L9.3 8.28 Z';

interface EstrelaProps {
  className?: string;
}

export function Estrela({ className = '' }: EstrelaProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d={ESTRELA}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DivisorProps {
  className?: string;
  /** Cor do losango central. Terracota é o acento raro, reservado ao sucesso. */
  acento?: boolean;
}

export default function Divisor({ className = '', acento = false }: DivisorProps) {
  return (
    <div
      aria-hidden="true"
      className={'flex items-center justify-center gap-3 ' + className}
    >
      <span className="anima-desenhar h-px w-14 origin-right bg-sage" />
      <Estrela className={'size-3 ' + (acento ? 'text-terracota' : 'text-sage')} />
      <span className="anima-desenhar h-px w-14 origin-left bg-sage" />
    </div>
  );
}
