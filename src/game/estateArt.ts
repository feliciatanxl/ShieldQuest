import type { Point } from '../state/saveGame'
import { blockFrame, pillars, PILLAR, type Building } from './estateLayout'
import type { Painter } from './pixelIso'

// Estate art painters (docs/isometric-art-spec.md). Props draw at the tile origin so one baked texture serves every
// copy; buildings draw at their own position. Heights in pixels, positions in tiles.
export const DECK_H = 84, STOREY = 64, GROUND_H = 70

const PALETTES = [
  ['#f2e8d0', '#ddd0b2', '#3e9b8f', '#2f7a70'], ['#f6dcc8', '#dfc0aa', '#d0714c', '#a8553a'], ['#e3ecd6', '#c7d3b8', '#5f8f4e', '#486f3a'],
  ['#dde8ef', '#bccbd6', '#3f6fa0', '#2e537a'], ['#f6edc6', '#ddd2a2', '#a8424a', '#843239'],
] as const
const AWNINGS = ['#d9644a', '#2f8a4f', '#3f6fa0', '#e8a93a', '#a8424a', '#4f9d8f']
const GLASS = '#8fc6d8', WHITE = '#ffffff'
const hash = (n: number) => { const j = Math.sin(n * 91.345) * 43758.5453; return j - Math.floor(j) }

// ------------------------------------------------------------------ greenery
const LEAVES = [
  ['#3c8a47', '#52a453', '#73bf5e', '#a5d870'], ['#2f7a4a', '#438f55', '#5fae62', '#8fd07a'], ['#4a8a3a', '#62a548', '#86c25a', '#b5de7a'],
  ['#356f48', '#4a8a58', '#68a86a', '#93c983'],
]
/** Twelve tree types: angsana, rain tree, tembusu, flame tree, frangipani, palm; six more at 1.2 scale. */
export function tree(g: Painter, v: number) {
  const type = v % 6, s = v >= 6 ? 1.2 : 1, leaf = LEAVES[v % 4], seed = v * 7 + 3
  const r = (i: number) => hash(seed + i)
  g.blob(0, 0, 0, 0, 0, (type === 1 ? 40 : 28) * s, (type === 1 ? 17 : 12) * s, '#1c2430', .2)
  if (type === 5) {
    // Palm: tall ringed trunk and a fan of fronds.
    g.box(-.08, -.08, .16, .16, 70 * s, ['#b08a5c', '#957148', '#765737'])
    for (let k = 0; k < 7; k++) g.dot(0, 0, 10 + k * 9 * s, -3, 0, 6, 1, '#7a5a3a')
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * Math.PI * 2, dx = Math.cos(a) * 22 * s, dy = Math.sin(a) * 9 * s
      g.blob(0, 0, 70 * s, dx * .6, dy * .6 - 2, 14 * s, 4 * s, leaf[k % 2 ? 1 : 2]).blob(0, 0, 70 * s, dx, dy + 2, 8 * s, 3 * s, leaf[0])
    }
    g.blob(0, 0, 70 * s, 0, -3, 6, 4, leaf[3])
    return
  }
  const trunk = type === 2 ? 30 : type === 1 ? 32 : 40, z = trunk * s, bark = ['#8a6040', '#7a5236', '#5e3f2a'] as const
  g.box(-.12, -.12, .24, .24, 6, bark).box(-.1, -.1, .2, .2, z, bark)
  const [rx, ry, lift] = type === 1 ? [50, 19, 8] : type === 2 ? [24, 30, 22] : type === 4 ? [26, 17, 10] : [34, 22, 12]
  const R = (n: number) => n * s
  // Limbs fork from the trunk into the crown (wide and low on rain trees and angsanas).
  for (let k = 0; k < (type === 1 ? 4 : 3); k++) {
    const a = (k / (type === 1 ? 4 : 3) + r(k + 70) * .2) * Math.PI * 2, reach = type === 1 ? .9 : .45
    const bx = Math.cos(a) * reach * s, by = Math.sin(a) * reach * .5 * s
    g.poly(bark[k % 2 ? 2 : 1], [[-.05, 0, z - 10], [.05, 0, z - 10], [bx + .03, by, z + R(lift) * .6], [bx - .03, by, z + R(lift) * .6]])
  }
  // Crown: a dozen clumps, each a shaded underside, a mid tone and a sunlit top, then a scatter of single leaves.
  const clumps = Array.from({ length: 13 }, (_, k) => {
    const a = r(k) * Math.PI * 2, d = k === 0 ? 0 : .35 + r(k + 9) * .55
    return { x: Math.cos(a) * R(rx) * d * .8, y: -R(lift) + Math.sin(a) * R(ry) * d * .7, w: R(rx) * (.32 + r(k + 3) * .16), h: R(ry) * (.42 + r(k + 5) * .14) }
  }).sort((p, q) => p.y - q.y)
  for (const c of clumps) g.blob(0, 0, z, c.x, c.y + 3, c.w, c.h, leaf[0])
  for (const c of clumps) g.blob(0, 0, z, c.x, c.y, c.w * .9, c.h * .85, leaf[1])
  for (const c of clumps) if (c.y < -R(lift) + R(ry) * .2) g.blob(0, 0, z, c.x - c.w * .2, c.y - c.h * .35, c.w * .5, c.h * .4, leaf[2])
  for (let k = 0; k < 28; k++) {
    const dx = (r(k + 100) - .5) * R(rx) * 1.6, dy = -R(lift) + (r(k + 140) - .65) * R(ry) * 1.5
    g.dot(0, 0, z, dx, dy, 2, 1, k % 3 ? leaf[3] : leaf[0])
  }
  if (type === 3) for (let k = 0; k < 18; k++) g.dot(0, 0, z, (r(k + 40) - .5) * R(rx) * 1.6, -R(lift) + (r(k + 60) - .7) * R(ry) * 1.4, 2, 2, k % 3 ? '#e8532f' : '#f2a03a')
  if (type === 4) for (let k = 0; k < 14; k++) g.dot(0, 0, z, (r(k + 40) - .5) * R(rx) * 1.4, -R(lift) + (r(k + 60) - .8) * R(ry) * 1.2, 2, 2, k % 2 ? '#fff6e0' : '#f6d36b')
}
const FLOWERS = ['#f2a0c8', '#e8532f', '#f6d36b', '']
export function shrub(g: Painter, v: number) {
  g.blob(.3, .3, 0, 0, -6, 14, 8, '#2f6f3a').blob(.3, .3, 0, -5, -9, 9, 6, '#4f9e4a').blob(.3, .3, 0, 5, -8, 8, 5, '#62ad55').blob(.3, .3, 0, 0, -12, 6, 3, '#8fd06a')
  const f = FLOWERS[v % 4]
  if (f) for (const [dx, dy] of [[-8, -9], [-2, -13], [5, -11], [9, -6], [-4, -5], [2, -7]]) g.dot(.3, .3, 0, dx, dy, 2, 2, f)
}

