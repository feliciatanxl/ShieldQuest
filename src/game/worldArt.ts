import Phaser from 'phaser'
import { depthAt, project, type Footprint } from './isometric'

type Colors = readonly [string, string, string]
type Vertex = [number, number, number?]
type Graphics = Phaser.GameObjects.Graphics
const ink = '#39394a'
const pixel = (color: string) => Number.parseInt(color.slice(1), 16)

export function poly(g: Graphics, color: string, vertices: Vertex[], alpha = 1) {
  g.fillStyle(pixel(color), alpha)
  g.fillPoints(vertices.map(([x, y, h]) => {
    const p = project(x, y, h)
    return new Phaser.Math.Vector2(Math.round(p.x), Math.round(p.y))
  }), true)
}

export function floor(g: Graphics, x: number, y: number, w: number, d: number, color: string, h = 0, alpha = 1) {
  poly(g, color, [[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], alpha)
}

export function front(g: Graphics, x: number, y: number, w: number, z: number, h: number, color: string) {
  poly(g, color, [[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]])
}

export function side(g: Graphics, x: number, y: number, d: number, z: number, h: number, color: string) {
  poly(g, color, [[x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h]])
}

export function box(g: Graphics, x: number, y: number, w: number, d: number, h: number, colors: Colors, z = 0) {
  side(g, x + w, y, d, z, h, colors[2])
  front(g, x, y + d, w, z, h, colors[1])
  floor(g, x, y, w, d, colors[0], z + h)
}

const glyphs: Record<string, string> = {
  A:'010101111101101', B:'110101110101110', C:'011100100100011', D:'110101101101110',
  E:'111100110100111', F:'111100110100100', G:'011100101101011', H:'101101111101101',
  I:'111010010010111', J:'001001001101010', K:'101101110101101', L:'100100100100111',
  M:'101111111101101', N:'101111111111101', O:'010101101101010', P:'110101110100100',
  Q:'010101101111011', R:'110101110101101', S:'011100010001110', T:'111010010010010',
  U:'101101101101111', V:'101101101101010', W:'101101111111101', X:'101101010101101',
  Y:'101101010010010', Z:'111001010100111', '0':'111101101101111', '1':'110010010010111',
  '2':'110001010100111', '3':'110001010001110', '4':'101101111001001', '5':'111100110001110',
}

export function letterSign(g: Graphics, text: string, x: number, y: number, z: number, size: number, color: string) {
  const unit = size / 32
  Array.from(text).forEach((letter, index) => {
    Array.from(glyphs[letter] ?? '').forEach((bit, cell) => {
      if (bit === '1') front(g, x + (index * 4 + cell % 3) * unit, y, unit, z + (4 - Math.floor(cell / 3)) * size, size, color)
    })
  })
}

export function prop(scene: Phaser.Scene, rect: Footprint, render: (g: Graphics) => void, offset = 0) {
  const g = scene.add.graphics().setDepth(depthAt(rect.x + rect.w, rect.y + rect.d) + offset)
  render(g)
  return g
}

export function tree(g: Graphics, x: number, y: number, large = false, hue = 0) {
  const p = project(x + .34, y + .34)
  const colors = hue ? ['#4a7763', '#648e69', '#83a66a', '#a9bd78'] : ['#4b7a67', '#659a77', '#86ad78', '#afc68a']
  const size = large ? 1.25 : 1
  function pixelShape(color: string, vertices: number[][]) {
    g.fillStyle(pixel(color))
    g.fillPoints(vertices.map(([px, py]) => new Phaser.Math.Vector2(Math.round(p.x + px * size), Math.round(p.y + py * size))), true)
  }
  floor(g, x - .25, y - .13, 1.22, .93, '#354d50', 0, .19)
  box(g, x + .15, y + .15, .28, .28, 31 * size, ['#aa8364', '#8a6452', '#664c48'])
  pixelShape(colors[0], [[-32,-44],[-32,-63],[-23,-67],[-23,-77],[-11,-77],[-11,-83],[10,-83],[10,-78],[23,-78],[23,-68],[31,-68],[31,-47],[24,-47],[24,-39],[13,-39],[13,-34],[-13,-34],[-13,-38],[-24,-38],[-24,-44]])
  pixelShape(colors[1], [[-30,-49],[-30,-63],[-21,-63],[-21,-74],[-9,-74],[-9,-80],[10,-80],[10,-74],[23,-74],[23,-64],[29,-64],[29,-53],[19,-53],[19,-47],[4,-47],[4,-42],[-14,-42],[-14,-46]])
  pixelShape(colors[2], [[-24,-63],[-17,-63],[-17,-73],[-7,-73],[-7,-78],[8,-78],[8,-72],[18,-72],[18,-63],[12,-63],[12,-57],[-4,-57],[-4,-52],[-17,-52],[-17,-57],[-24,-57]])
  pixelShape(colors[3], [[-14,-70],[-6,-70],[-6,-74],[6,-74],[6,-69],[12,-69],[12,-64],[3,-64],[3,-61],[-9,-61],[-9,-65],[-14,-65]])
  g.fillStyle(pixel(colors[3]), .7).fillRect(Math.round(p.x - 18 * size), Math.round(p.y - 57 * size), 4, 3)
  g.fillStyle(pixel(colors[2]), .9).fillRect(Math.round(p.x + 18 * size), Math.round(p.y - 54 * size), 4, 2)
}

export function planter(g: Graphics, x: number, y: number, w = 1) {
  box(g, x, y, w, .58, 10, ['#f3c3a1', '#a76960', '#855b56'])
  floor(g, x + .08, y + .08, w - .16, .42, '#665857', 10)
  for (let i = .18; i < w; i += .26) {
    box(g, x + i - .08, y + .19, .18, .19, 5 + (i % .4) * 10, ['#a8bb73', '#69875e', '#536e5a'], 10)
    const p = project(x + i + .01, y + .31, 18)
    g.fillStyle(pixel(i % .4 < .2 ? '#efaa85' : '#f5d581')).fillRect(Math.round(p.x), Math.round(p.y), 3, 3)
  }
}

export function bench(g: Graphics, x: number, y: number) {
  for (const leg of [0, 1.02]) box(g, x + leg, y + .17, .10, .27, 10, ['#5b5b64', ink, '#555161'])
  box(g, x - .05, y, 1.22, .49, 3, ['#d5a16c', '#9a684f', '#75514d'], 9)
  box(g, x - .05, y, 1.22, .09, 5, ['#e2ad74', '#b57a54', '#79554d'], 16)
}

export function lamp(g: Graphics, x: number, y: number) {
  box(g, x, y, .11, .11, 46, ['#a6ada2', '#53676b', '#3e5259'])
  box(g, x, y, .45, .15, 3, ['#aab8a3', '#fff0bb', '#667574'], 43)
}

export function shelter(g: Graphics, x: number, y: number, w: number, d: number, bus = false) {
  floor(g, x, y, w, d, '#55556c', 0, .17)
  for (const [px, py] of [[x, y], [x + w - .1, y], [x, y + d - .12], [x + w - .1, y + d - .12]]) {
    box(g, px, py, .11, .11, 45, ['#abcbc2', '#648b88', '#496779'])
  }
  bench(g, x + .31, y + .14)
  if (bus) {
    front(g, x + w - .55, y + .08, .39, 14, 21, '#467d79')
    front(g, x + w - .49, y + .08, .27, 18, 13, '#f4e3b4')
  }
  box(g, x - .12, y - .12, w + .24, d + .24, 5, ['#9cc4b5', '#4d8383', '#547d84'], 43)
  for (let i = .18; i < w; i += .36) floor(g, x + i, y - .08, .035, d + .16, '#c0dbc2', 48)
  if (bus) letterSign(g, 'BUS', x + .18, y + d + .12, 43, 1, '#fff0c8')
}

export function block(g: Graphics, x: number, y: number, w: number, d: number, number: string, accent: string, floors: number) {
  const h = 35 + floors * 23
  floor(g, x + .05, y + .12, w + .42, d + .7, '#48546a', 0, .24)
  box(g, x, y, w, d, 27, ['#ead5ba', '#c8ab9c', '#989398'])
  for (let i = .23; i < w - .28; i += .86) {
    front(g, x + i, y + d, .60, 2, 22, '#625d69')
    front(g, x + i + .06, y + d, .45, 3, 17, '#7b7980')
  }
  box(g, x, y, w, d, h - 27, ['#fbdfc5', '#f0d5b7', '#b4a3a3'], 27)
  for (let level = 0; level < floors; level++) {
    const z = 34 + level * 23
    front(g, x, y + d, w, z - 4, 4, accent)
    side(g, x + w, y, d, z - 4, 4, '#96919d')
    for (let i = .23; i < w - .55; i += .86) {
      front(g, x + i, y + d, .58, z, 13, '#535b6d')
      front(g, x + i + .06, y + d, .22, z + 3, 8, ((level + i) % 3 < 1) ? '#f4db9c' : '#88a6ab')
      front(g, x + i + .31, y + d, .19, z + 3, 8, '#adc5bf')
      front(g, x + i - .04, y + d, .65, z - 2, 2, '#f6e3c6')
      if ((Math.floor(i * 3) + level) % 4 === 0) box(g, x + i + .44, y + d, .15, .14, 5, ['#fff2d6', '#a6a1a1', '#797c85'], z - 2)
    }
    for (let j = .22; j < d - .4; j += .65) {
      side(g, x + w, y + j, .36, z, 12, '#707683')
      side(g, x + w, y + j + .04, .26, z + 3, 7, '#9aadb0')
    }
  }
  box(g, x - .09, y - .09, w + .18, d + .18, 7, ['#ead2bb', accent, '#858693'], h)
  box(g, x + .47, y + .33, w - .94, d - .66, 7, ['#c7b5ae', '#b29892', '#9f9096'], h + 7)
  for (const i of [x + .63, x + w - 1.3]) box(g, i, y + .63, .68, .55, 13, ['#d9d0c5', '#baaea8', '#87858e'], h + 14)
  front(g, x + w - .89, y + d, .84, h - 20, 16, accent)
  letterSign(g, number, x + w - .8, y + d, h - 17, 1.7, '#fff2d7')
}

export function shop(g: Graphics, x: number, y: number, w: number, d: number, mini: boolean) {
  const band = mini ? '#417e75' : '#9b554d'
  const awning = mini ? '#efa985' : '#edbd79'
  const title = mini ? 'SUNSHINE MINIMART' : 'KOPI CORNER'
  floor(g, x + .14, y + .1, w + .42, d + .7, '#556070', 0, .22)
  box(g, x, y, w, d, 68, ['#e9b78f', '#f4d5ae', '#a99b9f'])
  box(g, x + .15, y + .17, w - .3, d - .34, 8, ['#edc49e', '#c69680', '#ad8d87'], 68)
  box(g, x + .33, y + .37, w - .66, d - .75, 2, ['#d9aa8b', '#c49c88', '#aa8b85'], 76)
  for (let i = .5; i < w - .4; i += .66) floor(g, x + i, y + .44, .04, d - .88, '#f1c6a0', 78)
  const door = mini ? 1.25 : .43
  front(g, x + .17, y + d, w - .34, 2, 30, '#765f61')
  front(g, x + door, y + d, .95, 1, 34, '#3d4d56')
  for (let i = .26; i < w - .47; i += .49) {
    if (i > door - .48 && i < door + 1) continue
    front(g, x + i, y + d, .44, 6, 21, mini ? '#8eaca3' : '#cca97d')
    front(g, x + i + .06, y + d, .10, 11, 13, '#e9d5a4')
    front(g, x + i, y + d, .44, 6, 3, '#4e6666')
  }
  if (mini) {
    front(g, x + door + .48, y + d, .05, 1, 27, '#80a29d')
    front(g, x + door + .58, y + d, .13, 13, 3, '#efc47e')
  }
  for (let j = .24; j < d - .2; j += .68) {
    side(g, x + w, y + j, .44, 14, 18, '#666b78')
    side(g, x + w, y + j + .07, .30, 17, 12, '#8c9f9f')
  }
  box(g, x - .05, y + d - .05, w + .1, .14, 25, [band, band, '#566b70'], 39)
  const fontSize = mini ? 2 : 2.35
  letterSign(g, title, x + (w - (title.length * 4 - 1) * fontSize / 32) / 2, y + d + .09, 46, fontSize, '#fff3cd')
  for (let i = 0; i < w; i += .32) {
    const color = Math.round(i / .32) % 2 === 0 ? awning : '#fff0cb'
    const width = Math.min(.32, w - i)
    poly(g, color, [[x + i, y + d + .07, 40], [x + i + width, y + d + .07, 40], [x + i + width, y + d + .52, 33], [x + i, y + d + .52, 33]])
    front(g, x + i, y + d + .52, width, 29, 4, color)
  }
  floor(g, x + door - .10, y + d, 1.14, .39, '#cead9b', 2)
}

