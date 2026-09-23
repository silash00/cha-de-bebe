#!/usr/bin/env python3
"""
Transforma a planilha de convidados na carga do Postgres.

Lê o CSV exportado da planilha e escreve, FORA do repositório:

  carga.sql      o INSERT dos convites e das pessoas, em uma transação
  links.csv      token, rótulo e link de WhatsApp de cada convite
  tokens.csv     o vínculo convite -> token, que torna a reexecução segura
  pendencias.csv o que precisa de decisão humana antes do disparo

E anota o token de volta na própria planilha, numa coluna ao lado do convite,
para a ponte entre a linha e o link ficar visível sem consultar outro arquivo.
A planilha original é copiada para <nome>.bak antes de qualquer escrita.

Uso:
    python3 scripts/carga.py ~/Desktop/lista.csv
    python3 scripts/carga.py ~/Desktop/lista.csv --conferir   (não escreve nada)

Os dados nunca entram no repositório: são nomes e telefones de gente real, e
o repositório é público. A saída vai para ~/Desktop/cha-dados por padrão.
"""

import argparse
import collections
import csv
import pathlib
import re
import secrets
import sys
import unicodedata

# Sem 0/O e sem 1/l/I: o token é ditado por telefone e copiado à mão quando o
# link falha. Ambiguidade aqui vira convite que não abre.
ALFABETO = '23456789abcdefghjkmnpqrstuvwxyz'
TAMANHO_TOKEN = 6

FRALDAS = {'RN', 'P', 'M', 'G', 'XG'}

MENSAGEM = (
    'Oi! 👶\n\n'
    'Estamos organizando o chá de bebê do Yuri e queremos muito ver você lá.\n\n'
    'O convite é este, com todos os detalhes e a confirmação de presença:\n'
    'https://cha.silashenrique.dev/?c={token}'
)


def limpar(texto: str) -> str:
    """Tira espaço das pontas e os invisíveis que vêm de copiar e colar."""
    semi = ''.join(c for c in texto if unicodedata.category(c) != 'Cf')
    return semi.replace('\u00a0', ' ').strip()


def normalizar_telefone(bruto: str) -> tuple[str | None, str | None]:
    """
    Devolve (telefone_e164, aviso). Um número que não dá para usar no wa.me
    volta como None — melhor um convite sem link do que um link que abre a
    conversa errada.
    """
    digitos = re.sub(r'\D', '', bruto)
    if not digitos:
        return None, 'sem telefone'
    if digitos.startswith('55'):
        digitos = digitos[2:]
    if len(digitos) == 11:
        return '55' + digitos, None
    if len(digitos) == 10:
        # Celular antigo sem o 9, ou telefone fixo. Não dá para adivinhar qual.
        return None, f'10 dígitos ({bruto}) — fixo ou faltando o 9?'
    return None, f'{len(digitos)} dígitos ({bruto}) — fora do padrão'


def achar_coluna_convite(cabecalho: list[str], linhas: list[list[str]]) -> int:
    """
    Acha a coluna do convite pelo cabeçalho e, se ele não disser nada, pelo
    conteúdo: a que tiver mais valores no formato "Convite - 12". A busca por
    conteúdo existe porque a coluna nasceu sem cabeçalho nenhum; ela fica como
    rede, para a planilha continuar sendo lida se alguém renomear o título.
    """
    for i, c in enumerate(cabecalho):
        if c.lower() in ('numconvite', 'num convite', 'convite'):
            return i
    padrao = re.compile(r'convite\s*-\s*\d+', re.IGNORECASE)
    placar: collections.Counter = collections.Counter()
    for linha in linhas:
        for i, valor in enumerate(linha):
            if padrao.fullmatch(limpar(valor)):
                placar[i] += 1
    if not placar:
        sys.exit('nenhuma coluna identifica o convite: nem cabeçalho "NumConvite", '
                 'nem valores no formato "Convite - N"')
    return placar.most_common(1)[0][0]


def ler(caminho: pathlib.Path) -> list[dict]:
    with caminho.open(encoding='utf-8-sig', newline='') as f:
        linhas = list(csv.reader(f))

    cabecalho = [limpar(c) for c in linhas[0]]

    def coluna(*nomes: str) -> int:
        for nome in nomes:
            for i, c in enumerate(cabecalho):
                if c.lower() == nome.lower():
                    return i
        sys.exit(f'coluna não encontrada no CSV: {nomes[0]!r} (achei {cabecalho})')

    ci = {
        'grupo': coluna('Grupo'),
        'convite': achar_coluna_convite(cabecalho, linhas[1:]),
        'nome': coluna('Convidado', 'Nome'),
        'telefone': coluna('Número', 'Numero', 'Telefone'),
        'fralda': coluna('Tamanho Fralda', 'Fralda'),
    }

    registros, grupo_atual = [], ''
    for numero, linha in enumerate(linhas[1:], start=2):
        def campo(chave: str) -> str:
            i = ci[chave]
            return limpar(linha[i]) if len(linha) > i else ''

        if campo('grupo'):
            grupo_atual = campo('grupo')
        if not campo('nome') and not campo('convite'):
            continue
        registros.append({
            'linha': numero,
            'grupo': grupo_atual,
            'convite': campo('convite'),
            'nome': campo('nome'),
            'telefone': campo('telefone'),
            'fralda': campo('fralda').upper(),
        })
    return registros