// ------------------------------------------------------------------ street furniture (origin = footprint corner)
export function bench(g: Painter) {
  for (const t of [.1, 1.2]) g.box(t, .12, .1, .2, 12, '#55525e')
  g.box(0, 0, 1.4, .45, 3, ['#e0a865', '#b87a48', '#8e5c3a'], 12).box(0, 0, 1.4, .1, 12, ['#e0a865', '#b87a48', '#8e5c3a'], 15)
}
export function bin(g: Painter) {
  g.box(0, 0, .36, .36, 24, ['#3f8a5a', '#2f6f4f', '#22573d']).box(-.02, -.02, .4, .4, 4, ['#4f9a6a', '#2f6f4f', '#22573d'], 24)
}
export function lamp(g: Painter) {
  g.box(0, 0, .14, .14, 92, ['#8f99a3', '#6b7580', '#4f5862'])
  g.box(-.05, -.5, .2, .62, 4, ['#9aa4ae', '#6b7580', '#4f5862'], 90).box(-.02, -.44, .14, .2, 2, ['#fff3c4', '#fff3c4', '#e7d18c'], 88)
}
export function bikes(g: Painter, alongY = false) {
  // alongY: the same rack turned a quarter (x and y swapped, so front and side faces swap too).
  const box = (x: number, y: number, w: number, d: number, h: number, c: string, z = 0) => alongY ? g.box(y, x, d, w, h, c, z) : g.box(x, y, w, d, h, c, z)
  const blob = (x: number, y: number, z: number, rx: number, ry: number, c: string) => alongY ? g.blob(y, x, z, 0, 0, rx, ry, c) : g.blob(x, y, z, 0, 0, rx, ry, c)
  const face = (x: number, y: number, w: number, z: number, h: number, c: string) => alongY ? g.side(y, x, w, z, h, c) : g.front(x, y, w, z, h, c)
  box(0, 0, .06, 1.4, 14, '#8a939b'); box(1.7, 0, .06, 1.4, 14, '#8a939b'); box(0, 0, 1.76, .06, 2, '#8a939b', 14)
  ;['#d9483b', '#2f6f9f', '#e8b04a'].forEach((c, i) => {
    const by = .3 + i * .42
    for (const wx of [.25, 1.25]) { blob(wx, by, 9, 9, 9, '#2a2f36'); blob(wx, by, 9, 6, 6, '#c9d1d7'); blob(wx, by, 9, 1, 1, '#2a2f36') }
    face(.3, by, 1, 12, 2, c); face(.6, by, .08, 12, 8, c); face(.5, by, .3, 20, 2, '#2a2f36'); face(1.2, by, .06, 12, 12, c)
  })
}
export function chess(g: Painter) {
  const stone = ['#bdb6a6', '#a39b89', '#867f6f'] as const
  for (const [sx, sy] of [[0, .45], [.55, 0], [1.1, .45]]) g.box(sx, sy, .3, .3, 14, stone)
  g.box(.55, .5, .3, .3, 18, stone).box(.35, .3, .7, .7, 5, ['#d8d1c0', '#b7af9c', '#968e7c'], 18)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) & 1) g.floor(.45 + i * .125, .4 + j * .125, .125, .125, '#6f6758', 23)
}
export function recycle(g: Painter) {
  ;['#2f6f9f', '#3f8a5a', '#e8a93a'].forEach((c, i) => g.box(i * .6, 0, .54, .55, 30, c).box(i * .6 + .05, .05, .44, .45, 3, ['#f4f1e8', '#d8d4c8', '#b9b5a8'], 30))
}
export function planter(g: Painter) {
  g.box(0, 0, 1.6, .6, 10, ['#e8ddc6', '#cfc2a6', '#ab9d80'])
  for (let i = 0; i < 4; i++) g.blob(.2 + i * .4, .3, 10, 0, -4, 7, 5, i % 2 ? '#4f9e4a' : '#62ad55').dot(.2 + i * .4, .3, 10, 0, -8, 2, 2, FLOWERS[i % 3])
}
export function garden(g: Painter) {
  for (const ox of [0, 1.8]) {
    g.box(ox, 0, 1.6, 1, 8, ['#a87a4a', '#8c6a4a', '#6f5238'], 0).floor(ox + .08, .08, 1.44, .84, '#6b4e36', 8)
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
      g.blob(ox + .2 + i * .3, .28 + j * .42, 8, 0, -3, 5, 3, j ? '#4f9e4a' : '#6fc15a')
      if ((i + j + ox) % 3 === 0) g.dot(ox + .2 + i * .3, .28 + j * .42, 8, -1, -5, 2, 2, '#d9483b')
    }
  }
}
/** Rubber safety flooring, painted into the ground so people stand on it rather than behind it. */
export function mat(g: Painter, x: number, y: number, w: number, d: number) {
  g.floor(x, y, w, d, '#5aa363').floor(x + .15, y + .15, w - .3, d - .3, '#e07f4f')
}
type Part = { rect: { x: number; y: number; w: number; d: number }; draw: (g: Painter) => void }
const yellow = ['#ffcf5a', '#e8a93a', '#bd842a'] as const, steel = ['#cfd6db', '#9aa4ab', '#7c868e'] as const
/** Playground pieces (tower with slide, swings, spring rocker), each depth-sorted on its own footprint. */
export const PLAY_PARTS: Part[] = [
  { rect: { x: .4, y: .4, w: 1.4, d: 3.2 }, draw: g => {
    g.box(.4, .4, 1.4, 1.6, 34, ['#f2c14e', '#d9a33a', '#b8862e'])
    for (const [x, y] of [[.45, .45], [1.65, .45], [.45, 1.85], [1.65, 1.85]]) g.box(x, y, .12, .12, 70, ['#3f6fa0', '#2e537a', '#203d5c'])
    g.poly('#d9483b', [[.3, .3, 70], [1.9, .3, 70], [1.1, 1.2, 92]]).poly('#b8352b', [[1.9, .3, 70], [1.9, 2.1, 70], [1.1, 1.2, 92]]).poly('#e0554a', [[.3, 2.1, 70], [1.9, 2.1, 70], [1.1, 1.2, 92]])
    g.poly('#3fa0c9', [[.7, 2, 34], [1.5, 2, 34], [1.5, 3.6, 2], [.7, 3.6, 2]]).poly('#2e7f9f', [[1.5, 2, 34], [1.5, 3.6, 2], [1.5, 3.6, 0], [1.5, 2, 30]])
  } },
  { rect: { x: 2.6, y: .5, w: 2, d: .35 }, draw: g => {
    for (const x of [2.6, 4.5]) for (const y of [.5, .75]) g.box(x, y, .1, .1, 60, ['#2f8a4f', '#257543', '#1c5c34'])
    g.box(2.6, .5, 2, .35, 4, ['#2f8a4f', '#257543', '#1c5c34'], 60)
    for (const x of [3.05, 3.95]) { g.box(x, .62, .03, .03, 40, '#55606a', 20); g.box(x - .15, .55, .35, .2, 3, ['#d9483b', '#b8352b', '#922a22'], 18) }
  } },
  { rect: { x: 2.9, y: 2.4, w: 1.4, d: .8 }, draw: g => g.box(2.9, 2.4, 1.4, .8, 10, ['#9b6fc9', '#7d55a8', '#5f3f85']).blob(3.6, 2.8, 10, 0, -3, 12, 5, '#c9a8ef') },
]
/** Fitness corner pieces: pull-up bars, sit-up bench, waist twister, stretching rail. */
export const FITNESS_PARTS: Part[] = [
  { rect: { x: .5, y: .4, w: 1.74, d: .14 }, draw: g => { for (const px of [.5, 2.1]) g.box(px, .4, .14, .14, 70, yellow); g.box(.5, .4, 1.74, .14, 4, steel, 66) } },
  { rect: { x: 3.1, y: .3, w: .6, d: 1.8 }, draw: g => g.box(3.1, .3, .6, 1.8, 10, ['#5ab0c9', '#3d8fa8', '#2e6f84']).box(3.1, .3, .6, .2, 12, ['#5ab0c9', '#3d8fa8', '#2e6f84'], 10) },
  { rect: { x: .9, y: 2.15, w: .55, d: .45 }, draw: g => g.box(1.1, 2.3, .14, .14, 34, yellow).blob(1.17, 2.37, 0, 0, -2, 14, 7, '#d9483b').box(.9, 2.15, .55, .45, 3, steel, 34) },
  { rect: { x: 3.9, y: 2.3, w: .74, d: .14 }, draw: g => g.box(4.2, 2.3, .14, .14, 40, yellow).box(3.9, 2.35, .74, .1, 3, steel, 38) },
]
export function kopitiam(g: Painter) {
  const stool = ['#d9483b', '#b8352b', '#922a22'] as const
  for (const [x, y] of [[0, .6], [.6, 0], [1.25, .6], [.6, 1.25]]) g.box(x, y, .32, .32, 14, stool)
  g.box(.65, .65, .2, .2, 22, '#55525e').box(.35, .35, .9, .9, 3, ['#f4f1e8', '#d8d4c8', '#b9b5a8'], 22)
  g.blob(.7, .75, 25, 0, -2, 3, 2, '#8a5a3a').blob(1, .7, 25, 0, -2, 3, 2, '#e8dcc0')
}
export function notice(g: Painter) {
  for (const x of [.1, 1.6]) g.box(x, .1, .1, .1, 60, '#5a3d2a')
  g.box(0, 0, 1.8, .12, 34, ['#7a5236', '#5a3d2a', '#4a3020'], 30).front(.08, .12, 1.64, 34, 26, '#c9925c').front(.08, .12, 1.64, 58, 5, '#2f6f4f')
  for (const [x, z, c] of [[.15, 38, WHITE], [.6, 44, '#fff2a8'], [1.05, 37, WHITE], [1.3, 47, '#bfe3f2']] as const) g.front(x, .12, .35, z, 9, c)
}
export function shelter(g: Painter, roof: boolean) {
  const w = 4.6, d = 1.6
  if (roof) {
    g.box(0, 0, w, d, 6, ['#e8edf0', '#b9c2c9', '#8a939b'], 78).floor(.1, .1, w - .2, d - .2, '#cfd6db', 84)
    g.front(0, d, w, 72, 6, '#2f8a4f').letters('BUS STOP', .3, d, 73, .075, 1, WHITE)
    return
  }
  for (const px of [.2, w - .3]) g.box(px, .1, .12, .12, 76, ['#b9c2c9', '#8a939b', '#6b747c'])
  g.box(.4, .05, w - .9, .12, 64, ['#d7dee2', '#c3ccd2', '#9aa4ab'], 6)
  g.front(.5, .17, 1.6, 12, 46, '#2f6f9f').front(.58, .17, 1.44, 16, 38, '#f2c14e').letters('SHIELD', .66, .17, 34, .055, 2, '#2f6f9f').front(.7, .17, 1, 18, 10, '#d9483b')
  g.front(2.4, .17, 1.6, 12, 46, '#f6f1e2').front(2.5, .17, 1.4, 50, 4, '#2f8a4f')
  for (let r = 0; r < 5; r++) g.front(2.55, .17, 1.2 - r * .15, 18 + r * 6, 2, '#6b747c')
  g.box(.6, .35, w - 1.4, .4, 3, ['#d6dcdf', '#b2bbc1', '#8a939b'], 14).box(.9, .45, .1, .1, 14, '#6b747c').box(w - 1.1, .45, .1, .1, 14, '#6b747c')
  // Route pole at the kerb end.
  g.box(w + .2, 1.9, .1, .1, 86, ['#b9c2c9', '#8a939b', '#6b747c']).box(w + .18, 2, .14, .9, 30, ['#ffffff', '#e8edf0', '#cfd6db'], 52)
  ;['#2f8a4f', '#d9483b', '#2f6f9f'].forEach((c, i) => g.side(w + .32, 2.1 + i * .25, .2, 58 + 6 * (i % 2), 9, c))
}
/** Covered linkway bay: steel posts, white gutters and a low pitched metal roof in Town Council maroon. */
export function linkwayRoof(g: Painter, a: Point, b: Point, width: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / len * width / 2, ny = (b.x - a.x) / len * width / 2
  const edge = (s: number, z: number): [number, number, number][] => [[a.x + nx * s, a.y + ny * s, z], [b.x + nx * s, b.y + ny * s, z]]
  for (const s of [1, -1]) for (const p of [a, b]) g.box(p.x + nx * s * .9 - .06, p.y + ny * s * .9 - .06, .12, .12, 72, ['#e8edf0', '#b9c2c9', '#8a939b'])
  // Two roof slopes meeting at a ridge, the slope facing the sun lighter; gutters along both eaves.
  const [l, r] = (nx + ny > 0) ? ['#8e3b3b', '#b24f4a'] : ['#b24f4a', '#8e3b3b']
  g.poly(l, [...edge(1.04, 72), ...edge(0, 80).reverse()]).poly(r, [...edge(-1.04, 72), ...edge(0, 80).reverse()])
  // Corrugation ribs down the sunlit slope.
  const ux = (b.x - a.x) / len * .04, uy = (b.y - a.y) / len * .04, sun = nx + ny > 0 ? -1.04 : 1.04
  for (let k = 1; k < len * 3; k++) {
    const t = k / (len * 3), p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    g.poly('#c8605a', [[p.x + nx * sun, p.y + ny * sun, 72], [p.x + nx * sun + ux, p.y + ny * sun + uy, 72], [p.x + ux, p.y + uy, 80], [p.x, p.y, 80]], 1, false)
  }
  for (const s of [1.04, -1.04]) g.poly('#f4f1e8', [...edge(s, 70), ...edge(s, 73).reverse()])
}
/** Concrete void-deck bench (terrazzo top on two plinths); alongY turns it to run along y. */
export function deckBench(g: Painter, alongY = false) {
  const B = (x: number, y: number, w: number, d: number, h: number, c: string | readonly [string, string, string], z = 0) => alongY ? g.box(y, x, d, w, h, c, z) : g.box(x, y, w, d, h, c, z)
  const stone = ['#cfc8b8', '#b4ac9a', '#948c7a'] as const
  B(.12, .06, .25, .33, 11, stone); B(1.03, .06, .25, .33, 11, stone)
  B(0, 0, 1.4, .45, 4, ['#e4ddcd', '#c9c1ae', '#a79f8b'], 11)
  for (const [x, c] of [[.3, '#8b8575'], [.7, '#f4efe2'], [1.1, '#8b8575']] as const) alongY ? g.dot(.22, x, 15, 0, -1, 2, 1, c) : g.dot(x, .22, 15, 0, -1, 2, 1, c)
}
/** Potted plant: glazed pot and a leafy money plant or palm. */
export function plant(g: Painter, v = 0) {
  g.box(.05, .05, .4, .4, 14, v % 2 ? ['#c9705a', '#a85a46', '#874636'] : ['#4f7fa8', '#3f6a8f', '#2f5272'])
  g.blob(.25, .25, 14, 0, -6, 10, 7, '#2f6f3a').blob(.25, .25, 14, -4, -10, 6, 6, '#4f9e4a').blob(.25, .25, 14, 4, -12, 5, 6, '#62ad55').blob(.25, .25, 14, 0, -16, 4, 4, '#8fd06a')
}
/** Drinks fridge outside a provision shop: white cabinet, lit glass door, brand header. */
export function fridge(g: Painter) {
  g.box(0, 0, .6, .5, 40, ['#f4f1e8', '#e0e4e7', '#bfc6cc'])
  g.front(.06, .5, .48, 6, 28, '#2f3a40').front(.09, .5, .42, 8, 24, '#bfe3f2')
  for (const z of [12, 18, 24]) for (let k = 0; k < 5; k++) g.front(.1 + k * .08, .5, .05, z, 5, ['#d9483b', '#2f8a4f', '#f2c14e', '#3f6fa0', '#e8532f'][(k + z) % 5])
  g.front(0, .5, .6, 34, 6, '#d9483b')
}
/** Stacked fruit and vegetable crates on a low stand, as spilled out of a minimart onto the walkway. */
export function crates(g: Painter, v = 0) {
  const wood = ['#d7a96c', '#b8874e', '#8f6536'] as const
  g.box(0, 0, 1.2, .55, 10, ['#9aa4ab', '#7c868e', '#5e6870'])
  const fruit = [['#e5793e', '#d9483b', '#f2c14e'], ['#7cc04a', '#f2c14e', '#a8424a'], ['#e5793e', '#7cc04a', '#d9483b']][v % 3]
  fruit.forEach((c, i) => {
    g.box(.04 + i * .39, .04, .36, .47, 9, wood, 10)
    for (let j = 0; j < 3; j++) g.blob(.22 + i * .39, .15 + j * .13, 19, 0, -1, 3, 2, c)
  })
  g.box(.1, .05, .3, .3, 7, wood, 19).box(.7, .1, .38, .32, 10, ['#e8e1d0', '#cfc6b3', '#ab9f88'], 19)
}

