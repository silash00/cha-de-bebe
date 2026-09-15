import { EVENTO } from '../config';

interface Props {
  onTentarDeNovo: () => void;
}

export default function TelaErro({ onTentarDeNovo }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-4xl" aria-hidden="true">
        📡
      </p>
      <h1 className="text-xl text-stone-800">Não conseguimos carregar seu convite</h1>
      <p className="text-sm text-stone-600">Pode ser a conexão. Tente de novo em instantes.</p>
      <button
        type="button"
        onClick={onTentarDeNovo}
        className="min-h-11 rounded-lg bg-stone-800 px-6 text-white"
      >
        Tentar de novo
      </button>
      <a href={EVENTO.whatsappAnfitriao} className="text-sm underline underline-offset-2">
        Falar com a gente no WhatsApp
      </a>
    </main>
  );
}
