import { EVENTO } from './config';

/**
 * O evento em forma de calendário: um texto só, servido de dois jeitos.
 *
 * Quem usa Google Agenda ganha o formulário já preenchido; quem usa iPhone,
 * Outlook ou desktop ganha o .ics de public/, que o aparelho abre na folha
 * nativa. Sniffing de user-agent resolveria com um link só, mas erra caso
 * demais — iPhone com Google Agenda, Android com Outlook — e ainda esconde a
 * escolha de quem sabe o que quer.
 *
 * Os textos abaixo são a fonte da verdade dos dois caminhos: o link do Google
 * os usa direto, e calendario.test.ts confere o .ics contra eles.
 */

export const TITULO = `Chá de bebê do ${EVENTO.bebe}`;

/** Travessão vira hífen: clientes de calendário antigos tropeçam nele. */
const ENDERECO = EVENTO.endereco.replace(/—/g, '-');

export const LOCAL_COMPLETO = `${EVENTO.local} - ${ENDERECO}`;

export const DETALHES = [
  `${TITULO}!`,
  '',
  `${EVENTO.local} (${EVENTO.referencia})`,
  ENDERECO,
  `Mapa: ${EVENTO.mapa}`,
].join('\n');

/** '2026-10-12T12:00:00-03:00' → '20261012T150000Z', como pedem .ics e Google. */
export function paraUtcCompacto(iso: string): string {
  const instante = new Date(iso);
  if (Number.isNaN(instante.getTime())) throw new Error(`data inválida: ${iso}`);
  return instante.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** O formulário de novo evento do Google, já preenchido. */
export function urlGoogleAgenda(): string {
  const parametros = new URLSearchParams({
    action: 'TEMPLATE',
    text: TITULO,
    dates: `${paraUtcCompacto(EVENTO.inicio)}/${paraUtcCompacto(EVENTO.fim)}`,
    location: LOCAL_COMPLETO,
    details: DETALHES,
  });
  return `https://calendar.google.com/calendar/render?${parametros}`;
}

/* ----- O .ics ----- */

/** Escapa o que o RFC 5545 reserva dentro de um valor de texto. */
function escapar(texto: string): string {
  return texto.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * Dobra em 75 octetos, continuando a linha com um espaço (RFC 5545, 3.1).
 * Mede em bytes, não em caracteres: "ã" ocupa dois, e um cliente rígido conta
 * octetos. Itera por code point para nunca partir um caractere ao meio.
 */
function dobrar(linha: string): string {
  const codificador = new TextEncoder();
  let dobrada = '';
  let largura = 0;
  for (const caractere of linha) {
    const octetos = codificador.encode(caractere).length;
    if (largura + octetos > 75) {
      dobrada += '\r\n ';
      largura = 1; // o espaço da continuação já ocupa um octeto
    }
    dobrada += caractere;
    largura += octetos;
  }
  return dobrada;
}

/**
 * Carimbo de criação do convite. Fixo de propósito: com DTSTAMP variável, o
 * arquivo mudaria a cada carregamento da página e o teste não teria o que
 * afirmar. Só faria diferença se o evento fosse remarcado por METHOD:REQUEST,
 * que não é o caso aqui.
 */
const DTSTAMP = '20260916T120000Z';
const UID = 'cha-de-bebe-yuri-2026-10-12@cha.silashenrique.dev';

/** O evento inteiro em texto iCalendar, pronto para virar arquivo. */
export function textoIcs(): string {
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//cha.silashenrique.dev//Cha de bebe do Yuri//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${UID}`,
    `DTSTAMP:${DTSTAMP}`,
    `DTSTART:${paraUtcCompacto(EVENTO.inicio)}`,
    `DTEND:${paraUtcCompacto(EVENTO.fim)}`,
    `SUMMARY:${escapar(TITULO)}`,
    `LOCATION:${escapar(LOCAL_COMPLETO)}`,
    `DESCRIPTION:${escapar(DETALHES)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapar(`${TITULO} é amanhã`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return linhas.map(dobrar).join('\r\n') + '\r\n';
}

/** Nome do arquivo que o convidado vê ao baixar. */
export const NOME_ICS = 'cha-do-yuri.ics';