// ------------------------------------------------------------------ buildings
const SIDE = .88, LIT = ['#a8762e', '#b4864a', '#9a8e78', '#a06a2a'], AC = ['#eef1f3', '#d6dbdf', '#b4bcc4'] as const
const PRODUCTS = ['#d9483b', '#2f8a4f', '#f2c14e', '#3f6fa0', '#e8532f', '#f4f1e8', '#9b6fc9']
const SHOP_NAMES = ['BAKERY', 'CLINIC', 'TAILOR', 'FLORIST', 'OPTICAL', 'SALON', 'HARDWARE', 'PHARMACY', 'TRAVEL', 'BOOKS', 'MOBILE', 'LAUNDRY', 'RICE', 'TOYS', 'DENTAL', 'KOPI']
const dim = (c: string, f: number) => {
  const n = Number.parseInt(c.slice(1), 16), ch = (s: number) => Math.round(((n >> s) & 255) * f)
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')
}
type Face = (t: number, z: number, l: number, h: number, c: string) => void
type Letters = (text: string, t: number, z: number, unit: number, px: number, c: string) => void
/** A visible wall in its own frame: t along the wall, z up. In lit mode only light sources paint (the night layer). */
type Faces = {
  len: number; lit: boolean; face: Face; raw: Face; letters: Letters; rawLetters: Letters
  /** A box standing proud of the wall: out tiles deep, starting off tiles in front of it. */
  prism: (t: number, z: number, l: number, h: number, out: number, c: string | readonly [string, string, string], off?: number) => void
  blob: (t: number, z: number, dx: number, dy: number, rx: number, ry: number, c: string, out?: number) => void
  /** Pixel-font sign text (Painter.sign); false before the font loads. */
  text: (text: string, t: number, z: number, unit: number, px: number, c: string) => boolean
}
/** The two faces the camera sees: front (y + d, running along x) and side (x + w, running along y, in shade). */
function visibleFaces(g: Painter, b: { x: number; y: number; w: number; d: number }, lit = false): { front: Faces; side: Faces } {
  const none = () => {}
  const make = (len: number, raw: Face, rawLetters: Letters, prism: Faces['prism'], at: (t: number, out: number) => Point, text: Faces['text']): Faces => ({ text: lit ? () => true : text,
    len, lit, raw, rawLetters, face: lit ? none : raw, letters: lit ? none : rawLetters, prism: lit ? none : prism,
    blob: lit ? none : (t, z, dx, dy, rx, ry, c, out = 0) => { const p = at(t, out); g.blob(p.x, p.y, z, dx, dy, rx, ry, c) },
  })
  return {
    front: make(b.w, (t, z, l, h, c) => g.front(b.x + t, b.y + b.d, l, z, h, c), (s, t, z, u, px, c) => g.letters(s, b.x + t, b.y + b.d, z, u, px, c),
      (t, z, l, h, out, c, off = 0) => g.box(b.x + t, b.y + b.d + off, l, out, h, c, z), (t, out) => ({ x: b.x + t, y: b.y + b.d + out }), (s, t, z, u, px, c) => g.sign(s, b.x + t, b.y + b.d, z, u, px, c)),
    side: make(b.d, (t, z, l, h, c) => g.side(b.x + b.w, b.y + t, l, z, h, dim(c, SIDE)), (s, t, z, u, px, c) => g.letters(s, b.x + b.w, b.y + t, z, u, px, dim(c, SIDE), true),
      (t, z, l, h, out, c, off = 0) => g.box(b.x + b.w + off, b.y + t, out, l, h, c, z), (t, out) => ({ x: b.x + b.w + out, y: b.y + t }), (s, t, z, u, px, c) => g.sign(s, b.x + b.w, b.y + t, z, u, px, dim(c, SIDE), true)),
  }
}
/** Window glass: sky reflection by day; at night a share of homes (every shop) light up in warm or cool white. */
function glass(f: Faces, t: number, z: number, l: number, h: number, seed: number, always = false) {
  if (!f.lit) { f.face(t, z, l, h, GLASS); f.face(t, z + Math.round(h * .55), l * .4, Math.max(2, Math.round(h * .25)), '#b8e0ec') }
  else if (always || hash(seed) > .45) f.raw(t, z, l, h, LIT[Math.floor(hash(seed * 1.3 + 7) * LIT.length)])
}
/** Letter pixel sizes that stay crisp on a 2:1 wall (whole even pixels across): 4, 3 or 2 px wide. */
const fit = (chars: number, room: number) => [.125, .09375, .0625].find(u => u * chars <= room) ?? .0625
/** Signboard text centred on a face at height z, on a plate; the lettering glows at night. */
function sign(f: Faces, text: string, centre: number, z: number, plate: string, ink: string, maxLen = f.len - .6) {
  const chars = text.length * 4 - 1, unit = fit(chars, maxLen), px = unit > .1 ? 4 : 3, w = chars * unit
  const t0 = Math.round((centre - w / 2) * 32) / 32
  f.face(t0 - .2, z - 4, w + .4, px * 5 + 8, plate)
  f.face(t0 - .2, z - 4, w + .4, 2, dim(plate, .7))
  f.letters(text, t0, z, unit, px, ink)
  if (f.lit) f.rawLetters(text, t0, z, unit, px, ink)
}
/** A neighbourhood shop bay: pilasters, roller-shutter box, recessed glazed front with stocked shelves, striped awning
 *  and its own signboard. goods: crates and a drinks fridge stand out on the five-foot way. */
