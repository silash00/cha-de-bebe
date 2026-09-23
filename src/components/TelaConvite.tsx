import { useEffect, useRef, useState } from 'react';
import type { Convite, Pessoa, Status } from '../types';
import { EVENTO } from '../config';
import * as m from 'motion/react-m';
import Cabecalho from './Cabecalho';
import Divisor, { PAPEL, SECAO } from './Ornamento';
import Icone from './Icone';
import { trazerParaVista } from '../scroll';
import InfoEvento from './InfoEvento';
import ListaPessoas from './ListaPessoas';

export type AvisoEnvio = null | 'falha' | 'convite_mudou';

interface Props {
  convite: Convite;
  enviando: boolean;
  aviso: AvisoEnvio;
  onConfirmar: (pessoas: Pessoa[], recado: string) => void;
}

export default function TelaConvite({ convite, enviando, aviso, onConfirmar }: Props) {
  const [pessoas, setPessoas] = useState<Pessoa[]>(convite.pessoas);
  const [recado, setRecado] = useState(convite.recado ?? '');

  function alterar(indice: number, status: Status) {
    setPessoas((atual) => atual.map((p, i) => (i === indice ? { ...p, status } : p)));
  }

  const nenhumRespondido = pessoas.every((p) => p.status === 'pendente');

  // Ao enviar, o App sobe a página ao topo durante a ida ao Supabase. Se a
  // resposta for um aviso, ele nasce aqui embaixo, longe da vista — então o
  // aviso se traz para o olho. Quem é dono do elemento é quem sabe rolar até
  // ele; o App não tem — nem deveria ter — referência para dentro desta tela.
  const avisoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (aviso) trazerParaVista(avisoRef.current);
  }, [aviso]);

  return (
    <m.main
      className="papel"
      variants={PAPEL}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* A abertura é a mesma para todo mundo, e por isso mora aqui e não no
          banco: quem o convite nomeia são as pessoas da lista abaixo, em Bodoni
          grande, uma por linha. O campo `saudacao` do convite segue existindo,
          agora só como rótulo interno para saber de quem é cada token ao olhar
          a tabela — a tela não o usa. */}
      <Cabecalho
        ilustracao="urso-lua"
        saudacao="Com alegria, convidamos você."
        apoio="Vamos celebrar a chegada do nosso Yuri."
        chamada="Confirme abaixo quem vem"
      />

      <m.div variants={SECAO} className="mt-10">
        <Divisor />
      </m.div>

      <m.div variants={SECAO} className="mt-10">
        <InfoEvento />
      </m.div>

      {convite.fralda && (
        <m.div variants={SECAO}>
          <div aria-hidden="true" className="filete mt-10" />
          <section className="mt-10 text-center">
            <p className="rotulo">
              <Icone nome="presente" atraso={0.2} />
              Sugestão de presente
            </p>
            <p className="display mt-2 text-[1.375rem] font-semibold text-tinta">
              Fraldas tamanho {convite.fralda} + mimo
            </p>
          </section>
        </m.div>
      )}

      <m.div variants={SECAO} className="mt-10">
        <Divisor />
      </m.div>

      <m.section variants={SECAO} className="mt-10">
        <h2 className="display relevo text-center text-[1.75rem] font-black text-tinta">
          Quem vem?
        </h2>
        <p className="mt-2 text-center text-sm text-tinta-suave">
          Responda por cada pessoa do convite.
        </p>
        <p className="mx-auto mt-1 max-w-[17rem] text-center text-[0.8125rem] text-tinta-suave">
          Crianças menores de 10 anos não precisam ser confirmadas.
        </p>
        <div className="mt-6">
          <ListaPessoas pessoas={pessoas} onChange={alterar} />
        </div>
      </m.section>

      <m.section variants={SECAO} className="mt-8">
        <label htmlFor="recado" className="rotulo block text-center">
          Recado (opcional)
        </label>
        <textarea
          id="recado"
          value={recado}
          onChange={(e) => setRecado(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={`Deixe um carinho para o ${EVENTO.bebe}…`}
          className="campo mt-3 w-full px-4 py-3 text-[0.9375rem] text-tinta placeholder:text-tinta-suave"
        />
      </m.section>

      {aviso === 'convite_mudou' && (
        <div ref={avisoRef} role="alert" className="aviso mt-6 border-taupe px-5 py-4">
          <p className="text-[0.9375rem] text-tinta">A lista deste convite foi atualizada.</p>
          <p className="mt-1 text-sm text-tinta-suave">
            Recarregamos os nomes acima. Confira e confirme de novo, por favor.
          </p>
        </div>
      )}

      {aviso === 'falha' && (
        <div ref={avisoRef} role="alert" className="aviso mt-6 border-terracota px-5 py-4">
          <p className="text-[0.9375rem] text-tinta">
            Não conseguimos registrar sua resposta.
          </p>
          <p className="mt-1 text-sm text-tinta-suave">
            Suas escolhas continuam aqui — é só tentar de novo. Se insistir em falhar,{' '}
            <a href={EVENTO.whatsappAnfitriao} className="elo">
              nos chame no WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      <m.button
        variants={SECAO}
        type="button"
        disabled={enviando || nenhumRespondido}
        onClick={() => onConfirmar(pessoas, recado)}
        className="botao botao-primario mt-8 w-full"
      >
        {enviando ? 'Enviando…' : 'Confirmar presença'}
      </m.button>

      {nenhumRespondido && (
        <p className="mt-3 text-center text-sm text-tinta-suave">
          Marque quem vai antes de confirmar.
        </p>
      )}

      <Divisor className="mt-10" />
    </m.main>
  );
}
