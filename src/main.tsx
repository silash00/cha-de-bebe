import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* domMax e não domAnimation: as animações de layout (o FLIP do nome
        viajando) só existem no bundle maior. Carregado de forma síncrona,
        não sob demanda — a primeira transição é a mais importante, e um
        import() dinâmico poderia perder a corrida contra o Supabase e
        entregar justamente a troca seca que queremos eliminar.

        strict faz o build falhar se alguém importar `motion.*` completo em
        vez de `m.*`, o que anularia a economia do LazyMotion. */}
    <LazyMotion features={domMax} strict>
      {/* O bloco de prefers-reduced-motion no CSS só alcança animação CSS: o
          Motion anima por WAAPI e estilo inline e passa direto por ele. Com
          reducedMotion="user", transform e layout ficam desligados na árvore
          toda e sobra opacidade, que não causa desconforto vestibular. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </LazyMotion>
  </StrictMode>
);