function shopBay(f: Faces, t: number, w: number, seed: number, o: { door?: boolean; name?: string; awning?: string | false; plate?: string; goods?: boolean; signs?: boolean; h?: number } = {}) {
  const c = o.awning || AWNINGS[seed % AWNINGS.length], H = o.h ?? 60
  f.face(t, 0, w, H + 24, '#efe6d0')
  f.face(t + .16, 0, w - .32, H - 6, '#3e474c')
  glass(f, t + .24, 3, w - .48, H - 14, seed, true)
  if (!f.lit) {
    for (const z of [10, 22, 34].filter(z => z + 8 < H - 12)) {
      f.face(t + .28, z, w - .56, 2, '#e8edf0')
      for (let k = 0; k * .16 + .34 < w - .4; k++) f.face(t + .3 + k * .16, z + 2, .1, 5 + ((k + seed) % 3) * 2, PRODUCTS[(k * 3 + seed + z) % PRODUCTS.length])
    }
    for (let k = 1; k < 3; k++) f.face(t + .24 + (w - .48) * k / 3, 3, .0625, H - 14, '#5e6b70')
  }
  if (o.door) {
    f.face(t + w / 2 - .5, 0, 1, H - 8, '#2f383d')
    glass(f, t + w / 2 - .44, 0, .88, H - 12, seed + 1, true)
    f.face(t + w / 2 - .02, 0, .0625, H - 12, '#2f383d'); f.face(t + w / 2 + .1, 22, .0625, 8, '#c9d1d7')
    f.face(t + w / 2 - .42, 36, .34, 6, '#d9483b')
  }
  // Roller-shutter box; some neighbours have theirs half down.
  f.face(t + .16, H - 8, w - .32, 8, '#9aa4ab')
  for (let k = 0; k < 3; k++) f.face(t + .16, H - 7 + k * 3, w - .32, 1, '#7c868e')
  if (!o.door && hash(seed * 1.9) > .72) for (let k = 0; k < 6; k++) f.face(t + .24, H - 10 - k * 3, w - .48, 3, k % 2 ? '#aeb6bc' : '#c3cad0')
  if (o.signs !== false) sign(f, o.name ?? SHOP_NAMES[seed % SHOP_NAMES.length], t + w / 2, H + 8, o.plate ?? dim(c, .55), '#fff8e6', w - .4)
  // Awning: alternating stripes standing out over the walkway, with a scalloped valance.
  const n = Math.max(3, Math.round(w / .32)), sw = (w - .1) / n
  if (o.awning !== false) for (let k = 0; k < n; k++) {
    const col = k % 2 ? '#f6f1e2' : c
    f.prism(t + .05 + k * sw, H - 2, sw, 3, .7, col)
    f.prism(t + .05 + k * sw, H - 7, sw, 5, .03, col, .7)
  }
  if (o.goods && !f.lit) {
    const crateAt = (u: number, fruit: string) => { f.prism(t + u, 0, .45, 9, .4, ['#d7a96c', '#b8874e', '#8f6536'], .05); for (let i = 0; i < 2; i++) f.blob(t + u + .12 + i * .2, 9, 0, -2, 3, 2, fruit, .25) }
    crateAt(.2, '#e5793e'); if (!o.door) crateAt(.7, '#d9483b')
    f.prism(t + w - .65, 0, .5, 30, .35, ['#f4f1e8', '#e0e4e7', '#bfc6cc'], .05)
    f.prism(t + w - .6, 5, .4, 20, .01, '#bfe3f2', .4)
  }
}

// HDB storeys. Two generations of facade alternate across the estate: the open common-corridor side (parapets, metal
// rail, front doors with gates, potted plants) and the service side (sliding windows with grilles, service yards with
// ventilation slots and laundry poles, air-conditioner compressors on ledges). Bay = one flat, 3 tiles wide.
function corridorStorey(f: Faces, z: number, len: number, skip: (t: number) => boolean, accent: string, wall: string, id: number, gen: number) {
  f.face(0, z, len, STOREY, '#cdbfa1')
  f.face(0, z + STOREY - 10, len, 6, '#a3967c')
  for (let u = .3; u + 2.8 < len; u += 3) {
    if (skip(u + 1.5)) continue
    f.face(u + .3, z + 4, .6, 34, '#5c3f2c'); f.face(u + .36, z + 6, .48, 30, '#8a6446')
    for (let k = 0; k < 4; k++) f.face(u + .36 + k * .125, z + 6, .0625, 30, '#3a3f45')
    f.face(u + 1.15, z + 14, 1.3, 22, '#f4f1e8'); glass(f, u + 1.2, z + 16, 1.2, 18, id + u)
    if (!f.lit) for (let k = 0; k < 6; k++) f.face(u + 1.22 + k * .2, z + 15, .0625, 20, '#4a5058')
    if (f.lit && hash(id + u * 1.7) > .3) f.raw(u + .5, z + STOREY - 9, .6, 2, '#a89a7a')
  }
  // Waist-high parapet with its coping, and a tubular rail above it.
  f.face(0, z, len, 22, wall)
  f.face(0, z + 20, len, 3, gen === 0 ? accent : '#f8f2e2')
  if (gen === 1) f.face(0, z + 8, len, 3, accent)
  f.face(0, z + 28, len, 2, '#8a939b')
  for (let u = .2; u < len; u += .6) f.face(u, z + 22, .0625, 7, '#8a939b')
  for (let u = 1; u < len - 1; u += 1.3) if (hash(id + u * 3.3) > .62 && !skip(u)) {
    f.prism(u, z + 23, .25, 5, .2, ['#c9705a', '#a85a46', '#874636'])
    f.blob(u + .12, z + 28, 0, -3, 5, 4, hash(id + u) > .5 ? '#4f9e4a' : '#62ad55', .1)
  }
  for (let u = 0; u <= len; u += 3) f.face(Math.min(u, len - .22), z, .22, STOREY, gen === 2 ? accent : '#f6efdf')
  f.face(0, z + STOREY - 4, len, 4, '#ece2c9')
}
function serviceStorey(f: Faces, z: number, len: number, skip: (t: number) => boolean, accent: string, wall: string, id: number, gen: number) {
  f.face(0, z, len, STOREY, wall)
  if (gen !== 1) f.face(0, z + STOREY - 8, len, 3, accent)
  for (let u = .3; u + 2.8 < len; u += 3) {
    if (skip(u + 1.5)) continue
    const k = hash(id + u * 3)
    // Service yard: a recess with ventilation slots and a rack of bamboo-style laundry poles.
    f.face(u + .2, z + 6, .9, 40, '#bdb196')
    for (let v = 0; v < 4; v++) f.face(u + .3 + v * .19, z + 30, .0625, 12, '#7d7360')
    if (k > .3) {
      for (let p = 0; p < 3; p++) f.prism(u + .32 + p * .25, z + 36, .05, 2, .85, '#d6dbdf', .02)
      for (let c = 0; c < 4; c++) if (hash(id + u + c) > .3) f.prism(u + .3 + (c % 3) * .25, z + 24, .05, 11, .22, ['#e46f6f', '#7fb7e0', '#f6d36b', '#f4f1e8', '#9b6fc9'][(c + Math.floor(k * 9)) % 5], .2 + (c > 2 ? .35 : c * .18))
    }
    // Sliding windows (two leaves), half of them behind grilles.
    f.face(u + 1.3, z + 14, 1.45, 24, '#f4f1e8')
    glass(f, u + 1.36, z + 16, .64, 20, id + u); glass(f, u + 2.04, z + 16, .64, 20, id + u + .5)
    f.face(u + 2, z + 15, .0625, 22, '#c3ccd2')
    if (k < .5 && !f.lit) for (let v = 0; v < 7; v++) f.face(u + 1.36 + v * .2, z + 15, .0625, 22, '#4a5058')
    // Air-conditioner compressor on its ledge, fan grille facing out.
    if (k > .2) {
      const ax = u + 1.5 + (k > .6 ? .6 : 0)
      f.prism(ax - .05, z + 3, .65, 2, .32, ['#cfc8b8', '#b4ac9a', '#948c7a'])
      f.prism(ax, z + 5, .55, 11, .28, AC)
      f.prism(ax + .06, z + 7, .26, 7, .01, '#6b747c', .28)
    }
  }
  for (let u = 0; u <= len; u += 3) f.face(Math.min(u, len - .16), z, .16, STOREY, gen === 1 ? accent : '#f6efdf')
  f.face(0, z + STOREY - 4, len, 4, '#ece2c9')
}
/** Gable end: breeze-block staircase ventilation in every storey and a corner flat's window. */
function endStorey(f: Faces, z: number, id: number) {
  if (f.len < 3) return
  const vx = f.len - 1.5
  f.face(vx, z + 6, 1.05, 44, '#e3d8bf')
  if (!f.lit) for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) f.face(vx + .08 + c * .25, z + 9 + r * 8, .1875, 5, '#8d826d')
  if (f.len > 5) { f.face(1, z + 14, .9, 22, '#f4f1e8'); glass(f, 1.05, z + 16, .8, 18, id + 91) }
}

