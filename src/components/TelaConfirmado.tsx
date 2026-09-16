import type { Convite } from '../types';
import * as m from 'motion/react-m';
import { EVENTO } from '../config';
import Divisor, { LAYOUT_NOME } from './Ornamento';
import Icone from './Icone';
import InfoEvento from './InfoEvento';

interface Props {
  convite: Convite;
  onEditar: () => void;
}

export default function TelaConfirmado({ convite, onEditar }: Props) {
  const vao = convite.pessoas.filter((p) => p.status === 'sim');
  const ninguemVai = vao.length === 0;

  return (
    <m.main
      className="papel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="flex flex-col items-center text-center">
        <Divisor acento={!ninguemVai} />

        {/* Quem vem ganha o urso nos balões; quem não vem, o urso dormindo.
            A ilustração carrega o tom, para o texto não precisar insistir. */}
        <img
          src={ninguemVai ? '/ilustracoes/urso-lua.webp' : '/ilustracoes/urso-baloes.webp'}
          width={ninguemVai ? 506 : 479}
          height={ninguemVai ? 549 : 687}
          alt=""
          decoding="async"
          className="anima-subir mt-8 h-auto w-44"
        />

        <m.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="display relevo mt-8 text-[2.5rem] leading-tight font-black text-tinta"
        >
          {ninguemVai ? 'Que pena!' : 'Até lá!'}
        </m.h1>

        <p className="mt-3 max-w-xs text-[0.9375rem] text-tinta-suave">
          {ninguemVai
            ? 'Vamos sentir sua falta. Obrigado por avisar.'
            : 'Sua presença está registrada. Estamos ansiosos para ver você.'}
        </p>

        <Divisor className="mt-8" acento={!ninguemVai} />
      </header>

      <section className="mt-10">
        <p className="rotulo text-center">Sua resposta</p>

        {/* Índice editorial: nome à esquerda, resposta à direita, filete entre
            as linhas. A ordem é a do convite — posição é a identidade da
            pessoa, então reordenar por resposta confundiria quem confere. */}
        <ul className="mt-5 divide-y divide-sage/40 border-y border-sage/40">
          {convite.pessoas.map((p, i) => (
            <li key={i} className="flex items-baseline justify-between gap-4 py-3.5">
              <span
                className={
                  'display text-[1.25rem] font-semibold ' +
                  (p.status === 'sim' ? 'text-tinta' : 'text-tinta-suave')
                }
              >
                {p.nome}
              </span>
              <span
                className={
                  'rotulo shrink-0 ' +
                  (p.status === 'sim'
                    ? 'text-terracota-texto'
                    : p.status === 'nao'
                      ? 'text-taupe-deep'
                      : 'text-sage-deep')
                }
              >
                {/* 'pendente' aqui é possível: o envio não obriga marcar todo
                    mundo. Dizer "não vai" por omissão seria inventar resposta. */}
                {p.status === 'sim' ? 'vai' : p.status === 'nao' ? 'não vai' : 'sem resposta'}
              </span>
            </li>
          ))}
        </ul>

        {convite.fralda && !ninguemVai && (
          <p className="mt-7 text-center">
            <span className="rotulo block">
              <Icone nome="presente" atraso={0.2} />
              Presente combinado
            </span>
            <span className="display mt-2 block text-[1.25rem] font-semibold text-tinta">
              Fraldas tamanho {convite.fralda}
            </span>
          </p>
        )}
      </section>

      {!ninguemVai && (
        <>
          <Divisor className="mt-10" />
          <div className="mt-10">
            <InfoEvento />
          </div>
        </>
      )}

      <button type="button" onClick={onEditar} className="botao botao-contorno mt-10 w-full">
        Alterar minha resposta
      </button>

      <p className="mt-10 text-center">
        <span className="display text-[1.125rem] font-semibold text-tinta-suave italic">
          com carinho,{' '}
        </span>
        <m.span
          layoutId={LAYOUT_NOME}
          className="display text-[1.125rem] font-semibold text-tinta-suave italic"
        >
          {EVENTO.bebe}
        </m.span>
      </p>

      <Divisor className="mt-4" />
    </m.main>
  );
}
