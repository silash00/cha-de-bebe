import { describe, it, expect, vi, afterEach } from 'vitest';
import { subirAoTopo, trazerParaVista } from './scroll';

/** Monta um `window` com a preferência de movimento que o teste quiser. */
function mockWindow(reduzMovimento: boolean) {
  const scrollTo = vi.fn();
  vi.stubGlobal('window', {
    scrollTo,
    matchMedia: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') && reduzMovimento,
    }),
  });
  return scrollTo;
}

afterEach(() => vi.unstubAllGlobals());

describe('subirAoTopo', () => {
  it('desliza quando não há preferência por menos movimento', () => {
    const scrollTo = mockWindow(false);
    subirAoTopo();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('salta quando a pessoa pediu menos movimento', () => {
    const scrollTo = mockWindow(true);
    subirAoTopo();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('não quebra onde matchMedia não existe', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('window', { scrollTo });
    expect(() => subirAoTopo()).not.toThrow();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});

describe('trazerParaVista', () => {
  it('rola o elemento para o centro', () => {
    mockWindow(false);
    const scrollIntoView = vi.fn();
    trazerParaVista({ scrollIntoView } as unknown as Element);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('respeita a preferência por menos movimento', () => {
    mockWindow(true);
    const scrollIntoView = vi.fn();
    trazerParaVista({ scrollIntoView } as unknown as Element);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' });
  });

  it('tolera null sem quebrar', () => {
    mockWindow(false);
    expect(() => trazerParaVista(null)).not.toThrow();
  });
});