/** The upper floors of a void-deck block (cut away when the player is under or just in front). lit: the night layer. */
export function hdbUpper(g: Painter, b: Building, lit = false) {
  const [wall, shade, accent, dark] = PALETTES[b.palette], h = b.storeys * STOREY, top = DECK_H + h
  const fr = blockFrame(b), { front, side } = visibleFaces(g, b, lit)
  const long = b.alongX ? front : side, end = b.alongX ? side : front
  const corridor = hash(b.id * 3.1) < .55, gen = Math.floor(hash(b.id * 1.7) * 3)
  // The lift core sits over the void-deck lift lobby and rises past the roof as the motor room.
  const lobby = fr.length / 2 - (b.unit ? Math.min(5, fr.length / 3) / 2 : 0), shaft = (t: number) => Math.abs(t - lobby - .1) < 2
  if (!lit) g.box(b.x, b.y, b.w, b.d, h, [wall, wall, shade], DECK_H)
  for (let s = 0; s < b.storeys; s++) {
    const z = DECK_H + s * STOREY, id = b.id * 31 + s * 7
    if (!b.showcase) (corridor ? corridorStorey : serviceStorey)(long, z, fr.length, shaft, accent, wall, id, gen)
    endStorey(end, z, id)
  }
  if (b.showcase) framedFacade(g, b, lit, shaft)
  long.face(lobby - 1.4, DECK_H, 3, h, wall)
  long.face(lobby - 1.4, DECK_H, .2, h, '#f6efdf'); long.face(lobby + 1.4, DECK_H, .2, h, '#f6efdf')
  for (let s = 0; s < b.storeys; s++) {
    const z = DECK_H + s * STOREY
    for (let v = 0; v < 6; v++) long.face(lobby - .6 + v * .25, z + 34, .125, 8, '#8d826d')
    long.face(lobby - .6, z + 12, 1.4, 3, accent)
    if (lit) long.raw(lobby - .5, z + 20, 1.2, 8, '#a8946a')
  }
  for (let t = 12; t < fr.length - 2; t += 12) if (!shaft(t)) long.face(t, DECK_H, .0625, h, '#b3a78d')
  end.face(.35, DECK_H, .35, h, accent)
  // Block number painted large near the top of the gable, the way every HDB block is labelled.
  if (b.number && end.len >= 2.5) {
    const chars = b.number.length * 4 - 1, unit = [.25, .1875, .125].find(u => u * chars <= end.len - 1.2) ?? .125, px = Math.round(unit * 28)
    const t0 = Math.round(((end.len - chars * unit) / 2 + .2) * 32) / 32
    end.letters(b.number, t0, top - 14 - px * 5, unit, px, dark)
  }
  // Rooftop: parapet, lift motor room with louvres, water tank on its stand.
  if (lit) return
  roofKit(g, b, top, accent, b.id)
  const m = fr.rect(lobby - 1.3, fr.depth * .25, 2.8, fr.depth * .5)
  g.box(m.x, m.y, m.w, m.d, 30, [wall, wall, shade], top)
  const mf = visibleFaces(g, m), ml = b.alongX ? mf.front : mf.side
  for (let v = 0; v < 6; v++) ml.face(.4 + v * .35, top + 10, .2, 12, '#8d826d')
  ml.face(0, top + 26, ml.len, 4, accent)
  const k = fr.rect(Math.min(fr.length - 4, lobby + 3), fr.depth * .3, 1.6, 1.6)
  for (const [dx, dy] of [[.1, .1], [1.3, .1], [.1, 1.3], [1.3, 1.3]]) g.box(k.x + dx, k.y + dy, .15, .15, 12, '#9aa4ab', top)
  g.box(k.x, k.y, 1.6, 1.6, 16, ['#dfe3e6', '#c3ccd2', '#9aa4ab'], top + 12)
}
/** What stays of the upper floors while the player is under the deck: the first-floor slab edge and the beams that tie
 *  each pillar line back to the core, so the deck still reads as a structure rather than loose columns. */
export function hdbCut(g: Painter, b: Building) {
  const [, , accent] = PALETTES[b.palette], fr = blockFrame(b), { front, side } = visibleFaces(g, b)
  const concrete = ['#efe6d0', '#e3d8bf', '#c7bb9f'] as const
  const edge = fr.rect(0, fr.depth - .5, fr.length, .5)
  g.box(edge.x, edge.y, edge.w, edge.d, 14, concrete, DECK_H - 8)
  front.face(0, DECK_H - 2, b.w, 2, accent); side.face(0, DECK_H - 2, b.d, 2, accent)
}
/** Void-deck back wall: tiled dado, letterboxes, Town Council noticeboard, lift lobby with its block plate, wall lamps. */
export function deckWall(g: Painter, b: Building) {
  const [wall, shade, accent, dark] = PALETTES[b.palette], fr = blockFrame(b)
  const r = fr.rect(0, 0, fr.length, .6)
  g.box(r.x, r.y, r.w, r.d, DECK_H, [wall, wall, shade])
  const at = (t: number, z: number, l: number, h: number, c: string) => b.alongX ? g.front(b.x + t, b.y + .6, l, z, h, c) : g.side(b.x + .6, b.y + t, l, z, h, dim(c, SIDE))
  const text = (s: string, t: number, z: number, unit: number, px: number, c: string) => b.alongX ? g.letters(s, b.x + t, b.y + .6, z, unit, px, c) : g.letters(s, b.x + .6, b.y + t, z, unit, px, dim(c, SIDE), true)
  // Ceramic dado: square tiles with pale grout, and a skirting.
  at(0, 0, fr.length, 32, accent)
  for (let u = 0; u < fr.length; u += .25) at(u, 0, .0625, 32, '#e8e1d0')
  for (const z of [8, 16, 24]) at(0, z, fr.length, 1, '#e8e1d0')
  at(0, 0, fr.length, 3, dark); at(0, 32, fr.length, 2, '#f8f2e2')
  const mid = fr.length / 2 - (b.unit ? Math.min(5, fr.length / 3) / 2 : 0)
  // Letterboxes: a steel cabinet of numbered boxes, each with its slot.
  at(mid - 5, 8, 3, 52, '#7c868e')
  for (let r2 = 0; r2 < 5; r2++) for (let c = 0; c < 7; c++) { at(mid - 4.94 + c * .41, 11 + r2 * 9.5, .375, 8, '#c9d1d7'); at(mid - 4.88 + c * .41, 16 + r2 * 9.5, .25, 1, '#2a2f36') }
  at(mid - 5, 60, 3, 4, '#5e6870')
  // Noticeboard: glass-fronted case under a Town Council header.
  at(mid + 2.3, 26, 2.2, 40, '#5a3d2a'); at(mid + 2.4, 28, 2, 30, '#c9925c'); at(mid + 2.3, 58, 2.2, 8, '#2f6f4f')
  text('NOTICE', mid + 2.62, 59, .0625, 1, '#fff8e6')
  for (const [px, pz, c] of [[.1, 32, WHITE], [.55, 38, '#fff2a8'], [1, 31, WHITE], [1.45, 40, '#bfe3f2'], [1.5, 30, '#f6c6c6']] as const) at(mid + 2.4 + px, pz, .375, 10, c)
  // Lift lobby: a recessed bay with two steel lift doors, floor indicators, call buttons and the block plate above.
  at(mid - 1.6, 0, 3.4, 72, '#d9cfb8')
  at(mid - 1.5, 0, 3.2, 3, '#8d857a')
  for (const lx of [mid - 1.3, mid + .2]) {
    at(lx, 0, 1.1, 62, '#7d868e'); at(lx + .05, 0, 1, 58, '#c3ccd2'); at(lx + .53, 0, .0625, 58, '#8c959c')
    at(lx + .3, 62, .5, 5, '#2a2f36'); at(lx + .4, 63, .25, 3, '#e8532f')
  }
  at(mid - .05, 26, .125, 8, '#5e6870'); at(mid - .02, 30, .0625, 2, '#f2c14e')
  at(mid - 1.5, 69, 3.2, 14, '#22406a')
  text(`BLK ${b.number}`.slice(0, 8), mid - 1.35, 71, .0625, 2, WHITE)
  // Wall lamps (fluorescent fittings) along the deck.
  for (let u = 2; u < fr.length - 1; u += 4) if (Math.abs(u - mid) > 2) at(u, 70, .6, 4, '#f4f1e8')
  // Resident information board beside the stair.
  at(.9, 26, 1.2, 30, '#2f6f9f'); at(1, 28, 1, 22, '#e8f1f6')
  for (let k = 0; k < 4; k++) at(1.05, 31 + k * 5, .7 - (k % 2) * .2, 1, '#5e6870')
}
export function stairCore(g: Painter, b: Building) {
  const [wall, shade, accent] = PALETTES[b.palette], fr = blockFrame(b), r = fr.rect(0, 0, 2.5, Math.min(3, fr.depth - 2))
  g.box(r.x, r.y, r.w, r.d, DECK_H, [wall, wall, shade])
  // Opening facing along the deck, with steps, a handrail and a breeze-block panel beside it.
  const open = (s: number, z: number, l: number, h: number, c: string) => b.alongX ? g.side(r.x + r.w, r.y + s, l, z, h, dim(c, SIDE)) : g.front(r.x + s, r.y + r.d, l, z, h, c)
  const depth = b.alongX ? r.d : r.w
  open(.4, 0, depth - .8, 74, '#6e6557')
  for (let i = 0; i < 8; i++) { open(.5 + i * (depth - 1) / 8, i * 8, (depth - 1) / 8, 3, '#d8cfbd'); open(.5 + i * (depth - 1) / 8, i * 8 + 3, (depth - 1) / 8, 5, '#a89c86') }
  open(.4, 0, depth - .8, 3, accent)
  const face = (s: number, z: number, l: number, h: number, c: string) => b.alongX ? g.front(r.x + s, r.y + r.d, l, z, h, c) : g.side(r.x + r.w, r.y + s, l, z, h, dim(c, SIDE))
  const wide = b.alongX ? r.w : r.d
  face(.3, 30, wide - .6, 40, '#e3d8bf')
  for (let row = 0; row < 5; row++) for (let c = 0; c * .3 + .4 < wide - .4; c++) face(.4 + c * .3, 33 + row * 7.5, .1875, 4, '#8d826d')
}
const TILES = [['#4f9d8f', '#2f7a70'], ['#c9705a', '#94492e'], ['#6fa860', '#486f3a'], ['#5b8fc4', '#2e537a'], ['#b04a52', '#843239']] as const
/** Void-deck column: painted concrete above a mosaic-tiled base (grout grid, darker skirting, a cap where it ends). */
export function pillar(g: Painter, palette: number, notice = false) {
  const [tile, dark] = TILES[palette], grout = '#efe8d8', P = PILLAR
  g.box(0, 0, P, P, DECK_H, ['#f5eedc', '#efe6d0', '#cdbf9e'])
  g.box(-.02, -.02, P + .04, P + .04, 38, [tile, tile, dim(tile, .78)])
  for (let z = 6; z < 38; z += 6) { g.front(-.02, P + .02, P + .04, z, 1, grout); g.side(P + .02, -.02, P + .04, z, 1, dim(grout, .85)) }
  for (let t = .07; t < P; t += .125) { g.front(t, P + .02, .03, 4, 34, grout); g.side(P + .02, t, .03, 4, 34, dim(grout, .85)) }
  g.box(-.03, -.03, P + .06, P + .06, 4, [dark, dark, dim(dark, .8)])
  g.box(-.03, -.03, P + .06, P + .06, 2, ['#f8f2e2', '#e3d8bf', '#c7bb9f'], 38)
  // Town Council 'No Smoking' plate on the pillar's front face: white card, red ring and bar over a cigarette.
  if (notice) {
    g.front(.08, P, .3, 46, 20, '#f4f1e8').front(.1, P, .26, 48, 2, '#9a2219').front(.1, P, .26, 62, 2, '#9a2219').front(.1, P, .03, 48, 16, '#9a2219').front(.33, P, .03, 48, 16, '#9a2219')
    g.front(.15, P, .16, 54, 3, '#5e574c').front(.12, P, .22, 55, 1, '#9a2219')
  }
}
export const pillarPositions = (b: Building) => { const f = blockFrame(b); return pillars(b).map(p => f.rect(p.x, p.y, PILLAR, PILLAR)) }