def agrupar(registros: list[dict]) -> tuple[dict, list[str]]:
    """Junta as linhas por convite. Devolve (convites, erros fatais)."""
    convites: dict[str, dict] = collections.OrderedDict()
    erros: list[str] = []

    for r in registros:
        if not r['convite']:
            erros.append(f'linha {r["linha"]}: "{r["nome"]}" não pertence a convite nenhum')
            continue
        if not r['nome']:
            erros.append(f'linha {r["linha"]}: {r["convite"]} tem linha sem nome')
            continue
        c = convites.setdefault(r['convite'], {
            'rotulo': r['convite'], 'grupo': r['grupo'],
            'pessoas': [], 'fraldas': [], 'telefones': [],
        })
        c['pessoas'].append(r['nome'])
        c['telefones'].append(r['telefone'])
        if r['fralda']:
            c['fraldas'].append(r['fralda'])

    for rotulo, c in convites.items():
        tamanhos = set(c['fraldas'])
        if not tamanhos:
            erros.append(f'{rotulo}: sem tamanho de fralda')
        elif len(tamanhos) > 1:
            erros.append(f'{rotulo}: tamanhos divergentes na mesma família ({sorted(tamanhos)})')
        elif not tamanhos <= FRALDAS:
            erros.append(f'{rotulo}: tamanho desconhecido {tamanhos} (esperado {sorted(FRALDAS)})')
        else:
            c['fralda'] = c['fraldas'][0]
        if not c['pessoas']:
            erros.append(f'{rotulo}: nenhuma pessoa')

    return convites, erros


def carregar_tokens(caminho: pathlib.Path) -> dict[str, str]:
    """
    Tokens já sorteados em execuções anteriores.

    É o que torna rodar de novo seguro: quem já recebeu o link mantém o dele, e
    só quem entrou depois ganha token novo. Sem isto, reexecutar trocaria o
    token de todo mundo e derrubaria os convites já enviados.
    """
    if not caminho.exists():
        return {}
    with caminho.open(encoding='utf-8', newline='') as f:
        return {l['convite']: l['token'] for l in csv.DictReader(f)}


def sortear(quantos: int, usados: set[str]) -> list[str]:
    novos = []
    while len(novos) < quantos:
        t = ''.join(secrets.choice(ALFABETO) for _ in range(TAMANHO_TOKEN))
        if t not in usados:
            usados.add(t)
            novos.append(t)
    return novos


def aspas(valor: str | None) -> str:
    if valor is None:
        return 'null'
    return "'" + valor.replace("'", "''") + "'"


QUEBRA = ',\n'


def montar_sql(convites: dict) -> str:
    linhas_convites, linhas_pessoas = [], []
    for c in convites.values():
        linhas_convites.append(
            f"  ({aspas(c['token'])}, {aspas(c['saudacao'])}, "
            f"{aspas(c['telefone'])}, {aspas(c['fralda'])})"
        )
        for ordem, nome in enumerate(c['pessoas']):
            linhas_pessoas.append(f"  ({aspas(c['token'])}, {ordem}, {aspas(nome)})")

    return f"""-- Carga dos convites. Gerado por scripts/carga.py — não editar à mão.
--
-- Uma transação só, e idempotente: o `on conflict` silencia quem já está lá, o
-- `returning` devolve apenas os que entraram agora, e o join só acha par para
-- esses. Rodar duas vezes não duplica ninguém.
--
-- {len(convites)} convites, {sum(len(c['pessoas']) for c in convites.values())} pessoas.

begin;

with novos as (
  insert into convites (token, saudacao, telefone, fralda)
  values
{QUEBRA.join(linhas_convites)}
  on conflict (token) do nothing
  returning id, token
)
insert into pessoas (convite_id, ordem, nome)
select n.id, v.ordem, v.nome
  from novos n
  join (values
{QUEBRA.join(linhas_pessoas)}
  ) as v(token, ordem, nome) on v.token = n.token
on conflict (convite_id, ordem) do nothing;

-- Confira antes do commit: uma linha por convite, com a contagem de pessoas.
select c.token, c.saudacao, c.fralda, count(p.id) as pessoas
  from convites c
  left join pessoas p on p.convite_id = c.id
 group by c.token, c.saudacao, c.fralda
 order by c.saudacao;

commit;
"""


