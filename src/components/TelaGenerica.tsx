import { EVENTO } from '../config';
import InfoEvento from './InfoEvento';

interface Props {
  motivo: 'sem-token' | 'invalido';
}

/**
 * Serve dois casos que não são erro do convidado: abriu o domínio direto, ou o
 * link chegou sem a querystring (encaminhamento no WhatsApp costuma cortar).
 * Nos dois, a pessoa recebe a informação do evento normalmente.
 */
export default function TelaGenerica({ motivo }: Props) {
  return (
    <main className="mx-auto max-w-md space-y-8 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-5xl" aria-hidden="true">
          👶
        </p>
        <h1 className="text-2xl text-stone-800">Nosso chá de bebê</h1>
      </header>

      <InfoEvento />

      <section className="space-y-2 rounded-lg border border-stone-200 bg-white p-4">
        {motivo === 'invalido' && (
          <p className="text-stone-800">Não reconhecemos esse link.</p>
        )}
        <p className="text-sm text-stone-600">
          Para confirmar presença, abra o link que enviamos para você no WhatsApp — ele é
          pessoal e já vem com o nome de quem foi convidado.
        </p>
        <a
          href={EVENTO.whatsappAnfitriao}
          className="inline-block text-sm underline underline-offset-2"
        >
          Falar com a gente
        </a>
      </section>
    </main>
  );
}