/** An enclosed ground-floor shop unit at the near end of a void-deck block. lit: its glowing shopfront for night. */
export function shopUnit(g: Painter, b: Building, lit = false) {
  const fr = blockFrame(b), unit = Math.min(5, fr.length / 3), r = fr.rect(fr.length - unit, 0, unit, fr.depth)
  const [wall, shade] = PALETTES[b.palette], mart = b.unit === 'SUNSHINE MINIMART', kopi = b.unit === 'KOPI CORNER'
  if (!lit) g.box(r.x, r.y, r.w, r.d, DECK_H, [wall, wall, shade])
  const { front, side } = visibleFaces(g, r, lit)
  const face = b.alongX ? front : side, end = b.alongX ? side : front
  if (mart && b.showcase) return martFront(g, face, end, b)
  const awning = mart ? '#2f8a4f' : kopi ? '#a8424a' : AWNINGS[b.id % AWNINGS.length]
  shopBay(face, 0, face.len, b.id, { door: true, awning, goods: mart || b.unit === 'PROVISION SHOP', signs: false, h: 50 })
  shopBay(end, 0, end.len, b.id + 1, { awning, signs: false, h: 50 })
  sign(face, b.unit!, face.len / 2, 56, mart ? '#1f6b3e' : kopi ? '#7c2a22' : '#2b4a6f', mart ? '#fff6d0' : '#ffffff')
}

/** Buildings without a void deck: shophouse blocks, malls, civic buildings, the MRT station and kiosks. */
export function building(g: Painter, b: Building, door?: Point, lit = false) {
  const { front, side } = visibleFaces(g, b, lit), [wall, shade, accent, dark] = PALETTES[b.palette]
  const doorOn = !door ? undefined : door.y >= b.y + b.d ? 'front' : door.x >= b.x + b.w ? 'side' : undefined
  const doorAt = (f: 'front' | 'side') => doorOn !== f ? undefined : f === 'front' ? door!.x - b.x : door!.y - b.y
  const long = b.w >= b.d ? front : side
  const mart = b.mission === 'shop'
  /** A row of shop bays along a face, the one holding the door made the entrance. */
  const shopRow = (f: Faces, key: number) => {
    const d = doorAt(f === front ? 'front' : 'side'), n = Math.max(1, Math.floor((f.len - .2) / 2.6)), w = (f.len - .2) / n
    for (let k = 0; k < n; k++) {
      const t = .1 + k * w, here = d !== undefined && d >= t && d < t + w
      shopBay(f, t, w, b.id * 7 + key * 13 + k, mart ? { door: here, awning: '#2f8a4f', plate: '#1f6b3e', signs: false } : { door: here })
    }
  }
  if (b.style === 'small') {
    if (!lit) g.box(b.x, b.y, b.w, b.d, 92, ['#efe4cc', '#efe4cc', '#d6c7a6'])
    shopRow(front, 0); shopRow(side, 1)
    if (lit) return
    const cx = b.x + b.w / 2, cy = b.y + b.d / 2
    g.poly('#94492e', [[b.x - .2, b.y + b.d + .2, 92], [b.x + b.w + .2, b.y + b.d + .2, 92], [cx, cy, 116]]).poly('#b8613f', [[b.x + b.w + .2, b.y - .2, 92], [b.x + b.w + .2, b.y + b.d + .2, 92], [cx, cy, 116]])
    g.poly('#d77a54', [[b.x - .2, b.y - .2, 92], [b.x + b.w + .2, b.y - .2, 92], [cx, cy, 116]]).poly('#c96a4a', [[b.x - .2, b.y - .2, 92], [b.x - .2, b.y + b.d + .2, 92], [cx, cy, 116]])
    return
  }
  const mall = b.style === 'mall', station = b.style === 'station', civic = b.style === 'civic'
  const ground = mall ? 76 : civic ? GROUND_H : 110, h = ground + (b.storeys - 1) * (mall ? 64 : STOREY)
  const body = mall ? ['#eef1f3', '#e4e9ec', '#c3ccd2'] as const : station ? ['#e8ebee', '#d8dde2', '#b4bcc4'] as const : [wall, wall, shade] as const
  if (!lit) g.box(b.x, b.y, b.w, b.d, h, body)
  for (const [f, key] of [[front, 'front'], [side, 'side']] as const) {
    if (mall) {
      f.face(.2, 0, f.len - .4, ground - 6, '#5e6b70'); glass(f, .3, 4, f.len - .6, ground - 14, b.id + (key === 'side' ? 1 : 0), true)
      for (let t = .3; t < f.len - .4; t += 1.4) f.face(t, 0, .0625, ground - 6, '#5e6b70')
      for (let s = 1; s < b.storeys; s++) { const z = ground + (s - 1) * 64; f.face(.2, z + 12, f.len - .4, 40, '#7fb6cf'); f.face(.2, z + 30, f.len - .4, 3, '#b8e0ec'); if (f.lit && hash(b.id + s) > .3) f.raw(.2, z + 12, f.len - .4, 40, LIT[2]) }
    } else if (station) {
      f.face(.2, 0, f.len - .4, ground - 8, '#5e6b70'); glass(f, .3, 4, f.len - .6, ground - 16, b.id, true)
      f.face(0, ground, f.len, 8, '#d9483b'); f.face(0, ground + 8, f.len, 4, '#2f8a4f')
      for (let s = 1; s < b.storeys; s++) f.face(.3, ground + 14 + (s - 1) * STOREY, f.len - .6, 30, '#8fbfd6')
    } else if (civic) {
      f.face(.3, 0, f.len - .6, ground - 10, '#d8cbb0')
      for (let t = .5; t + 1 < f.len; t += 1.6) { f.face(t, 10, 1, 40, WHITE); glass(f, t + .07, 12, .86, 36, b.id + t) }
      for (let s = 1; s < b.storeys; s++) for (let t = .6; t + 1 < f.len - .3; t += 1.6) { const z = ground + (s - 1) * STOREY; f.face(t, z + 14, 1, 24, WHITE); glass(f, t + .07, z + 16, .86, 20, b.id + t + s) }
      f.face(0, ground - 4, f.len, 4, accent)
    } else {
      // Shop houses: a row of shops on the ground floor, flats above (service side).
      shopRow(f, key === 'side' ? 1 : 0)
      for (let s = 1; s < b.storeys; s++) serviceStorey(f, ground + (s - 1) * STOREY, f.len, () => false, accent, wall, b.id * 31 + s * 7 + (key === 'side' ? 3 : 0), 0)
      f.face(0, ground - 2, f.len, 4, dark)
    }
    const d = doorAt(key)
    if (d !== undefined && (mall || station || civic)) {
      f.face(d - .7, 0, 1.4, 64, '#3b4a50'); glass(f, d - .62, 0, 1.24, 60, b.id + 3, true); f.face(d - .01, 0, .0625, 60, '#3b4a50')
      f.face(d - 1.2, 66, 2.4, 6, accent)
    }
  }
  const top = h
  // Names on the long face: malls and civic buildings get a big sign, the station its MRT plate, the minimart its board.
  const label = station ? 'SUNSHINE MRT' : mall || civic ? b.name.toUpperCase().replace(/[^A-Z0-9 -]/g, '') : mart ? 'SUNSHINE MINIMART' : ''
  if (label) sign(long, label, mart ? (doorAt(long === front ? 'front' : 'side') ?? long.len / 2) : long.len / 2, mart ? 84 : h - 30, station ? '#1d3b6e' : mall ? '#1f6f8b' : mart ? '#1f6b3e' : '#2f5d50', mart ? '#fff6d0' : '#ffffff', mart ? Math.min(long.len - .6, 8) : long.len - .6)
  if (lit) return
  roofKit(g, b, top, mall ? '#3f6fa0' : station ? '#d9483b' : accent, b.id)
  if (mall) mallDrum(g, b, h)
  if (/Masjid/.test(b.name)) {
    const cx = b.x + b.w / 2, cy = b.y + b.d / 2
    g.box(cx - 1, cy - 1, 2, 2, 14, ['#f2e8d0', '#e6d9bb', '#cdbf9e'], top)
    g.blob(cx, cy, top + 14, 0, -14, 30, 22, '#2f8a4f').blob(cx, cy, top + 14, -8, -22, 12, 9, '#52a86a').dot(cx, cy, top + 14, -1, -42, 2, 8, '#f2c14e')
  }
}
function roofKit(g: Painter, b: { x: number; y: number; w: number; d: number }, top: number, trim: string, seed: number) {
  const wall = '#ede3cb'
  // Roof deck: waterproofed concrete in two tones, with AC condensers dotted about.
  for (let y = 0; y < b.d; y += 2) for (let x = 0; x < b.w; x += 2) g.floor(b.x + x, b.y + y, Math.min(2, b.w - x), Math.min(2, b.d - y), ((x + y) / 2) % 2 ? '#c9c2b2' : '#c2bbab', top)
  for (let k = 0; k < Math.min(8, b.w * b.d / 30); k++) { const ax = b.x + .6 + hash(seed + k) * (b.w - 1.8), ay = b.y + .6 + hash(seed + k + 50) * (b.d - 1.6); g.box(ax, ay, .7, .5, 10, ['#e8edf0', '#c3ccd2', '#9aa4ab'], top).blob(ax + .35, ay + .25, top + 10, 0, -1, 4, 2, '#6b747c') }
  g.box(b.x, b.y, b.w, .2, 10, wall, top).box(b.x, b.y + b.d - .2, b.w, .2, 10, wall, top).box(b.x, b.y, .2, b.d, 10, wall, top).box(b.x + b.w - .2, b.y, .2, b.d, 10, wall, top)
  g.front(b.x, b.y + b.d, b.w, top + 6, 3, trim).side(b.x + b.w, b.y, b.d, top + 6, 3, dim(trim, SIDE))
}
/** Sunshine Mall's landmark: a curved glass atrium drum on the corner nearest the street, banded at every floor,
 *  under a white canopy ring, with colourful tenant banners on the flanking walls. */
