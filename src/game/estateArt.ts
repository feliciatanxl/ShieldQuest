import type { Point } from '../state/saveGame'
import { blockFrame, pillars, PILLAR, type Building } from './estateLayout'
import type { Painter } from './pixelIso'

// Estate art painters (docs/isometric-art-spec.md). Props draw at the tile origin so one baked texture serves every
// copy; buildings draw at their own position. Heights in pixels, positions in tiles.
export const DECK_H = 84, STOREY = 56, GROUND_H = 70

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
  const trunk = type === 2 ? 30 : type === 1 ? 32 : 40, z = trunk * s
  g.box(-.1, -.1, .2, .2, z, ['#8a6040', '#7a5236', '#5e3f2a'])
  if (type === 1) g.box(-.05, -.05, .1, .1, 10, ['#8a6040', '#7a5236', '#5e3f2a'], z - 4)
  const [rx, ry, lift] = type === 1 ? [48, 18, 8] : type === 2 ? [24, 30, 22] : type === 4 ? [24, 16, 10] : [34, 22, 12]
  const R = (n: number) => n * s
  g.blob(0, 0, z, 0, -R(lift), R(rx), R(ry), leaf[0])
  for (let k = 0; k < 6; k++) {
    const a = r(k) * Math.PI * 2, d = .45 + r(k + 9) * .35
    g.blob(0, 0, z, Math.cos(a) * R(rx) * d, -R(lift) + Math.sin(a) * R(ry) * d - R(4), R(rx) * (.36 + r(k + 3) * .18), R(ry) * (.38 + r(k + 5) * .15), leaf[1])
  }
  g.blob(0, 0, z, -R(rx) * .15, -R(lift) - R(ry) * .45, R(rx) * .55, R(ry) * .45, leaf[2])
  for (let k = 0; k < 4; k++) g.blob(0, 0, z, (r(k + 20) - .6) * R(rx), -R(lift) - R(ry) * (.4 + r(k + 30) * .4), R(5), R(3), leaf[3])
  if (type === 3) for (let k = 0; k < 14; k++) g.dot(0, 0, z, (r(k + 40) - .5) * R(rx) * 1.6, -R(lift) + (r(k + 60) - .7) * R(ry) * 1.4, 2, 2, k % 3 ? '#e8532f' : '#f2a03a')
  if (type === 4) for (let k = 0; k < 10; k++) g.dot(0, 0, z, (r(k + 40) - .5) * R(rx) * 1.4, -R(lift) + (r(k + 60) - .8) * R(ry) * 1.2, 2, 2, k % 2 ? '#fff6e0' : '#f6d36b')
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
export function bikes(g: Painter) {
  g.box(0, 0, .06, 1.4, 14, '#8a939b').box(1.7, 0, .06, 1.4, 14, '#8a939b').box(0, 0, 1.76, .06, 2, '#8a939b', 14)
  ;['#d9483b', '#2f6f9f', '#e8b04a'].forEach((c, i) => {
    const by = .3 + i * .42
    for (const wx of [.25, 1.25]) g.blob(wx, by, 9, 0, 0, 9, 9, '#2a2f36').blob(wx, by, 9, 0, 0, 6, 6, '#c9d1d7').blob(wx, by, 9, 0, 0, 1, 1, '#2a2f36')
    g.front(.3, by, 1, 12, 2, c).front(.6, by, .08, 12, 8, c).front(.5, by, .3, 20, 2, '#2a2f36').front(1.2, by, .06, 12, 12, c)
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
export function linkwayRoof(g: Painter, a: Point, b: Point, width: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / len * width / 2, ny = (b.x - a.x) / len * width / 2
  const quad = (z: number): [number, number, number][] => [[a.x + nx, a.y + ny, z], [b.x + nx, b.y + ny, z], [b.x - nx, b.y - ny, z], [a.x - nx, a.y - ny, z]]
  g.poly('#94492e', quad(70)).poly('#d77a54', quad(76))
  g.poly('#e68e66', [[a.x + nx * .15, a.y + ny * .15, 77], [b.x + nx * .15, b.y + ny * .15, 77], [b.x - nx * .15, b.y - ny * .15, 77], [a.x - nx * .15, a.y - ny * .15, 77]])
  for (const s of [1, -1]) for (const p of [a, b]) g.box(p.x + nx * s * .9 - .06, p.y + ny * s * .9 - .06, .12, .12, 70, ['#cfd6db', '#9aa4ab', '#7c868e'])
}

// ------------------------------------------------------------------ buildings
type Face = (t: number, z: number, l: number, h: number, c: string) => void
type Faces = { len: number; face: Face; letters: (text: string, t: number, z: number, unit: number, px: number, c: string) => void }
/** The two faces the camera sees: front (y + d, running along x) and side (x + w, running along y). */
function visibleFaces(g: Painter, b: { x: number; y: number; w: number; d: number }): { front: Faces; side: Faces } {
  return {
    front: { len: b.w, face: (t, z, l, h, c) => g.front(b.x + t, b.y + b.d, l, z, h, c), letters: (s, t, z, u, px, c) => g.letters(s, b.x + t, b.y + b.d, z, u, px, c) },
    side: { len: b.d, face: (t, z, l, h, c) => g.side(b.x + b.w, b.y + t, l, z, h, c), letters: (s, t, z, u, px, c) => g.letters(s, b.x + b.w, b.y + t, z, u, px, c, true) },
  }
}
/** Text centred on a face at height z; letter pixels scale down for long names. */
function sign(f: Faces, text: string, centre: number, z: number, plate: string, ink: string, maxLen = f.len - .6) {
  const chars = text.length * 4 - 1, unit = Math.min(.1, maxLen / chars), px = Math.max(1.5, Math.min(3.2, unit * 30)), w = chars * unit
  f.face(centre - w / 2 - .15, z - 3, w + .3, px * 5 + 6, plate)
  f.letters(text, centre - w / 2, z, unit, px, ink)
}
function shopfronts(f: Faces, from: number, to: number, seed: number, door?: number) {
  for (let t = from; t + 2.6 <= to + .01; t += 3) {
    const c = AWNINGS[(seed + Math.round(t)) % AWNINGS.length]
    f.face(t + .1, 0, 2.6, 62, '#5e6b70'); f.face(t + .18, 4, 2.44, 54, '#a9d6e2')
    for (let k = 0; k < 6; k++) f.face(t + .3 + k * .38, 8, .24, 6 + (k % 3) * 3, AWNINGS[(k + seed) % AWNINGS.length])
    f.face(t + .2, 50, 2.4, 4, '#ffffff')
    for (let k = 0; k < 6; k++) f.face(t + .1 + k * .43, 56, .43, 8, k % 2 ? '#f6f1e2' : c)
  }
  if (door !== undefined) { f.face(door - .5, 0, 1, 60, '#3b4a50'); f.face(door - .43, 0, .86, 56, '#cde8ee'); f.face(door - .01, 0, .02, 56, '#3b4a50') }
}
function windows(f: Faces, z: number, seed: number) {
  for (let t = .6; t + 1 <= f.len - .3; t += 1.6) {
    f.face(t, z + 14, 1, 24, WHITE); f.face(t + .07, z + 16, .86, 20, GLASS); f.face(t + .07, z + 26, .4, 6, '#b8e0ec')
    if (hash(seed + t) > .8) for (let k = 0; k < 3; k++) f.face(t + .15 + k * .25, z + 8, .15, 6, ['#e46f6f', '#f6d36b', '#7fb7e0'][k])
  }
}
function roofKit(g: Painter, b: { x: number; y: number; w: number; d: number }, top: number, trim: string, seed: number) {
  const wall = '#ede3cb'
  // Roof deck: waterproofed concrete in two tones, with AC condensers dotted about.
  for (let y = 0; y < b.d; y += 2) for (let x = 0; x < b.w; x += 2) g.floor(b.x + x, b.y + y, Math.min(2, b.w - x), Math.min(2, b.d - y), ((x + y) / 2) % 2 ? '#c9c2b2' : '#c2bbab', top)
  for (let k = 0; k < Math.min(8, b.w * b.d / 30); k++) { const ax = b.x + .6 + hash(seed + k) * (b.w - 1.8), ay = b.y + .6 + hash(seed + k + 50) * (b.d - 1.6); g.box(ax, ay, .7, .5, 10, ['#e8edf0', '#c3ccd2', '#9aa4ab'], top).blob(ax + .35, ay + .25, top + 10, 0, -1, 4, 2, '#6b747c') }
  g.box(b.x, b.y, b.w, .2, 10, wall, top).box(b.x, b.y + b.d - .2, b.w, .2, 10, wall, top).box(b.x, b.y, .2, b.d, 10, wall, top).box(b.x + b.w - .2, b.y, .2, b.d, 10, wall, top)
  g.front(b.x, b.y + b.d, b.w, top + 6, 3, trim).side(b.x + b.w, b.y, b.d, top + 6, 3, trim)
  if (b.w > 4 && b.d > 4) {
    const ox = b.x + b.w * (.25 + hash(seed) * .4), oy = b.y + b.d * .3
    g.box(ox, oy, Math.min(2.4, b.w / 4), Math.min(2.2, b.d / 3), 26, ['#e8dfca', '#d7cbb0', '#b9ab8e'], top)
    g.box(ox + 2.8, oy, Math.min(2.2, b.w / 5), Math.min(2, b.d / 3), 20, ['#9fc3c4', '#6fa2a6', '#4f8287'], top)
  }
}

/** The upper floors of a void-deck block (cut away when the player is under or just in front). */
export function hdbUpper(g: Painter, b: Building) {
  const [wall, shade, accent, dark] = PALETTES[b.palette], h = b.storeys * STOREY, top = DECK_H + h
  const fr = blockFrame(b), { front, side } = visibleFaces(g, b)
  const long = b.alongX ? front : side, end = b.alongX ? side : front
  g.box(b.x, b.y, b.w, b.d, h, [wall, wall, shade], DECK_H)
  for (let s = 0; s < b.storeys; s++) {
    const z = DECK_H + s * STOREY
    long.face(0, z, fr.length, 5, '#e6d9bb'); long.face(0, z + 22, fr.length, 26, '#a89a80')
    for (let u = 0; u + 2.6 < fr.length; u += 3) {
      long.face(u + .45, z + 22, .5, 24, '#7e5338'); long.face(u + .5, z + 22, .4, 22, '#5c6066')
      for (let k = 0; k < 3; k++) long.face(u + .55 + k * .12, z + 23, .04, 20, '#8b9097')
      long.face(u + 1.3, z + 28, 1.2, 16, WHITE); long.face(u + 1.36, z + 30, 1.08, 12, GLASS); long.face(u + 1.36, z + 36, .5, 6, '#b8e0ec')
    }
    long.face(0, z + 5, fr.length, 17, '#f6efdc'); long.face(0, z + 16, fr.length, 3, accent)
    for (let u = 2; u < fr.length; u += 4) if (hash(b.id + u + s) > .4) long.face(u, z + 22, .14, 4, ['#d9644a', '#e8b04a', '#c86fa0', '#52a453'][(u + s) % 4])
    long.face(0, z + 48, fr.length, 8, '#e9dec3')
    for (let u = 0; u <= fr.length; u += 3) long.face(Math.min(u, fr.length - .25), z, .25, STOREY, '#f8f2e2')
    windows(end, z, b.id + s)
  }
  end.face(.4, DECK_H, Math.min(1.4, end.len / 4), h, accent); end.face(.5, DECK_H, Math.min(1.2, end.len / 4 - .2), h, dark)
  if (b.number) end.letters(b.number, .62, top - 40, Math.min(.1, (end.len / 4 - .4) / (b.number.length * 4)), 6, WHITE)
  roofKit(g, b, top, accent, b.id)
}
export function hdbCut(g: Painter, b: Building) {
  const [, shade, accent] = PALETTES[b.palette], { front, side } = visibleFaces(g, b)
  front.face(0, DECK_H, b.w, 10, '#e6d9bb'); side.face(0, DECK_H, b.d, 10, shade)
  g.floor(b.x, b.y + b.d - .3, b.w, .3, '#8d857a', DECK_H + 10).floor(b.x + b.w - .3, b.y, .3, b.d, '#8d857a', DECK_H + 10)
  front.face(0, DECK_H + 4, b.w, 2, accent); side.face(0, DECK_H + 4, b.d, 2, accent)
}
/** Void-deck back wall: tiled dado, letterboxes, noticeboard, lift lobby with the block number. */
export function deckWall(g: Painter, b: Building) {
  const [wall, shade, accent, dark] = PALETTES[b.palette], fr = blockFrame(b)
  const r = fr.rect(0, 0, fr.length, .6)
  g.box(r.x, r.y, r.w, r.d, DECK_H, [wall, wall, shade])
  const at = (t: number, z: number, l: number, h: number, c: string) => b.alongX ? g.front(b.x + t, b.y + .6, l, z, h, c) : g.side(b.x + .6, b.y + t, l, z, h, c)
  at(0, 0, fr.length, 30, accent)
  for (let u = 0; u < fr.length; u += .5) at(u, 0, .03, 30, dark)
  const mid = fr.length / 2 - (b.unit ? Math.min(5, fr.length / 3) / 2 : 0)
  // Letterboxes left of the lobby, noticeboard right of it.
  at(mid - 5, 10, 3, 48, '#9aa4ab')
  for (let r2 = 0; r2 < 4; r2++) for (let c = 0; c < 7; c++) at(mid - 4.94 + c * .41, 13 + r2 * 11, .35, 9, '#c9d1d7')
  at(mid + 2.3, 28, 2, 36, '#5a3d2a'); at(mid + 2.4, 30, 1.8, 32, '#c9925c'); at(mid + 2.4, 56, 1.8, 6, '#2f6f4f')
  for (const [px, pz, c] of [[.1, 34, WHITE], [.6, 40, '#fff2a8'], [1.1, 33, WHITE], [1.35, 44, '#bfe3f2']] as const) at(mid + 2.3 + px, pz, .38, 9, c)
  at(mid - 1.6, 0, 3.4, 70, '#d9cfb8')
  for (const lx of [mid - 1.3, mid + .2]) { at(lx, 0, 1.1, 62, '#7d868e'); at(lx + .05, 0, 1, 58, '#c3ccd2'); at(lx + .54, 0, .02, 58, '#8c959c'); at(lx + .3, 63, .5, 5, '#2a2f36') }
  at(mid - 1.4, 72, 3, 10, '#2b4a6f')
  const label = `BLK ${b.number}`.slice(0, 9)
  if (b.alongX) g.letters(label, b.x + mid - 1.3, b.y + .6, 74, .065, 1.2, WHITE)
  else g.letters(label, b.x + .6, b.y + mid - 1.3, 74, .065, 1.2, WHITE, true)
}
export function stairCore(g: Painter, b: Building) {
  const [wall, shade, accent] = PALETTES[b.palette], fr = blockFrame(b), r = fr.rect(0, 0, 2.5, Math.min(3, fr.depth - 2))
  g.box(r.x, r.y, r.w, r.d, DECK_H, [wall, wall, shade])
  // Opening facing along the deck, with steps.
  const open = (s: number, z: number, l: number, h: number, c: string) => b.alongX ? g.side(r.x + r.w, r.y + s, l, z, h, c) : g.front(r.x + s, r.y + r.d, l, z, h, c)
  const depth = b.alongX ? r.d : r.w
  open(.4, 0, depth - .8, 74, '#6e6557')
  for (let i = 0; i < 8; i++) { open(.5 + i * (depth - 1) / 8, i * 8, (depth - 1) / 8, 3, '#d8cfbd'); open(.5 + i * (depth - 1) / 8, i * 8 + 3, (depth - 1) / 8, 5, '#a89c86') }
  open(.4, 0, depth - .8, 3, accent)
}
export function pillar(g: Painter, accent: number) {
  const [, , a, d] = PALETTES[accent]
  g.box(0, 0, PILLAR, PILLAR, DECK_H, ['#f5eedc', '#efe6d0', '#cdbf9e']).box(-.02, -.02, PILLAR + .04, PILLAR + .04, 26, [a, a, d])
}
export const pillarPositions = (b: Building) => { const f = blockFrame(b); return pillars(b).map(p => f.rect(p.x, p.y, PILLAR, PILLAR)) }

/** An enclosed ground-floor shop unit at the near end of a void-deck block. */
export function shopUnit(g: Painter, b: Building) {
  const fr = blockFrame(b), unit = Math.min(5, fr.length / 3), r = fr.rect(fr.length - unit, 0, unit, fr.depth)
  const [wall, shade] = PALETTES[b.palette], mart = b.unit === 'SUNSHINE MINIMART', kopi = b.unit === 'KOPI CORNER'
  g.box(r.x, r.y, r.w, r.d, DECK_H, [wall, wall, shade])
  const { front, side } = visibleFaces(g, r)
  const face = b.alongX ? front : side, end = b.alongX ? side : front
  const ink = mart ? '#2f8a4f' : kopi ? '#a8424a' : AWNINGS[b.id % AWNINGS.length]
  for (const f of [face, end]) {
    f.face(.15, 0, f.len - .3, 64, '#5e6b70'); f.face(.22, 4, f.len - .44, 56, '#a9d6e2')
    for (const z of [12, 26, 40]) for (let k = 0; k * .34 + .5 < f.len - .4; k++) f.face(.35 + k * .34, z, .22, 6 + (k % 3) * 2, AWNINGS[(k + z) % AWNINGS.length])
    for (let k = 0; k * .4 < f.len; k++) f.face(k * .4, 60, Math.min(.4, f.len - k * .4), 8, k % 2 ? '#f6f1e2' : ink)
  }
  face.face(face.len / 2 - .5, 0, 1, 60, '#3b4a50'); face.face(face.len / 2 - .43, 0, .86, 56, '#cde8ee')
  sign(face, b.unit!, face.len / 2, 72, mart ? '#1f6b3e' : kopi ? '#7c2a22' : '#2b4a6f', mart ? '#fff6d0' : '#ffffff')
  if (mart) {
    // Fruit crates and the ice-cream freezer just inside the shopfront line.
    const crate = (t: number, fruit: string) => {
      const p = b.alongX ? { x: r.x + t, y: r.y + r.d - .55 } : { x: r.x + r.w - .55, y: r.y + t }
      g.box(p.x, p.y, .5, .5, 18, ['#c99a62', '#a87a4a', '#875d36'])
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.blob(p.x + .14 + i * .2, p.y + .14 + j * .2, 18, 0, -2, 3, 2, fruit)
    }
    crate(.3, '#e5793e'); crate(.85, '#d9483b'); crate((b.alongX ? r.w : r.d) - .9, '#f2c14e')
  }
}

/** Buildings without a void deck: shophouse blocks, malls, civic buildings, the MRT station and kiosks. */
export function building(g: Painter, b: Building, door?: Point) {
  const { front, side } = visibleFaces(g, b), [wall, shade, accent, dark] = PALETTES[b.palette]
  const doorOn = !door ? undefined : door.y >= b.y + b.d ? 'front' : door.x >= b.x + b.w ? 'side' : undefined
  const doorAt = (f: 'front' | 'side') => doorOn !== f ? undefined : f === 'front' ? door!.x - b.x : door!.y - b.y
  const long = b.w >= b.d ? front : side
  if (b.style === 'small') {
    g.box(b.x, b.y, b.w, b.d, 58, ['#efe4cc', '#efe4cc', '#d6c7a6'])
    shopfronts(front, .2, b.w - .2, b.id, doorAt('front')); shopfronts(side, .2, b.d - .2, b.id + 1, doorAt('side'))
    const cx = b.x + b.w / 2, cy = b.y + b.d / 2
    g.poly('#94492e', [[b.x - .2, b.y + b.d + .2, 58], [b.x + b.w + .2, b.y + b.d + .2, 58], [cx, cy, 86]]).poly('#b8613f', [[b.x + b.w + .2, b.y - .2, 58], [b.x + b.w + .2, b.y + b.d + .2, 58], [cx, cy, 86]])
    g.poly('#d77a54', [[b.x - .2, b.y - .2, 58], [b.x + b.w + .2, b.y - .2, 58], [cx, cy, 86]]).poly('#c96a4a', [[b.x - .2, b.y - .2, 58], [b.x - .2, b.y + b.d + .2, 58], [cx, cy, 86]])
    return
  }
  const mall = b.style === 'mall', station = b.style === 'station', civic = b.style === 'civic'
  const ground = mall ? 76 : GROUND_H, h = ground + (b.storeys - 1) * (mall ? 64 : STOREY)
  const body = mall ? ['#eef1f3', '#e4e9ec', '#c3ccd2'] as const : station ? ['#e8ebee', '#d8dde2', '#b4bcc4'] as const : [wall, wall, shade] as const
  g.box(b.x, b.y, b.w, b.d, h, body)
  for (const [f, key] of [[front, 'front'], [side, 'side']] as const) {
    if (mall) {
      f.face(.2, 0, f.len - .4, ground - 6, '#5e6b70'); f.face(.3, 4, f.len - .6, ground - 14, '#9ccbe0')
      for (let t = .3; t < f.len - .4; t += 1.4) f.face(t, 0, .06, ground - 6, '#5e6b70')
      for (let s = 1; s < b.storeys; s++) { const z = ground + (s - 1) * 64; f.face(.2, z + 12, f.len - .4, 40, '#7fb6cf'); f.face(.2, z + 30, f.len - .4, 3, '#b8e0ec') }
    } else if (station) {
      f.face(.2, 0, f.len - .4, ground - 8, '#5e6b70'); f.face(.3, 4, f.len - .6, ground - 16, '#a9d6e2')
      f.face(0, ground, f.len, 8, '#d9483b'); f.face(0, ground + 8, f.len, 4, '#2f8a4f')
      for (let s = 1; s < b.storeys; s++) f.face(.3, ground + 14 + (s - 1) * STOREY, f.len - .6, 30, '#8fbfd6')
    } else {
      if (civic) { f.face(.3, 0, f.len - .6, ground - 10, '#d8cbb0'); for (let t = .5; t + 1 < f.len; t += 1.6) { f.face(t, 10, 1, 40, WHITE); f.face(t + .07, 12, .86, 36, GLASS) } }
      else shopfronts(f, .2, f.len - .2, b.id + (key === 'side' ? 3 : 0))
      for (let s = 1; s < b.storeys; s++) windows(f, ground + (s - 1) * STOREY, b.id + s)
      f.face(0, ground - 4, f.len, 4, civic ? accent : dark)
    }
    const d = doorAt(key)
    if (d !== undefined) {
      f.face(d - .7, 0, 1.4, 64, '#3b4a50'); f.face(d - .62, 0, 1.24, 60, '#cde8ee'); f.face(d - .01, 0, .02, 60, '#3b4a50')
      if (mall || station || civic) f.face(d - 1.2, 66, 2.4, 6, accent)
    }
  }
  const top = h
  roofKit(g, b, top, mall ? '#3f6fa0' : station ? '#d9483b' : accent, b.id)
  if (/Masjid/.test(b.name)) {
    const cx = b.x + b.w / 2, cy = b.y + b.d / 2
    g.box(cx - 1, cy - 1, 2, 2, 14, ['#f2e8d0', '#e6d9bb', '#cdbf9e'], top)
    g.blob(cx, cy, top + 14, 0, -14, 30, 22, '#2f8a4f').blob(cx, cy, top + 14, -8, -22, 12, 9, '#52a86a').dot(cx, cy, top + 14, -1, -42, 2, 8, '#f2c14e')
  }
  // Names on the long face: malls and civic buildings get a big sign, the station its MRT plate.
  const label = station ? 'SUNSHINE MRT' : mall || civic ? b.name.toUpperCase().replace(/[^A-Z0-9 -]/g, '') : b.mission === 'shop' ? 'SUNSHINE MINIMART' : ''
  if (label) sign(long, label, long.len / 2, h - 30, station ? '#1d3b6e' : mall ? '#1f6f8b' : '#2f5d50', '#ffffff')
  if (b.mission === 'shop') for (const f of [front, side]) for (let k = 0; k * .4 < f.len; k++) f.face(k * .4, 52, Math.min(.4, f.len - k * .4), 10, k % 2 ? '#f6f1e2' : '#2f8a4f')
}
