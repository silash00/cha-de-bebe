/**
 * Rolagem da página.
 *
 * Vive fora dos componentes porque a decisão de rolar é do fluxo — quem
 * confirmou, quem falhou, quem voltou a editar — e não da apresentação.
 */

/**
 * Scroll suave é movimento como qualquer outro: com `prefers-reduced-motion`
 * ligado, o certo é saltar, não deslizar.
 */
function comportamento(): ScrollBehavior {
  const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return reduz ? 'auto' : 'smooth';
}

/** Volta ao topo da página. */
export function subirAoTopo(): void {
  window.scrollTo({ top: 0, behavior: comportamento() });
}

/** Traz um elemento para a vista. Tolera `null` para o chamador não precisar checar. */
export function trazerParaVista(el: Element | null | undefined): void {
  el?.scrollIntoView({ behavior: comportamento(), block: 'center' });
}
