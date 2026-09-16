import { describe, it, expect } from 'vitest';
import { EVENTO } from './config';
// `?raw` traz o arquivo cru pelo próprio pipeline do Vite, sem CRLF normalizado
// e sem precisar de @types/node só para um readFileSync.
import ICS from '../public/cha-do-yuri.ics?raw';

/**
 * O arquivo importado e o EVENTO precisam contar a mesma história.
 *
 * O .ics é um arquivo estático em public/, e não um Blob gerado no cliente:
 * o Safari do iOS é irregular com `blob:` + download, e iPhone é o aparelho
 * da maioria dos convidados. O preço disso é que o arquivo repete o que já
 * está no EVENTO — então este teste é a costura entre os dois. Mudar a data
 * no config e esquecer o .ics quebra aqui, não na agenda de quem foi convidado.
 */

/** Desdobra as linhas dobradas em 75 octetos, como manda o RFC 5545. */
const LINHAS: string[] = ICS.replace(/\r\n[ \t]/g, '').split('\r\n');

function campo(nome: string): string {
  const linha = LINHAS.find((l) => l === nome || l.startsWith(`${nome}:`) || l.startsWith(`${nome};`));
  if (!linha) throw new Error(`campo ${nome} ausente no .ics`);
  return linha.slice(linha.indexOf(':') + 1);
}

describe('convite de calendário', () => {
  it('é um VCALENDAR com um único VEVENT', () => {
    expect(LINHAS[0]).toBe('BEGIN:VCALENDAR');
    expect(LINHAS.at(-1)).toBe('');
    expect(LINHAS.at(-2)).toBe('END:VCALENDAR');
    expect(LINHAS.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(1);
    expect(LINHAS.filter((l) => l === 'END:VEVENT')).toHaveLength(1);
  });

  it('usa CRLF em toda linha, como exige o RFC 5545', () => {
    expect(ICS).not.toMatch(/(?<!\r)\n/);
  });

  it('marca a data e a hora do evento em UTC', () => {
    // 12h em Brasília (UTC-3, sem horário de verão desde 2019) são 15h em UTC.
    expect(campo('DTSTART')).toBe('20261012T150000Z');
    expect(campo('DTEND')).toBe('20261012T200000Z');
  });

  it('marca a mesma data que o convite mostra na tela', () => {
    const inicio = campo('DTSTART');
    const [, ano, mes, dia] = inicio.match(/^(\d{4})(\d{2})(\d{2})T/)!;
    const data = new Date(`${ano}-${mes}-${dia}T12:00:00-03:00`);

    const naTela = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(data);
    expect(naTela).toBe(EVENTO.dataCurta);

    const diaSemana = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      timeZone: 'America/Sao_Paulo',
    }).format(data);
    expect(EVENTO.diaSemana.toLowerCase()).toContain(diaSemana);

    // A hora do config ('12h') é a hora local do DTSTART.
    const hora = new Intl.DateTimeFormat('pt-BR', {
      hour: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(`${ano}-${mes}-${dia}T15:00:00Z`));
    expect(EVENTO.hora).toBe(`${hora.replace(/\D/g, '')}h`);
  });

  it('leva o nome do bebê no título', () => {
    expect(campo('SUMMARY')).toContain(EVENTO.bebe);
  });

  it('leva o local e o endereço do convite', () => {
    const local = campo('LOCATION');
    expect(local).toContain(EVENTO.local);
    // No .ics a vírgula é reservada e vai escapada; comparo sem o escape.
    expect(local.replace(/\\,/g, ',')).toContain(EVENTO.endereco.replace(/—/g, '-'));
  });

  it('descreve a referência e o mapa para quem abrir o evento', () => {
    const descricao = campo('DESCRIPTION').replace(/\\,/g, ',').replace(/\\n/g, '\n');
    expect(descricao).toContain(EVENTO.referencia);
    expect(descricao).toContain(EVENTO.mapa);
  });

  it('tem UID e DTSTAMP fixos, para reimportar atualizar em vez de duplicar', () => {
    expect(campo('UID')).toMatch(/@cha\.silashenrique\.dev$/);
    expect(campo('DTSTAMP')).toMatch(/^\d{8}T\d{6}Z$/);
  });

  it('lembra a pessoa um dia antes', () => {
    expect(LINHAS).toContain('BEGIN:VALARM');
    expect(campo('TRIGGER')).toBe('-P1D');
  });
});
