#!/usr/bin/env python3
"""
Desenha o favicon: a cabeça do ursinho, em vetor.

Por que não recortar a aquarela do convite: ela guarda toda a informação em
gradiente sutil, e gradiente sutil é o que morre primeiro na redução. Em 512px
o recorte fica lindo; em 16px, que é o tamanho real da aba, vira uma mancha
bege com um ponto escuro. O desenho abaixo tem o oposto disso — quatro formas
cheias e contraste alto, que sobrevivem a 16 pixels.

As formas são declaradas UMA vez, em coordenadas de um quadro 64x64, e daí
saem tanto o SVG quanto os PNGs. Manter dois desenhos da mesma arte seria
mantê-los divergindo, como seria com o .ics.

Uso:
    python3 scripts/favicon.py            # escreve em public/
    python3 scripts/favicon.py --saida /tmp/previa
"""

import argparse
import math
import pathlib

from PIL import Image, ImageDraw

LADO = 64  # o quadro em que as formas estão descritas

PAPEL = '#f8f3e7'
PELO = '#bf9a70'
PELO_ESCURO = '#9c7650'
FOCINHO = '#f3e6d4'
TINTA = '#2f3a2c'

# (forma, coordenadas no quadro 64, cor, espessura do traço)
#   circulo: (cx, cy, r)
#   elipse:  (cx, cy, rx, ry)
#   arco:    (cx, cy, rx, ry, grau_inicial, grau_final)
FORMAS = [
    ('circulo', (19.5, 19.5, 9.0), PELO_ESCURO, None),   # orelha esquerda
    ('circulo', (44.5, 19.5, 9.0), PELO_ESCURO, None),   # orelha direita
    ('circulo', (32.0, 34.0, 21.0), PELO, None),         # cabeça
    ('elipse', (32.0, 42.5, 11.0, 8.2), FOCINHO, None),  # focinho
    ('elipse', (32.0, 38.5, 3.6, 2.7), TINTA, None),     # nariz
    # Olhos fechados: o urso do convite está dormindo, e arco fechado diz isso
    # em menos pixels do que dois pontos com pálpebra.
    ('arco', (22.5, 31.5, 4.2, 3.4, 200, 340), TINTA, 2.0),
    ('arco', (41.5, 31.5, 4.2, 3.4, 200, 340), TINTA, 2.0),
]


def amostrar_arco(cx: float, cy: float, rx: float, ry: float,
                  g0: float, g1: float, passos: int = 24) -> list[tuple[float, float]]:
    """
    Os pontos do arco, na convenção do Pillow: zero às 3 horas, ângulo
    crescendo no sentido horário porque o y aponta para baixo.
    """
    return [
        (cx + rx * math.cos(math.radians(g)), cy + ry * math.sin(math.radians(g)))
        for g in (g0 + (g1 - g0) * i / passos for i in range(passos + 1))
    ]


def escrever_svg(destino: pathlib.Path) -> None:
    partes = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LADO} {LADO}">',
        f'  <rect width="{LADO}" height="{LADO}" rx="12" fill="{PAPEL}"/>',
    ]
    for forma, args, cor, traco in FORMAS:
        if forma == 'circulo':
            cx, cy, r = args
            partes.append(f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="{cor}"/>')
        elif forma == 'elipse':
            cx, cy, rx, ry = args
            partes.append(f'  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{cor}"/>')
        elif forma == 'arco':
            # Polilinha e não o comando A: o arco elíptico do SVG e o
            # ImageDraw.arc do Pillow discordam sobre sentido e sobre onde fica
            # o zero. Uma divergência aí não daria erro — daria um sorriso no
            # Chrome e uma carranca no iPhone. Amostrando os mesmos ângulos que
            # o raster usa, as duas saídas são a mesma curva por construção.
            pontos = ' '.join(f'{x:.2f} {y:.2f}' for x, y in amostrar_arco(*args))
            partes.append(
                f'  <polyline points="{pontos}" fill="none" stroke="{cor}" '
                f'stroke-width="{traco}" stroke-linecap="round" stroke-linejoin="round"/>'
            )
    partes.append('</svg>\n')
    destino.write_text('\n'.join(partes), encoding='utf-8')


def desenhar_png(tamanho: int, fundo: bool = True, super_amostra: int = 8) -> Image.Image:
    """
    Rasteriza as mesmas formas. O supersampling existe porque o Pillow não
    antialiasa: desenhar grande e reduzir com LANCZOS é o que dá a borda limpa.
    """
    px = tamanho * super_amostra
    escala = px / LADO
    img = Image.new('RGBA', (px, px), PAPEL if fundo else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    for forma, args, cor, traco in FORMAS:
        if forma == 'circulo':
            cx, cy, r = args
            caixa = ((cx - r) * escala, (cy - r) * escala, (cx + r) * escala, (cy + r) * escala)
            d.ellipse(caixa, fill=cor)
        elif forma == 'elipse':
            cx, cy, rx, ry = args
            caixa = ((cx - rx) * escala, (cy - ry) * escala, (cx + rx) * escala, (cy + ry) * escala)
            d.ellipse(caixa, fill=cor)
        elif forma == 'arco':
            cx, cy, rx, ry, g0, g1 = args
            caixa = ((cx - rx) * escala, (cy - ry) * escala, (cx + rx) * escala, (cy + ry) * escala)
            d.arc(caixa, g0, g1, fill=cor, width=max(1, round(traco * escala)))

    return img.resize((tamanho, tamanho), Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--saida', type=pathlib.Path, default=pathlib.Path('public'))
    args = ap.parse_args()
    args.saida.mkdir(parents=True, exist_ok=True)

    escrever_svg(args.saida / 'favicon.svg')
    # 32: a aba e o atalho de desktop. 180: a tela de início do iPhone, o único
    # lugar onde o ícone aparece grande. 512: manifesto e Android.
    for tamanho, nome in ((32, 'favicon-32.png'), (180, 'apple-touch-icon.png'),
                          (512, 'favicon-512.png')):
        desenhar_png(tamanho).save(args.saida / nome)

    print(f'escrito em {args.saida}: favicon.svg, favicon-32.png, '
          'apple-touch-icon.png, favicon-512.png')


if __name__ == '__main__':
    main()