function mallDrum(g: Painter, b: Building, h: number) {
  const r = Math.min(3.2, b.w * .3, b.d * .3), cx = b.x + b.w - r * .5, cy = b.y + b.d - r * .5, R = r * .72, top = h + 26
  // Facets facing the camera, drawn from the two edges in towards the nearest (45°) so nearer glass overlaps.
  const facets = Array.from({ length: 16 }, (_, k) => -60 + k * 11.25).map(a => ({ a, near: Math.abs(a + 5.6 - 45) }))
  facets.sort((p, q) => q.near - p.near)
  for (const { a } of facets) {
    const a1 = a * Math.PI / 180, a2 = (a + 11.25) * Math.PI / 180, p1 = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R], p2 = [cx + Math.cos(a2) * R, cy + Math.sin(a2) * R]
    const lit = Math.cos((a + 5.6 - 120) * Math.PI / 180) * .5 + .5, glassC = dim('#9fd0e6', .72 + lit * .3)
    const quad = (z0: number, z1: number, c: string) => g.poly(c, [[p1[0], p1[1], z0], [p2[0], p2[1], z0], [p2[0], p2[1], z1], [p1[0], p1[1], z1]])
    quad(0, top, glassC)
    for (let z = 64; z < top - 8; z += 64) quad(z, z + 6, dim('#eef1f3', .8 + lit * .2))
    quad(0, 6, '#5e6b70'); quad(58, 66, dim('#f4f1e8', .85 + lit * .15))
    if (Math.abs(a + 5.6 - 45) < 12) quad(10, 58, dim('#cfeaf4', .9))
  }
  const ring = (z: number, rr: number) => Array.from({ length: 24 }, (_, k) => { const a = k / 24 * Math.PI * 2; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, z] as [number, number, number] })
  g.poly('#c3ccd2', ring(top, R)).poly('#eef1f3', ring(top + 6, R * 1.12)).poly('#dfe3e6', ring(top + 6, R * .8))
  // Tenant banners on both visible walls.
  const { front, side } = visibleFaces(g, b)
  ;[['#d9478f', '#fff'], ['#f2a03a', '#fff'], ['#2f8a4f', '#fff'], ['#3f6fa0', '#fff']].forEach(([c], k) => {
    const f = k % 2 ? side : front, t = f.len - r - 1.6 - Math.floor(k / 2) * 1.4
    if (t > .5) { f.face(t, 90, .9, h - 110, c); f.face(t + .1, h - 34, .7, 8, '#ffffff') }
  })
}

// ------------------------------------------------------------------ precinct void-deck life (docs/art-direction.md §7)
const ring = (cx: number, cy: number, r: number, z: number, n = 16) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1, z] as [number, number, number] })
/** Round terrazzo stone table on a pedestal with four drum stools: the void-deck classic. */
export function stoneTable(g: Painter) {
  const stone = ['#d8d0c0', '#bfb6a3', '#958c79'] as const, c = .75
  const drum = (x: number, y: number, r: number, h: number, z = 0) => {
    for (let k = 0; k < 8; k++) { const a1 = (k / 8 + .0625) * Math.PI * 2, a2 = a1 + Math.PI / 4; if (Math.cos(a1 + Math.PI / 8) + Math.sin(a1 + Math.PI / 8) < -.3) continue
      g.poly(dim(stone[1], .82 + .18 * Math.max(0, Math.cos(a1 + Math.PI / 8 - 2.4))), [[x + Math.cos(a1) * r, y + Math.sin(a1) * r, z], [x + Math.cos(a2) * r, y + Math.sin(a2) * r, z], [x + Math.cos(a2) * r, y + Math.sin(a2) * r, z + h], [x + Math.cos(a1) * r, y + Math.sin(a1) * r, z + h]]) }
    g.poly(stone[0], ring(x, y, r, z + h, 12))
  }
  for (const [x, y] of [[c - .55, c], [c, c - .55]] as const) drum(x, y, .16, 12)
  drum(c, c, .1, 16)
  drum(c, c, .45, 3, 16)
  g.poly('#e6dfd1', ring(c - .04, c - .04, .3, 19, 12))
  for (const [x, y] of [[c + .55, c], [c, c + .55]] as const) drum(x, y, .16, 12)
}
/** Town Council recycling bin: green wheelie body, lighter lid, recycling arrows in white. */
export function recycleBin(g: Painter) {
  g.box(.04, .04, .4, .4, 26, ['#6f8a4e', '#4d6338', '#2f3d22']).box(0, 0, .48, .48, 4, ['#82a05e', '#5e7744', '#3c4d2b'], 26)
  g.front(.14, .44, .2, 10, 8, '#e8eee0').front(.18, .44, .12, 12, 4, '#4d6338')
}
/** A flattened-then-refolded cardboard box left by the letterboxes. */
export function cardboard(g: Painter) {
  g.box(0, 0, .5, .4, 12, ['#d6b07a', '#b98f58', '#94703f']).front(.05, .4, .4, 9, 2, '#e0c690')
  g.poly('#c9a068', [[0, 0, 12], [.5, 0, 12], [.42, -.12, 17], [.08, -.12, 17]])
}

// ------------------------------------------------------------------ precinct façade (docs/art-direction.md §6)
const PANEL_PAIRS = [[['#66858c', '#3c4f55'], ['#c67847', '#7c563c']], [['#c67847', '#7c563c'], ['#a4704f', '#6b4a34']], [['#66858c', '#3c4f55'], ['#a4704f', '#6b4a34']]] as const
const LAUNDRY = ['#e46f6f', '#7fb7e0', '#f6d36b', '#f4f1e8', '#9b6fc9', '#62ad55', '#3f6fa0']
/** Frame-and-infill HDB façade with real recesses: every flat a balcony / service yard (coloured back wall, door, laundry
 *  pole and clothes, steel railing) beside a recessed window with grille and AC ledge, inside a thick cream frame.
 *  Recess geometry is clipped to what shows through the opening: a point s tiles deep appears s further along and 32s
 *  px higher, so the back wall, the visible jamb and the balcony floor are trimmed by that shift. */
