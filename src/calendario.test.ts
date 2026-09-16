import { describe, it, expect } from 'vitest';
import { EVENTO } from './config';
import {
  DETALHES,
  LOCAL_COMPLETO,
  TITULO,
  paraUtcCompacto,
  textoIcs,
  urlGoogleAgenda,
} from './calendario';

const ICS = textoIcs();

/** Desdobra as linhas dobradas em 75 octetos, como manda o RFC 5545. */
const LINHAS: string[] = ICS.replace(/\r\n[ \t]/g, '').split('\r\n');

function campo(nome: string): string {
  const linha = LINHAS.find((l) => l === nome || l.startsWith(`${nome}:`) || l.startsWith(`${nome};`));
  if (!linha) throw new Error(`campo ${nome} ausente no .ics`);
  return linha.slice(linha.indexOf(':') + 1);
}

/** Desfaz os escapes de texto do RFC 5545 (vírgula e quebra de linha). */
function desescapar(valor: string): string {
  return valor.replace(/\\n/g, '\n').replace(/\\([,;\\\\])/g, '$1');
}

describe('paraUtcCompacto', () => {
  it('converte um horário de Brasília para o UTC compacto do calendário', () => {
    // 12h em Brasília (UTC-3, sem horário de verão desde 2019) são 15h em UTC.
    expect(paraUtcCompacto('2026-10-12T12:00:00-03:00')).toBe('20261012T150000Z');
  });

  it('recusa uma data que não dá para ler', () => {
    expect(() => paraUtcCompacto('doze de outubro')).toThrow(/data inválida/);
  });
});

describe('urlGoogleAgenda', () => {
  const url = new URL(urlGoogleAgenda());

  it('aponta para o formulário de evento do Google', () => {
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
  });

  it('leva o mesmo título, local e detalhes do .ics', () => {
    expect(url.searchParams.get('text')).toBe(TITULO);
    expect(url.searchParams.get('location')).toBe(LOCAL_COMPLETO);
    expect(url.searchParams.get('details')).toBe(DETALHES);
  });

  it('leva o intervalo do evento em UTC', () => {
    expect(url.searchParams.get('dates')).toBe(
      `${paraUtcCompacto(EVENTO.inicio)}/${paraUtcCompacto(EVENTO.fim)}`
    );
  });
});

describe('.ics', () => {
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

  it('não passa de 75 octetos por linha', () => {
    const codificador = new TextEncoder();
    const longas = ICS.split('\r\n').filter((l) => codificador.encode(l).length > 75);
    expect(longas).toEqual([]);
  });

  it('dobra a descrição sem partir um caractere acentuado ao meio', () => {
    expect(desescapar(campo('DESCRIPTION'))).toContain('Alvilândia');
    expect(ICS).not.toContain('\uFFFD');
  });

  it('marca o mesmo começo e fim que o EVENTO', () => {
    expect(campo('DTSTART')).toBe(paraUtcCompacto(EVENTO.inicio));
    expect(campo('DTEND')).toBe(paraUtcCompacto(EVENTO.fim));
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

  it('leva o mesmo título que o link do Google', () => {
    expect(campo('SUMMARY')).toBe(TITULO);
  });

  it('leva o local e o endereço do convite', () => {
    // No .ics a vírgula é reservada e vai escapada; comparo sem o escape.
    expect(desescapar(campo('LOCATION'))).toBe(LOCAL_COMPLETO);
  });

  it('descreve a referência e o mapa para quem abrir o evento', () => {
    expect(desescapar(campo('DESCRIPTION'))).toBe(DETALHES);
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
