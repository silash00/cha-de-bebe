import { EVENTO } from '../config';
import Divisor from './Ornamento';

interface Props {
  onTentarDeNovo: () => void;
}

export default function TelaErro({ onTentarDeNovo }: Props) {
  return (
    <main className="papel flex flex-col items-center text-center">
      <Divisor />

      <img
        src="/ilustracoes/nuvem.webp"
        width={451}
        height={349}
        alt=""
        decoding="async"
        className="anima-flutuar mt-8 h-auto w-40"
      />

      <h1 className="display relevo anima-subir mt-6 text-[2rem] leading-tight font-black text-tinta">
        Não conseguimos abrir seu convite
      </h1>

      <p className="mt-3 max-w-xs text-[0.9375rem] text-tinta-suave">
        Pode ser a conexão. Tente de novo em instantes — nada do que você preencheu se
        perdeu.
      </p>

      <button
        type="button"
        onClick={onTentarDeNovo}
        className="botao botao-primario mt-8 w-full"
      >
        Tentar de novo
      </button>

      <p className="mt-5">
        <a
          href={EVENTO.whatsappAnfitriao}
          className="elo text-[0.8125rem] uppercase"
          style={{ letterSpacing: '0.14em' }}
        >
          Falar com a gente no WhatsApp
        </a>
      </p>

      <Divisor className="mt-10" />
    </main>
  );
}