function framedFacade(g: Painter, b: Building, lit: boolean, shaft: (t: number) => boolean) {
  const [wall] = PALETTES[b.palette], fr = blockFrame(b), len = fr.length, onX = b.alongX
  const W = (t: number, s: number, z: number): [number, number, number] => onX ? [b.x + t, b.y + b.d - s, z] : [b.x + b.w - s, b.y + t, z]
  const quad = (c: string, pts: [number, number, number][]) => { if (!lit) g.poly(c, pts.map(([t, s, z]) => W(t, s, z))) }
  const face = (t: number, s: number, z: number, l: number, h: number, c: string) => quad(onX ? c : dim(c, SIDE), [[t, s, z], [t + l, s, z], [t + l, s, z + h], [t, s, z + h]])
  const glow = (t: number, s: number, z: number, l: number, h: number, seed: number, odds = .45) => {
    if (lit) { if (hash(seed) > odds) g.poly(LIT[Math.floor(hash(seed * 1.3 + 7) * LIT.length)], [W(t, s, z), W(t + l, s, z), W(t + l, s, z + h), W(t, s, z + h)]) }
    else { face(t, s, z, l, h, GLASS); face(t, s, z + Math.round(h * .55), l * .4, Math.max(2, Math.round(h * .25)), '#b8e0ec') }
  }
  const recess = (t: number, l: number, z: number, h: number, r: number, back: string, side: string, floorC: string) => {
    const top = h - 32 * r
    face(t, r, z, l - r, top, back)
    quad(onX ? dim(side, .8) : side, [[t, 0, z], [t, 0, z + h], [t, r, z + h - 32 * r], [t, r, z]])
    quad(floorC, [[t, 0, z], [t + l, 0, z], [t + l - r, r, z], [t, r, z]])
  }
  const pair = PANEL_PAIRS[Math.floor(hash(b.id * 2.3) * PANEL_PAIRS.length)]
  for (let s = 0; s < b.storeys; s++) {
    const z = DECK_H + s * STOREY, id = b.id * 31 + s * 7
    for (let u = 0, bay = 0; u + 2.9 <= len; u += 3, bay++) {
      if (shaft(u + 1.5)) continue
      const [panel, panelDark] = pair[bay % 2], bt = u + .35, bl = 1.4, r = .55, bz = z + 6, bh = 50
      // Balcony / service yard.
      recess(bt, bl, bz, bh, r, panel, panelDark, '#b6a18c')
      face(bt + .72, r, bz, .4, Math.min(34, bh - 32 * r), '#6b4a34')
      glow(bt + .1, r, bz + 12, .45, 12, id + u)
      if (!lit) {
        const ps = .28
        face(bt + .05, ps, bz + 30, bl - r - .05, 2, '#d6dbdf')
        for (let c = 0; c < 4; c++) if (hash(id + u + c) > .25) face(bt + .1 + c * .2, ps - .01, bz + 18 + (c % 2) * 3, .16, 12 - (c % 2) * 3, LAUNDRY[Math.floor(hash(id + c * 3 + u) * LAUNDRY.length)])
        face(bt, 0, bz, bl, 2, '#7c868e'); face(bt, 0, bz + 18, bl, 2, '#8a939b')
        for (let k = 1; k * .125 < bl; k++) face(bt + k * .125, 0, bz, .0625, 18, '#8a939b')
      }
      // Recessed window with frame, grille and an AC compressor on its ledge.
      const wt = u + 2, wl = .75, wr = .15
      recess(wt, wl, z + 16, 30, wr, '#f4f1e8', '#cdbf9e', '#d8cbb0')
      glow(wt + .06, wr, z + 18, wl - wr - .08, 22, id + u + .5)
      if (!lit) {
        for (let k = 0; k < 5; k++) face(wt + .03 + k * .17, 0, z + 16, .0625, 30, '#4a5058')
        face(wt - .05, 0, z + 14, wl + .1, 3, '#ece2c9')
      }
    }
    if (!lit) {
      // The frame: storey slab and spandrel bands over the infill edges.
      face(0, 0, z, len, 6, '#efe6d4'); face(0, 0, z + 5, len, 1, '#c7bb9f')
      face(0, 0, z + 56, len, 8, wall)
    }
  }
  if (!lit) for (let u = 0, bay = 0; u + 2.9 <= len; u += 3, bay++) {
    if (shaft(u + 1.5) || !(hash(b.id + bay) > .3)) continue
    // AC compressors stand proud of the wall on their brackets (drawn last so they overlap the frame).
    for (let s = 0; s < b.storeys; s++) if (hash(b.id * 7 + bay * 3 + s) > .35) {
      const z = DECK_H + s * STOREY + 4, [x, y] = W(u + 2.05, 0, 0)
      if (onX) g.box(x, y, .6, .3, 11, AC, z).front(x + .06, y + .3, .26, z + 2, 7, '#6b747c')
      else g.box(x, y, .3, .6, 11, AC, z).side(x + .3, y + .06, .26, z + 2, 7, '#6b747c')
    }
  }
}

/** Sunshine Minimart as in the locked reference: glass shopfronts packed with stock, the door on the plaza end, and a
 *  yellow box fascia with red mixed-case lettering on both visible walls (it glows at night). */
function martFront(g: Painter, face: Faces, end: Faces, b: Building) {
  shopBay(face, 0, face.len, b.id, { awning: false, signs: false, h: 52 })
  shopBay(end, 0, end.len, b.id + 1, { door: true, awning: false, signs: false, h: 52 })
  for (const f of [face, end]) {
    f.face(.1, 54, f.len - .2, 28, '#c9a032'); f.face(.15, 56, f.len - .3, 24, '#f2c94c'); f.face(.15, 78, f.len - .3, 2, '#f6d872')
    if (f.lit) f.raw(.15, 56, f.len - .3, 24, '#6a5418')
    const name = 'Sunshine Minimart', big = 17 * 8 * 2 / 32 <= f.len - .5, unit = big ? .0625 : .03125, px = big ? 2 : 1
    const t0 = Math.round((f.len - 17 * 8 * unit) / 2 * 32) / 32
    if (!f.text(name, t0, 56 + (24 - 8 * px) / 2, unit, px, '#9a2219')) sign(f, 'SUNSHINE MINIMART', f.len / 2, 62, '#f2c94c', '#9a2219')
  }
}
/** Stacked blue drink crates, bottle caps showing: the minimart's walkway stock. */
export function drinkCrates(g: Painter) {
  const blue = ['#4f6f96', '#365374', '#1f3358'] as const
  for (const [x, y, z] of [[0, 0, 0], [.45, 0, 0], [0, 0, 12], [.45, 0, 12], [.2, 0, 24]] as const) {
    g.box(x, y, .42, .42, 11, blue, z)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.dot(x + .08 + i * .13, y + .08 + j * .13, z + 11, 0, -1, 1, 1, (i + j) % 2 ? '#e8eee0' : '#d9483b')
  }
}
/** Steel pedestrian guardrail at the kerb: posts every half tile, top and mid rails, vertical infill bars. */
export function rail(g: Painter, w: number) {
  const steel = ['#d4d8db', '#a9b0b5', '#7c868e'] as const
  for (let t = 0; t <= w + .01; t += .5) g.box(t, 0, .07, .07, 30, steel)
  g.box(0, 0, w + .07, .07, 3, steel, 28).box(0, 0, w + .07, .05, 2, steel, 14)
  for (let t = .125; t < w; t += .125) g.front(t, .05, .03, 4, 24, '#b9c0c5')
}
/** Raised planting bed: precast kerb, dark soil, a skirt of tropical shrubs (the tree is placed separately). */
export function bed(g: Painter, w: number, d: number) {
  g.box(0, 0, w, d, 9, ['#e8e1d0', '#d6cdb9', '#b3a991']).floor(.12, .12, w - .24, d - .24, '#5c4632', 9)
  for (let i = 0; i < Math.round(w * 2.2); i++) {
    const x = .25 + (i / Math.round(w * 2.2)) * (w - .5), y = i % 2 ? .35 : d - .4, c = ['#3c7a3a', '#4f9e4a', '#62ad55'][i % 3]
    g.blob(x, y, 9, 0, -5, 8, 6, '#2f5f30').blob(x, y, 9, -1, -8, 6, 5, c).dot(x, y, 9, -3, -12, 2, 1, '#8fd06a')
    if (i % 4 === 1) g.dot(x, y, 9, 1, -10, 2, 2, '#e8532f')
  }
}
/** Precinct covered linkway: a barrel-vaulted grey metal roof on white posts, white gutters, a string of bulbs under
 *  each eave (they light up at night; see estateWorld pools). */
export function linkwayCurved(g: Painter, a: Point, b: Point, width: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / len * width / 2, ny = (b.x - a.x) / len * width / 2
  const P = (p: Point, s: number, z: number): [number, number, number] => [p.x + nx * s, p.y + ny * s, z]
  for (const s of [.92, -.92]) for (const p of [a, b]) { const [x, y] = P(p, s, 0); g.box(x - .06, y - .06, .12, .12, 70, ['#f4f1e8', '#dedad0', '#b9b5a8']) }
  const N = 6, arc = (k: number) => 70 + Math.round(Math.sin(k / N * Math.PI) * 12), sc = (k: number) => 1.05 - 2.1 * k / N
  const sunward = nx + ny > 0 ? 1 : -1
  for (let k = 0; k < N; k++) {
    const s0 = sc(k), s1 = sc(k + 1), lit = (s0 + s1) / 2 * sunward < 0
    g.poly(lit ? '#c8c1b1' : '#9a9283', [P(a, s0, arc(k)), P(b, s0, arc(k)), P(b, s1, arc(k + 1)), P(a, s1, arc(k + 1))])
  }
  const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len
  for (let t = .35; t < len; t += .7) for (let k = 0; k < N; k++) {
    const p = { x: a.x + ux * t, y: a.y + uy * t }, q = { x: p.x + ux * .04, y: p.y + uy * .04 }
    g.poly('#8f877a', [P(p, sc(k), arc(k)), P(q, sc(k), arc(k)), P(q, sc(k + 1), arc(k + 1)), P(p, sc(k + 1), arc(k + 1))], 1, false)
  }
  for (const s of [1.05, -1.05]) g.poly('#f4f1e8', [P(a, s, 67), P(b, s, 67), P(b, s, 71), P(a, s, 71)])
  for (const s of [.98, -.98]) for (let t = .35; t < len; t += .7) { const [x, y] = P({ x: a.x + ux * t, y: a.y + uy * t }, s, 0); g.dot(x, y, 64, 0, 0, 1, 2, '#fff4cc') }
}