def anotar_planilha(caminho: pathlib.Path, tokens: dict[str, str]) -> tuple[int, str]:
    """
    Escreve o token de volta na planilha, ao lado da coluna do convite.

    Reescreve o arquivo inteiro preservando tudo que não é a coluna nova —
    inclusive as colunas vazias e as anotações soltas à direita, que são do
    dono da planilha e não têm por que sumir. O original vira <nome>.bak.
    """
    with caminho.open(encoding='utf-8-sig', newline='') as f:
        linhas = list(csv.reader(f))

    cabecalho = [limpar(c) for c in linhas[0]]
    i_convite = achar_coluna_convite(cabecalho, linhas[1:])

    existente = next((i for i, c in enumerate(cabecalho) if c.lower() == 'token'), None)
    if existente is None:
        # Ao lado do convite: identificador junto de identificador. Inserir
        # desloca as colunas à direita, e é por isso que existe o .bak.
        i_token = i_convite + 1
        for linha in linhas:
            while len(linha) < i_token:
                linha.append('')
            linha.insert(i_token, '')
        linhas[0][i_token] = 'Token'
    else:
        i_token = existente

    for linha in linhas[1:]:
        while len(linha) <= i_token:
            linha.append('')
        rotulo = limpar(linha[i_convite]) if len(linha) > i_convite else ''
        if rotulo in tokens:
            linha[i_token] = tokens[rotulo]

    caminho.with_suffix(caminho.suffix + '.bak').write_bytes(caminho.read_bytes())
    with caminho.open('w', encoding='utf-8', newline='') as f:
        csv.writer(f).writerows(linhas)

    coluna = chr(ord('A') + i_token) if i_token < 26 else f'#{i_token + 1}'
    return i_token, coluna


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('csv', type=pathlib.Path, help='a planilha exportada')
    ap.add_argument('--saida', type=pathlib.Path,
                    default=pathlib.Path.home() / 'Desktop' / 'cha-dados',
                    help='pasta de saída, fora do repositório')
    ap.add_argument('--conferir', action='store_true', help='só valida, não escreve')
    ap.add_argument('--nao-anotar', action='store_true',
                    help='não escrever a coluna token de volta na planilha')
    args = ap.parse_args()

    registros = ler(args.csv)
    convites, erros = agrupar(registros)

    if erros:
        print('A planilha tem problemas que impedem a carga:\n', file=sys.stderr)
        for e in erros:
            print(f'  - {e}', file=sys.stderr)
        sys.exit(1)

    pendencias = []
    for rotulo, c in convites.items():
        c['saudacao'] = f"{rotulo} · {c['grupo']}" if c['grupo'] else rotulo
        # O telefone do convite é o da primeira pessoa: é para ela que a
        # mensagem vai, e é ela quem abre o link pelos demais.
        telefone, aviso = normalizar_telefone(c['telefones'][0])
        c['telefone'] = telefone
        if aviso:
            pendencias.append({'convite': rotulo, 'pessoa': c['pessoas'][0], 'problema': aviso})

    tokens = carregar_tokens(args.saida / 'tokens.csv')
    usados = set(tokens.values())
    faltam = [r for r in convites if r not in tokens]
    for rotulo, token in zip(faltam, sortear(len(faltam), usados)):
        tokens[rotulo] = token
    for rotulo, c in convites.items():
        c['token'] = tokens[rotulo]

    pessoas = sum(len(c['pessoas']) for c in convites.values())
    print(f'{len(convites)} convites, {pessoas} pessoas')
    print(f'  tokens reaproveitados: {len(convites) - len(faltam)} | novos: {len(faltam)}')
    print('  fraldas:', dict(collections.Counter(c['fralda'] for c in convites.values())))
    print(f'  com link de WhatsApp: {sum(1 for c in convites.values() if c["telefone"])}')
    if pendencias:
        print(f'\n  {len(pendencias)} convite(s) sem link, o resto entra normalmente:')
        for p in pendencias:
            print(f'    - {p["convite"]} ({p["pessoa"]}): {p["problema"]}')

    if args.conferir:
        print('\n--conferir: nada foi escrito.')
        return

    args.saida.mkdir(parents=True, exist_ok=True)
    (args.saida / 'carga.sql').write_text(montar_sql(convites), encoding='utf-8')

    with (args.saida / 'tokens.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['convite', 'token'])
        w.writerows((r, c['token']) for r, c in convites.items())

    with (args.saida / 'links.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['convite', 'grupo', 'pessoas', 'fralda', 'token', 'convite_url', 'whatsapp'])
        for rotulo, c in convites.items():
            url = f"https://cha.silashenrique.dev/?c={c['token']}"
            zap = ''
            if c['telefone']:
                from urllib.parse import quote
                zap = f"https://wa.me/{c['telefone']}?text={quote(MENSAGEM.format(token=c['token']))}"
            w.writerow([rotulo, c['grupo'], ' + '.join(c['pessoas']),
                        c['fralda'], c['token'], url, zap])

    with (args.saida / 'pendencias.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['convite', 'pessoa', 'problema'])
        w.writeheader()
        w.writerows(pendencias)

    if not args.nao_anotar:
        _, coluna = anotar_planilha(args.csv, {r: c['token'] for r, c in convites.items()})
        print(f'\nToken anotado na planilha, coluna {coluna} '
              f'(original em {args.csv.name}.bak)')

    print(f'\nEscrito em {args.saida}:')
    for nome in ('carga.sql', 'links.csv', 'tokens.csv', 'pendencias.csv'):
        print(f'  {nome}')


if __name__ == '__main__':
    main()
