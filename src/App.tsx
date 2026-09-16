import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { lerToken } from './token';
import { buscarConvite, confirmar } from './api';
import type { Convite, Pessoa } from './types';
import TelaCarregando from './components/TelaCarregando';
import TelaConvite, { type AvisoEnvio } from './components/TelaConvite';
import TelaConfirmado from './components/TelaConfirmado';
import TelaGenerica from './components/TelaGenerica';
import TelaErro from './components/TelaErro';

type Estado =
  | { nome: 'carregando' }
  | { nome: 'sem-token' }
  | { nome: 'invalido' }
  | { nome: 'erro' }
  | { nome: 'convite'; convite: Convite }
  | { nome: 'confirmado'; convite: Convite };

export default function App() {
  const [estado, setEstado] = useState<Estado>({ nome: 'carregando' });
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<AvisoEnvio>(null);
  // Incrementado a cada recarga: vira `key` da TelaConvite para que ela
  // remonte e reinicialize os toggles a partir do convite novo.
  const [geracao, setGeracao] = useState(0);

  const { token, preview } = lerToken(window.location.search);

  const carregar = useCallback(async () => {
    if (!token) {
      setEstado({ nome: 'sem-token' });
      return;
    }

    setEstado({ nome: 'carregando' });
    const r = await buscarConvite(token, preview);

    if (r.tipo === 'nao_encontrado') return setEstado({ nome: 'invalido' });
    if (r.tipo === 'erro') return setEstado({ nome: 'erro' });

    setEstado({
      nome: r.convite.respondidoEm ? 'confirmado' : 'convite',
      convite: r.convite,
    });
  }, [token, preview]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function enviar(pessoas: Pessoa[], recado: string) {
    // Só se envia a partir da tela de convite.
    if (!token || estado.nome !== 'convite') return;
    const base = estado.convite;

    setEnviando(true);
    setAviso(null);

    const r = await confirmar(token, pessoas, recado);
    setEnviando(false);

    if (r.tipo === 'convite_mudou') {
      // A lista divergiu e nada foi gravado. Recarregar é obrigatório: insistir
      // com os dados velhos seria recusado de novo, para sempre.
      const novo = await buscarConvite(token, preview);
      if (novo.tipo === 'ok') {
        setEstado({ nome: 'convite', convite: novo.convite });
        setGeracao((g) => g + 1);
        setAviso('convite_mudou');
      } else {
        setEstado({ nome: 'erro' });
      }
      return;
    }

    if (r.tipo === 'erro') {
      // Mantém a tela e o que a pessoa preencheu — TelaConvite guarda o
      // próprio estado, então nada se perde.
      setAviso('falha');
      return;
    }

    setEstado({
      nome: 'confirmado',
      convite: {
        ...base,
        pessoas,
        recado,
        // Só precisa ser truthy: marca "já respondeu" e nunca é exibido.
        respondidoEm: new Date().toISOString(),
      },
    });
  }

  function tela() {
    switch (estado.nome) {
      case 'carregando':
        return <TelaCarregando key="carregando" />;
      case 'sem-token':
        return <TelaGenerica key="generica-sem-token" motivo="sem-token" />;
      case 'invalido':
        return <TelaGenerica key="generica-invalido" motivo="invalido" />;
      case 'erro':
        return <TelaErro key="erro" onTentarDeNovo={() => void carregar()} />;
      case 'convite':
        return (
          <TelaConvite
            // A `geracao` entra na key para a tela remontar após
            // `convite_mudou` e reinicializar os toggles — comportamento que
            // já existia e não pode se perder na troca para AnimatePresence.
            key={`convite-${geracao}`}
            convite={estado.convite}
            enviando={enviando}
            aviso={aviso}
            onConfirmar={(pessoas, recado) => void enviar(pessoas, recado)}
          />
        );
      case 'confirmado':
        return (
          <TelaConfirmado
            key="confirmado"
            convite={estado.convite}
            onEditar={() => {
              setAviso(null);
              setEstado({ nome: 'convite', convite: estado.convite });
            }}
          />
        );
    }
  }

  // Modo padrão (sync), não "wait" nem "popLayout".
  //
  //   "wait"      — a tela nova só montaria depois da saída terminar, e o nome
  //                 não teria como fazer a passagem num movimento só.
  //   "popLayout" — precisa clonar o filho com uma ref para tirá-lo do fluxo, e
  //                 os filhos aqui são componentes nossos, que não encaminham
  //                 ref para o nó do DOM. Daria warning e não poparia.
  //
  // No modo padrão as duas telas coexistem por alguns frames. Para não
  // empilharem verticalmente, o .palco é um grid de uma célula só e ambas
  // ocupam essa mesma célula.
  return (
    <div className="palco">
      <AnimatePresence initial={false}>{tela()}</AnimatePresence>
    </div>
  );
}
