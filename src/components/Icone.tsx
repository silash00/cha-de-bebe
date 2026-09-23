import * as m from 'motion/react-m';
import { useReducedMotion } from 'motion/react';

/**
 * Ícones de traço para os rótulos das seções, desenhando-se na entrada.
 *
 * Mesma linguagem da Estrela do Ornamento: SVG à mão, viewBox 24, traço em
 * currentColor. Nada de biblioteca de ícones — são três desenhos, e um pacote
 * inteiro para isso pesaria mais que o convite.
 */

const DESENHOS = {
  calendario: [
    'M4 7.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z',
    'M4 10.5h16',
    'M8.5 3.5V7',
    'M15.5 3.5V7',
  ],
  pin: [
    'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z',
    'M12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
  ],
  presente: [
    'M4.5 11h15v8.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5Z',
    'M3.5 7.5h17V11h-17Z',
    'M12 7.5V21',
    'M12 7.5C12 7.5 10.5 3.5 8 3.5a2 2 0 0 0 0 4Z',
    'M12 7.5C12 7.5 13.5 3.5 16 3.5a2 2 0 0 1 0 4Z',
  ],
} as const;

export type NomeIcone = keyof typeof DESENHOS;

interface Props {
  nome: NomeIcone;
  /** Atraso antes de começar a desenhar, para casar com a cascata da seção. */
  atraso?: number;
}

export default function Icone({ nome, atraso = 0 }: Props) {
  // pathLength não é transform: o reducedMotion="user" do MotionConfig, que
  // cobre transform e layout, passaria direto por ele. Com a preferência
  // ligada o ícone nasce desenhado.
  const semMovimento = useReducedMotion();
  const tracos = DESENHOS[nome];

  return (
    <m.svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mx-auto mb-2 block size-[1.125rem] text-sage-deep"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      // initial/whileInView explícitos fazem deste SVG a raiz da própria
      // variant. Sem isso o ícone dependeria da propagação vinda do papel — que
      // existe na TelaConvite, mas não na TelaConfirmado, cujo main anima por
      // objeto e não por variants. O modo de falha seria um ícone invisível,
      // preso em pathLength 0, e ícone invisível é pior que ícone parado.
      initial={semMovimento ? 'visivel' : 'oculto'}
      // whileInView e não animate: "Onde" e "Presente" nascem abaixo da dobra,
      // e no mount terminariam de se desenhar antes de alguém olhar. Quem rola
      // encontraria um traço parado. `once` porque o desenho é uma chegada, não
      // um efeito de rolagem — repetir a cada passagem viraria enfeite.
      whileInView="visivel"
      viewport={{ once: true, amount: 0.6 }}
    >
      {tracos.map((d, i) => (
        <m.path
          key={i}
          d={d}
          variants={{
            oculto: { pathLength: 0, opacity: 0 },
            visivel: {
              pathLength: 1,
              opacity: 1,
              transition: {
                duration: 0.6,
                delay: atraso + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        />
      ))}
    </m.svg>
  );
}
