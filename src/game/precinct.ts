import type Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import { depthAt, type Footprint } from './isometric'
import { beds, buildingDepth as key, HDB, lamps, LINKWAY, MART, pillars, posts, precinctCollisions, precinctHotspots, precinctRoutes, PRECINCT_SIZE, ROAD, ROUTE_POLE, SHELTER, trees } from './precinctLayout'
import type { MapProp } from './maps'
import { Painter } from './pixelIso'
import { bake } from './pixelBake'
import { registerOverhang } from './hdbBlock'
import type { WorldLayout } from './world'

/**
 * Vertical slice: one handcrafted Sunshine Estate precinct drawn to the Habbo-style standard in
 * docs/isometric-art-spec.md (1 tile ≈ 1 m, full-size avatars, baked outlined pixel sprites, whole-number zoom).
 * Block 101 with a walkable void deck, Sunshine Minimart (the Lookout Dilemma entrance), a road with a bus stop and
 * crossing, and landscaped beds. Coordinates are tiles; heights are pixels. Layout data lives in precinctLayout.ts.
 */
export { PRECINCT_DOOR, PRECINCT_SPAWN } from './precinctLayout'
const DECK_H = 84, STOREY = 56, STOREYS = 3

const C = {
  pave: ['#d9d0be', '#d3c9b6'], deck: ['#cfc8ba', '#c8c1b2'], kerb: ['#ece8dd', '#c9c3b4', '#aaa395'] as const,
  grass: ['#7fbd5b', '#79b656'], road: '#59606a', white: '#f4f1e8', yellow: '#f0c23b',
  wall: '#f2e8d0', wallSide: '#ddd0b2', accent: '#3e9b8f', terracotta: '#d77a54', glass: '#8fc6d8',
  trunk: '#7a5236', leaf: ['#3c8a47', '#52a453', '#73bf5e', '#a5d870'], earth: '#6b5a48',
}

// ---------------------------------------------------------------- ground (one baked texture, no per-frame cost)
function ground(g: Painter) {
  const { x: W, y: D } = PRECINCT_SIZE
  // The estate sits on a slab with a visible edge, like a Habbo room.
  g.side(W, 0, D, -16, 16, '#4b4038').front(0, D, W, -16, 16, '#5d5045')
  for (let y = 0; y < D; y++) for (let x = 0; x < W; x++) g.floor(x, y, 1, 1, C.pave[(x + y) & 1])
  // Void deck terrazzo, darker under the slab and brighter towards the open front.
  for (let y = HDB.y; y < HDB.y + HDB.d; y++) for (let x = HDB.x; x < HDB.x + HDB.w; x++) g.floor(x, y, 1, 1, C.deck[(x + y) & 1])
  g.floor(HDB.x, HDB.y, HDB.w, HDB.d - 1, '#20283a', 0, .14)
  // Linkway paving, minimart apron.
  g.floor(LINKWAY.x, LINKWAY.y, LINKWAY.w, LINKWAY.d, '#cbbfa7')
  for (let y = LINKWAY.y; y < LINKWAY.y + LINKWAY.d; y += 1) g.floor(LINKWAY.x, y, LINKWAY.w, .06, '#b9ad96')
  for (let x = MART.x; x < MART.x + MART.w; x++) g.floor(x, MART.y + MART.d, 1, 1.4, ['#e6dcc6', '#ddd2bb'][x & 1])
  // Covered drain with grilles between the beds and the footpath.
  g.floor(0, 14.45, W, .4, '#7b766d')
  for (let x = .1; x < W; x += .16) g.floor(x, 14.5, .07, .3, '#9e988c')
  // Road, kerbs, Singapore lane markings, bus bay, zebra crossing and tactile strips.
  g.floor(0, ROAD.y, W, ROAD.d, C.road)
  const far = ROAD.y + ROAD.d
  for (let x = 0; x < W; x += 1) {
    g.floor(x, ROAD.y + .2, 1, .06, C.yellow).floor(x, ROAD.y + .32, 1, .06, C.yellow)
    g.floor(x, far - .38, 1, .06, C.yellow).floor(x, far - .26, 1, .06, C.yellow)
    if (x % 2 === 0 && (x < 14 || x > 17)) g.floor(x + .2, ROAD.y + ROAD.d / 2 - .04, 1, .08, C.white)
  }
  for (let x = SHELTER.x - .2; x < SHELTER.x + SHELTER.w + 1; x += .5) g.floor(x, ROAD.y + .5, .3, .06, C.yellow).floor(x, ROAD.y + 1.4, .3, .06, C.yellow)
  g.letters('BUS', SHELTER.x + 1.3, ROAD.y + .95, 0, .16, 0, C.yellow)
  g.floor(15, ROAD.y, 2, ROAD.d, C.road)
  for (let x = 15.05; x < 17; x += .42) g.floor(x, ROAD.y + .15, .24, ROAD.d - .3, C.white)
  for (const y of [ROAD.y - .55, far + .15]) for (let x = 15; x < 17; x += .2) g.floor(x, y, .2, .4, (x * 5 | 0) & 1 ? '#e2b532' : C.yellow)
  for (let x = SHELTER.x - .2; x < SHELTER.x + SHELTER.w + 1; x += .2) g.floor(x, ROAD.y - .5, .2, .3, (x * 5 | 0) & 1 ? '#e2b532' : C.yellow)
  // Raised kerbs: a 3 px face where the footpaths meet the road.
  g.box(0, ROAD.y - .15, W, .15, 3, C.kerb).box(0, far, W, .15, 3, C.kerb)
  // Fitness corner rubber mat.
  g.floor(15, 9.8, 5.5, 3.8, '#5aa363').floor(15.15, 9.95, 5.2, 3.5, '#d9744f')
}

/** Raised planting bed: concrete kerb, grass, shrubs along the edge. */
function bed(g: Painter, x: number, y: number, w: number, d: number) {
  g.box(x, y, w, d, 4, C.kerb)
  for (let j = 0; j < Math.ceil(d - .2); j++) for (let i = 0; i < Math.ceil(w - .2); i++)
    g.floor(x + .12 + i, y + .12 + j, Math.min(1, w - .24 - i), Math.min(1, d - .24 - j), C.grass[(i + j) & 1], 4)
}

// ---------------------------------------------------------------- props

function tree(g: Painter, x: number, y: number, s = 1, rain = false) {
  g.blob(x, y, 0, 0, 0, 30 * s, 13 * s, '#1c2430', .22)
  g.box(x - .1, y - .1, .2, .2, (rain ? 34 : 44) * s, C.trunk)
  const z = (rain ? 34 : 44) * s, [d, m, l, h] = C.leaf, rx = rain ? 1.35 : 1
  g.blob(x, y, z, 0, -10 * s, 34 * s * rx, 20 * s, d)
  g.blob(x, y, z, -12 * s * rx, -16 * s, 20 * s * rx, 13 * s, m).blob(x, y, z, 12 * s * rx, -14 * s, 19 * s * rx, 12 * s, m)
  g.blob(x, y, z, 0, -24 * s, 22 * s * rx, 12 * s, m)
  g.blob(x, y, z, -10 * s * rx, -26 * s, 11 * s * rx, 7 * s, l).blob(x, y, z, 8 * s * rx, -22 * s, 9 * s * rx, 6 * s, l)
  g.blob(x, y, z, -12 * s * rx, -29 * s, 4 * s, 2 * s, h).blob(x, y, z, 6 * s * rx, -26 * s, 4 * s, 2 * s, h)
}
function shrub(g: Painter, x: number, y: number, flower?: string) {
  g.blob(x, y, 4, 0, -5, 11, 7, C.leaf[0]).blob(x, y, 4, -2, -8, 7, 4, C.leaf[2])
  if (flower) for (const [dx, dy] of [[-6, -8], [3, -10], [6, -5], [-1, -4]]) g.dot(x, y, 4, dx, dy, 2, 2, flower)
}
function hedge(g: Painter, x: number, y: number, w: number, d: number, h: number) {
  g.box(x, y, w, d, h, ['#5fae55', '#3f8a45', '#2f6f3a'])
  for (let i = 0; i < w; i += .7) g.dot(x + i, y + d, h, 4, -4, 3, 2, '#8fd06a').dot(x + i + .3, y + d, h - 8, 2, 0, 2, 2, '#2f6f3a')
}
function bench(g: Painter, x: number, y: number, w: number, alongY = false) {
  const [bw, bd] = alongY ? [.45, w] : [w, .45]
  for (const t of [.1, w - .2]) g.box(alongY ? x + .12 : x + t, alongY ? y + t : y + .12, alongY ? .2 : .1, alongY ? .1 : .2, 12, '#55525e')
  g.box(x, y, bw, bd, 3, ['#e0a865', '#b87a48', '#8e5c3a'], 12)
  if (alongY) g.box(x, y, .1, w, 12, ['#e0a865', '#b87a48', '#8e5c3a'], 15)
  else g.box(x, y, w, .1, 12, ['#e0a865', '#b87a48', '#8e5c3a'], 15)
}
function lamp(g: Painter, x: number, y: number) {
  g.box(x, y, .14, .14, 92, ['#8f99a3', '#6b7580', '#4f5862'])
  g.box(x - .05, y - .5, .2, .62, 4, ['#9aa4ae', '#6b7580', '#4f5862'], 90)
  g.box(x - .02, y - .44, .14, .2, 2, ['#fff3c4', '#fff3c4', '#e7d18c'], 88)
}

/** Block 101: the upper floors (one sprite, cut away when the player is under or close in front). */
function hdbUpper(g: Painter) {
  const { x, y, w, d } = HDB, top = DECK_H + STOREYS * STOREY
  g.box(x, y, w, d, top - DECK_H, [C.wall, C.wall, C.wallSide], DECK_H)
  for (let s = 0; s < STOREYS; s++) {
    const z = DECK_H + s * STOREY
    // Common corridor: slab edge, parapet with an accent band, the shaded corridor with flat doors and windows.
    g.front(x, y + d, w, z, 5, '#e6d9bb').front(x, y + d, w, z + 22, 26, '#a89a80')
    for (let u = 0; u < w; u += 3) {
      g.front(x + u + .45, y + d, .5, z + 22, 24, '#7e5338').front(x + u + .55, y + d, .3, z + 24, 20, '#9a6a48')
      g.front(x + u + .5, y + d, .4, z + 22, 22, '#5c6066')
      for (let k = 0; k < 3; k++) g.front(x + u + .55 + k * .12, y + d, .04, z + 23, 20, '#8b9097')
      g.front(x + u + 1.3, y + d, 1.2, z + 28, 16, '#ffffff').front(x + u + 1.36, y + d, 1.08, z + 30, 12, C.glass)
      g.front(x + u + 1.36, y + d, .5, z + 36, 6, '#b8e0ec')
    }
    g.front(x, y + d, w, z + 5, 17, '#f6efdc').front(x, y + d, w, z + 16, 3, C.accent)
    for (let u = 2; u < w; u += 4) g.dot(x + u, y + d, z + 22, 0, -4, 4, 4, ['#d9644a', '#e8b04a', '#c86fa0'][u % 3]).dot(x + u, y + d, z + 22, 0, -7, 4, 3, C.leaf[1])
    g.front(x, y + d, w, z + 48, 8, '#e9dec3')
    for (let u = 0; u <= w; u += 3) g.front(x + Math.min(u, w - .25), y + d, .25, z, STOREY, '#f8f2e2')
    // End wall: accent panel and windows.
    g.side(x + w, y + 3.4, 1.4, z + 18, 22, '#ffffff').side(x + w, y + 3.48, 1.24, z + 20, 18, C.glass)
  }
  g.side(x + w, y + .6, 1.6, DECK_H, STOREYS * STOREY, C.accent).side(x + w, y + .7, 1.4, DECK_H, STOREYS * STOREY, '#46a89b')
  g.letters('101', x + w, y + .78, top - 44, .11, 6, '#ffffff', true)
  // Roof: parapet, lift motor room, water tank.
  g.box(x, y, w, .2, 10, C.wall, top).box(x, y + d - .2, w, .2, 10, C.wall, top).box(x, y, .2, d, 10, C.wall, top).box(x + w - .2, y, .2, d, 10, C.wall, top)
  g.front(x, y + d, w, top + 6, 3, C.terracotta)
  g.box(x + 12, y + 1.4, 2.2, 2.4, 30, ['#e8dfca', '#d7cbb0', '#b9ab8e'], top).box(x + 15, y + 1.6, 2.4, 2.2, 24, ['#9fc3c4', '#6fa2a6', '#4f8287'], top)
}
/** The cut edge shown instead of the upper floors: the first-storey slab only. */
function hdbCut(g: Painter) {
  const { x, y, w, d } = HDB
  g.front(x, y + d, w, DECK_H, 10, '#e6d9bb').side(x + w, y, d, DECK_H, 10, C.wallSide)
  g.floor(x, y + d - .3, w, .3, '#8d857a', DECK_H + 10).floor(x + w - .3, y, .3, d, '#8d857a', DECK_H + 10)
  g.front(x, y + d, w, DECK_H + 4, 2, C.accent)
}
function deckBackWall(g: Painter) {
  const { x, w } = HDB, y = HDB.y, d = .5
  g.box(x, y, w, d, DECK_H, [C.wall, C.wall, C.wallSide])
  const f = y + d
  g.front(x, f, w, 0, 30, C.accent)
  for (let u = x; u < x + w; u += .25) g.front(u, f, .02, 0, 30, '#358a7f')
  g.front(x, f, w, 30, 3, '#2f7a70')
  // Letterboxes: a steel bank of small numbered doors.
  g.box(8, f, 3.2, .25, 50, ['#b9c2c9', '#9aa4ab', '#7c868e'], 10)
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
    g.front(8.06 + c * .39, f + .25, .33, 13 + r * 11.5, 9, '#c9d1d7')
    g.dot(8.06 + c * .39 + .16, f + .25, 13 + r * 11.5 + 4, 0, 0, 2, 1, '#55606a')
  }
  // Noticeboard.
  g.front(11.9, f, 2, 28, 36, '#5a3d2a').front(12, f, 1.8, 30, 32, '#c9925c').front(12, f, 1.8, 56, 6, '#2f6f4f')
  for (const [px, pz, c] of [[12.1, 34, '#ffffff'], [12.55, 40, '#fff2a8'], [13.05, 33, '#ffffff'], [13.3, 44, '#bfe3f2'], [12.35, 46, '#f7c6c6']] as const)
    g.front(px, f, .38, pz, 9, c).dot(px + .2, f, pz + 9, 0, -1, 1, 1, '#d9483b')
  // Lift lobby: two lifts, floor indicators and the block number plate.
  g.front(14.4, f, 3.4, 0, 70, '#d9cfb8')
  for (const lx of [14.7, 16.2]) {
    g.front(lx, f, 1.1, 0, 62, '#7d868e').front(lx + .05, f, 1, 0, 58, '#c3ccd2').front(lx + .54, f, .02, 0, 58, '#8c959c')
    g.front(lx + .3, f, .5, 63, 5, '#2a2f36').dot(lx + .5, f, 66, -2, -1, 4, 1, '#ff6b4a')
  }
  g.front(15.95, f, .1, 30, 8, '#4a5058').dot(16, f, 34, -1, -1, 2, 2, '#ffd36b')
  g.front(14.9, f, 2.4, 72, 10, '#2b4a6f').letters('BLK 101', 15, f, 74, .07, 1.2, '#ffffff')
}
function stairCore(g: Painter) {
  g.box(2, 1, 2.5, 3, DECK_H, [C.wall, C.wall, C.wallSide])
  // Staircase opening on the deck side, steps climbing away.
  g.side(4.5, 1.5, 2, 0, 74, '#6e6557')
  for (let i = 0; i < 9; i++) g.side(4.5, 1.6 + i * .2, .2, i * 8, 3, '#d8cfbd').side(4.5, 1.6 + i * .2, .2, i * 8 + 3, 5, '#a89c86')
  g.side(4.5, 1.5, 2, 0, 3, C.accent).side(4.5, 1.6, 1.8, 30, 2, '#ffffff')
  g.front(2, 4, 2.5, 0, 30, C.accent)
  g.letters('STAIRS', 2.15, 4, 50, .09, 2, '#3e5b6a')
}
function pillar(g: Painter, x: number, y: number) {
  g.box(x, y, .45, .45, DECK_H, ['#f5eedc', '#efe6d0', '#cdbf9e'])
  g.box(x - .02, y - .02, .49, .49, 26, [C.accent, '#46a89b', '#2f7a70'])
}
function chessTable(g: Painter, x: number, y: number) {
  for (const [sx, sy] of [[-.45, .15], [.15, -.45], [.75, .15]]) g.box(x + sx, y + sy, .3, .3, 14, ['#bdb6a6', '#a39b89', '#867f6f'])
  g.box(x + .2, y + .2, .3, .3, 18, ['#bdb6a6', '#a39b89', '#867f6f'])
  g.box(x, y, .7, .7, 5, ['#d8d1c0', '#b7af9c', '#968e7c'], 18)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) & 1) g.floor(x + .1 + i * .125, y + .1 + j * .125, .125, .125, '#6f6758', 23)
}
function bikes(g: Painter, x: number, y: number) {
  g.box(x, y, .06, 1.4, 14, '#8a939b').box(x + 1.7, y, .06, 1.4, 14, '#8a939b').box(x, y, 1.76, .06, 2, '#8a939b', 14)
  ;['#d9483b', '#2f6f9f', '#e8b04a'].forEach((c, i) => {
    const by = y + .3 + i * .42
    for (const wx of [.25, 1.25]) g.blob(x + wx, by, 9, 0, 0, 9, 9, '#2a2f36').blob(x + wx, by, 9, 0, 0, 6, 6, '#c9d1d7').blob(x + wx, by, 9, 0, 0, 1, 1, '#2a2f36')
    g.front(x + .3, by, 1, 12, 2, c).front(x + .6, by, .08, 12, 8, c).front(x + .5, by, .3, 20, 2, '#2a2f36').front(x + 1.2, by, .06, 12, 12, c)
  })
}
function fitness(g: Painter) {
  // Pull-up bars, a sit-up bench and a waist twister on the rubber mat.
  for (const px of [15.6, 17.2]) g.box(px, 10.4, .14, .14, 70, ['#ffcf5a', '#e8a93a', '#bd842a'])
  g.box(15.6, 10.4, 1.74, .14, 4, ['#cfd6db', '#9aa4ab', '#7c868e'], 66)
  g.box(18.2, 10.3, .6, 1.8, 10, ['#5ab0c9', '#3d8fa8', '#2e6f84'], 0).box(18.2, 10.3, .6, .2, 12, ['#5ab0c9', '#3d8fa8', '#2e6f84'], 10)
  g.box(16.2, 12.3, .14, .14, 34, ['#ffcf5a', '#e8a93a', '#bd842a']).blob(16.27, 12.37, 0, 0, -2, 14, 7, '#d9483b').blob(16.27, 12.37, 0, 0, -3, 10, 5, '#e86a5a')
  g.box(16, 12.15, .55, .45, 3, ['#cfd6db', '#9aa4ab', '#7c868e'], 34)
}
function minimart(g: Painter) {
  const { x, y, w, d } = MART, f = y + d, h = 96
  g.box(x, y, w, d, h, ['#e3d9c5', '#ebe3d2', '#cdbfa3'])
  g.side(x + w, y + .8, 3.4, 18, 40, '#ffffff').side(x + w, y + .9, 3.2, 20, 36, C.glass)
  g.side(x + w, y + 1, 1, 22, 30, '#fff1b8').side(x + w, y + 2.4, 1.4, 24, 20, '#f2c14e')
  // Shopfront: glass with stocked shelves seen through it, the door, posters.
  g.front(x + .2, f, w - .4, 0, 70, '#5e6b70')
  g.front(x + .3, f, w - .6, 4, 62, '#a9d6e2')
  for (const sz of [14, 30, 46]) {
    g.front(x + .3, f, 2, sz, 2, '#8c6a4a').front(x + 3.4, f, 2.3, sz, 2, '#8c6a4a')
    for (let i = 0; i < 11; i++) {
      const c = ['#d9483b', '#f2c14e', '#5aa363', '#2f6f9f', '#e86a9a', '#ffffff'][(i + sz) % 6]
      if (i < 5) g.front(x + .4 + i * .34, f, .22, sz + 2, 6 + (i % 2) * 3, c)
      g.front(x + 3.5 + (i % 6) * .34, f, .22, sz + 2, 6 + (i % 3) * 2, c)
    }
  }
  g.front(x + 2.4, f, 1, 0, 66, '#3b4a50').front(x + 2.47, f, .86, 0, 62, '#cde8ee').front(x + 2.89, f, .02, 0, 62, '#3b4a50')
  g.front(x + 2.55, f, .2, 30, 3, '#ffd36b').front(x + 3.12, f, .2, 30, 3, '#ffd36b')
  g.front(x + .45, f, .7, 48, 14, '#ffffff').front(x + .5, f, .6, 50, 10, '#d9483b').letters('SALE', x + .52, f, 52, .035, 1.5, '#ffffff')
  for (let i = 0; i < 6; i++) g.front(x + .2 + i * (w - .4) / 6, f, .04, 0, 70, '#5e6b70')
  // Signboard.
  g.front(x, f, w, 74, 22, '#1f6b3e').front(x + .1, f, w - .2, 76, 18, '#2f8a4f')
  g.letters('SUNSHINE MINIMART', x + .25, f, 79, .081, 2.6, '#fff6d0')
  g.box(x, y, w, .15, 6, '#e3d9c5', h).box(x, f - .15, w, .15, 6, ['#f2c14e', '#e8a93a', '#bd842a'], h)
}
function awning(g: Painter) {
  const { x, y, w, d } = MART, f = y + d
  for (let i = 0; i < 12; i++) {
    const c = i & 1 ? '#f6f1e2' : '#2f8a4f'
    g.poly(c, [[x + i * w / 12, f, 72], [x + (i + 1) * w / 12, f, 72], [x + (i + 1) * w / 12, f + 1, 62], [x + i * w / 12, f + 1, 62]])
    g.front(x + i * w / 12, f + 1, w / 12, 56, 6, i & 1 ? '#e4dccb' : '#257543')
  }
}
function fruitCrate(g: Painter, x: number, y: number, fruit: string, leaf = '#5aa363') {
  g.box(x, y, .7, .5, 10, ['#c99a62', '#a87a4a', '#875d36'], 0).box(x, y, .7, .5, 12, ['#c99a62', '#a87a4a', '#875d36'], 12)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.blob(x + .14 + i * .2, y + .14 + j * .2, 24, 0, -2, 3, 2, fruit)
  g.dot(x + .35, y + .25, 24, 0, -5, 2, 2, leaf)
}
function freezer(g: Painter, x: number, y: number) {
  g.box(x, y, 1.2, .6, 26, ['#f4f6f8', '#e2e7eb', '#b9c2c9'])
  g.floor(x + .08, y + .08, 1.04, .44, '#9fd4e6', 26).floor(x + .1, y + .1, .4, .2, '#d9f0f8', 26)
  g.front(x + .1, y + .6, 1, 8, 12, '#2f6f9f').letters('ICE', x + .3, y + .6, 10, .07, 1.6, '#ffffff')
}
function binCentre(g: Painter) {
  g.box(20.2, 2, 1.6, 4, 40, ['#cfd2c6', '#b9bcaf', '#9da093'])
  g.side(21.8, 2.4, 3.2, 0, 34, '#5f7a72')
  for (let i = 0; i < 8; i++) g.side(21.8, 2.5 + i * .4, .04, 2, 30, '#4a625b')
}
function shelter(g: Painter, roof: boolean) {
  const { x, y, w, d } = SHELTER
  if (!roof) {
    for (const px of [x + .2, x + w - .3]) g.box(px, y + .1, .12, .12, 76, ['#b9c2c9', '#8a939b', '#6b747c'])
    // Advertising panel, seat, route map.
    g.box(x + .4, y + .05, w - .9, .12, 64, ['#d7dee2', '#c3ccd2', '#9aa4ab'], 6)
    g.front(x + .5, y + .17, 1.6, 12, 46, '#2f6f9f').front(x + .58, y + .17, 1.44, 16, 38, '#f2c14e')
    g.letters('SHIELD', x + .66, y + .17, 34, .055, 2, '#2f6f9f').front(x + .7, y + .17, 1, 18, 10, '#d9483b')
    g.front(x + 2.4, y + .17, 1.6, 12, 46, '#f6f1e2').front(x + 2.5, y + .17, 1.4, 50, 4, '#2f8a4f')
    for (let r = 0; r < 5; r++) g.front(x + 2.55, y + .17, 1.2 - r * .15, 18 + r * 6, 2, '#6b747c')
    g.box(x + .6, y + .35, w - 1.4, .4, 3, ['#d6dcdf', '#b2bbc1', '#8a939b'], 14).box(x + .9, y + .45, .1, .1, 14, '#6b747c').box(x + w - 1.1, y + .45, .1, .1, 14, '#6b747c')
    return
  }
  g.box(x, y, w, d, 6, ['#e8edf0', '#b9c2c9', '#8a939b'], 78)
  g.floor(x + .1, y + .1, w - .2, d - .2, '#cfd6db', 84)
  g.front(x, y + d, w, 72, 6, '#2f8a4f').letters('SUNSHINE EST', x + .25, y + d, 73, .075, 1, '#ffffff')
}
function routePole(g: Painter, x: number, y: number) {
  g.box(x, y, .1, .1, 86, ['#b9c2c9', '#8a939b', '#6b747c'])
  g.box(x - .02, y + .1, .14, .9, 30, ['#ffffff', '#e8edf0', '#cfd6db'], 52)
  ;['#2f8a4f', '#d9483b', '#2f6f9f'].forEach((c, i) => g.side(x + .12, y + .2 + i * .25, .2, 58 + 6 * (i % 2), 9, c))
  g.side(x + .12, y + .15, .8, 74, 6, '#d9483b')
}
function trafficLight(g: Painter, x: number, y: number) {
  g.box(x, y, .12, .12, 88, ['#4f5862', '#3c444d', '#2b3239'])
  g.box(x - .04, y + .12, .2, .2, 34, ['#3c444d', '#2b3239', '#20262c'], 60)
  for (const [z, c] of [[86, '#ff5a4a'], [76, '#4a3a2c'], [66, '#3a4a3c']] as const) g.blob(x + .06, y + .32, z, 0, -2, 3, 3, c)
  g.box(x - .03, y + .12, .18, .16, 16, ['#3c444d', '#2b3239', '#20262c'], 36)
  g.blob(x + .06, y + .28, 44, 0, -2, 2, 3, '#5ae07a')
  g.box(x + .14, y, .16, .12, 10, ['#ffd36b', '#e8b04a', '#bd842a'], 28)
}
function streetSign(g: Painter, x: number, y: number) {
  g.box(x, y, .08, .08, 70, '#6b747c')
  g.box(x - .9, y, 1.9, .06, 12, ['#2f8a4f', '#2f8a4f', '#1f6b3e'], 62)
  g.letters('SUNSHINE AVE', x - .82, y + .06, 64, .044, 1.6, '#ffffff')
}
function garden(g: Painter, x: number, y: number) {
  g.box(x, y, 1.6, .9, 8, ['#a87a4a', '#8c6a4a', '#6f5238'], 4).floor(x + .08, y + .08, 1.44, .74, '#6b4e36', 12)
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
    g.blob(x + .2 + i * .3, y + .25 + j * .4, 12, 0, -3, 5, 3, j ? '#4f9e4a' : '#6fc15a')
    if ((i + j) % 3 === 0) g.dot(x + .2 + i * .3, y + .25 + j * .4, 12, -1, -5, 2, 2, '#d9483b')
  }
}
function bin(g: Painter, x: number, y: number) {
  g.box(x, y, .36, .36, 24, ['#3f8a5a', '#2f6f4f', '#22573d']).box(x - .02, y - .02, .4, .4, 4, ['#4f9a6a', '#2f6f4f', '#22573d'], 24)
}
function linkwayPosts(g: Painter, x: number, y: number) {
  g.box(x, y, .12, .12, 74, ['#cfd6db', '#9aa4ab', '#7c868e'])
}
function linkwayRoof(g: Painter) {
  const { x, y, w, d } = LINKWAY
  g.box(x, y, w, d, 4, ['#d77a54', '#b8613f', '#94492e'], 74)
  for (let j = y; j < y + d; j += .5) g.floor(x, j, w, .05, '#c4683f', 78)
  g.box(x + w / 2 - .06, y, .12, d, 3, ['#e68e66', '#b8613f', '#94492e'], 78)
}

export function createPrecinct(scene: Phaser.Scene): WorldLayout {
  bake(scene, 'pc-ground', g => {
    ground(g)
    for (const b of beds) bed(g, b.x, b.y, b.w, b.d)
  }, -2000)
  const top = key(HDB)
  const band = registerOverhang(scene, HDB, top)
  const add = (name: string, foot: Footprint, draw: (g: Painter) => void, depth = key(foot)) => bake(scene, 'pc-' + name, draw, depth)
  // Under the void deck: everything sorts in the overhang band beneath the upper floors.
  add('deck-wall', { x: 2, y: 1, w: 18, d: .5 }, deckBackWall, band(2, 1.5))
  add('stairs', { x: 2, y: 1, w: 2.5, d: 3 }, stairCore, band(2, 4))
  pillars.forEach((p, i) => add('pillar-' + i, { ...p, w: .45, d: .45 }, g => pillar(g, p.x, p.y), band(p.x + .45, p.y + .45)))
  add('chess', { x: 7.5, y: 4.4, w: .7, d: .7 }, g => chessTable(g, 7.5, 4.4), band(8.2, 5.1))
  add('bench-deck', { x: 10.5, y: 1.7, w: 1.4, d: .45 }, g => bench(g, 10.5, 1.7, 1.4), band(11.9, 2.15))
  add('bikes', { x: 17.6, y: 2, w: 1.8, d: 1.4 }, g => bikes(g, 17.6, 2), band(19.4, 3.4))
  const upper = add('hdb-upper', HDB, hdbUpper, top)
  const cut = add('hdb-cut', HDB, hdbCut, top).setVisible(false)
  // Neighbouring buildings and street furniture.
  add('bins', { x: 20.2, y: 2, w: 1.6, d: 4 }, binCentre)
  add('minimart', MART, minimart)
  add('awning', { x: MART.x, y: MART.y + MART.d, w: MART.w, d: 1 }, awning, depthAt(MART.x + MART.w, MART.y + MART.d + 1))
  ;([[22.3, 7.7, '#e5793e'], [23.1, 7.7, '#d9483b'], [25.7, 7.8, '#f2c14e']] as const).forEach(([x, y, c], i) => add('crate-' + i, { x, y, w: .7, d: .5 }, g => fruitCrate(g, x, y, c)))
  add('freezer', { x: 26.5, y: 7.7, w: 1.2, d: .6 }, g => freezer(g, 26.5, 7.7))
  add('hedge-back', { x: 0, y: 0, w: 30, d: 1 }, g => hedge(g, 0, 0, 30, 1, 20))
  add('hedge-front', { x: 0, y: 23.4, w: 30, d: .6 }, g => hedge(g, 0, 23.4, 30, .6, 16))
  add('hedge-right', { x: 29.4, y: 7.5, w: .6, d: 7 }, g => hedge(g, 29.4, 7.5, .6, 7, 18))
  trees.forEach(([x, y, s, rain], i) => add('tree-' + i, { x: x - .1, y: y - .1, w: .2, d: .2 }, g => tree(g, x, y, s, rain)))
  ;([[1, 5.5], [1.1, 10.4], [9.2, 9.6, '#f2a0c8'], [13.3, 9.7], [9, 13.6, '#f2a0c8'], [11.5, 13.7], [13.4, 11.4, '#ffd36b'], [22.6, 10.6], [22.8, 13.6, '#f2a0c8'],
    [28.8, 10.6], [29.3, 6.8], [28.7, 2]] as [number, number, string?][]).forEach(([x, y, f], i) => add('shrub-' + i, { x: x - .2, y: y - .2, w: .4, d: .4 }, g => shrub(g, x, y, f)))
  add('garden-0', { x: 25, y: 10.6, w: 1.6, d: .9 }, g => garden(g, 25, 10.6))
  add('garden-1', { x: 25.4, y: 12.3, w: 1.6, d: .9 }, g => garden(g, 25.4, 12.3))
  add('fitness', { x: 15.6, y: 10.3, w: 3.2, d: 2.5 }, fitness)
  add('bench-0', { x: 9.8, y: 15.1, w: 1.4, d: .45 }, g => bench(g, 9.8, 15.1, 1.4))
  add('bench-1', { x: 18.6, y: 15.1, w: 1.4, d: .45 }, g => bench(g, 18.6, 15.1, 1.4))
  add('bench-2', { x: 14.3, y: 11, w: .45, d: 1.4 }, g => bench(g, 14.3, 11, 1.4, true))
  for (const { x, y } of lamps) add(`lamp-${x}-${y}`, { x, y, w: .14, d: .14 }, g => lamp(g, x, y))
  add('light-0', { x: 14.5, y: 17.1, w: .3, d: .3 }, g => trafficLight(g, 14.5, 17.1))
  add('light-1', { x: 17.3, y: 22.4, w: .3, d: .3 }, g => trafficLight(g, 17.3, 22.4))
  add('sign', { x: 28.5, y: 17.1, w: .1, d: .1 }, g => streetSign(g, 28.5, 17.1))
  add('route-pole', { ...ROUTE_POLE, w: .1, d: .1 }, g => routePole(g, ROUTE_POLE.x, ROUTE_POLE.y))
  add('bin-0', { x: 8.1, y: 8.2, w: .36, d: .36 }, g => bin(g, 8.1, 8.2))
  add('bin-1', { x: 14.4, y: 15.1, w: .36, d: .36 }, g => bin(g, 14.4, 15.1))
  add('shelter', SHELTER, g => shelter(g, false), key({ x: SHELTER.x, y: SHELTER.y, w: SHELTER.w, d: .8 }))
  const shelterRoof = add('shelter-roof', SHELTER, g => shelter(g, true), depthAt(SHELTER.x + SHELTER.w, SHELTER.y + SHELTER.d))
  posts.forEach((p, i) => add('post-' + i, { ...p, w: .12, d: .12 }, g => linkwayPosts(g, p.x, p.y)))
  const linkRoof = add('linkway-roof', LINKWAY, linkwayRoof, depthAt(LINKWAY.x + LINKWAY.w, LINKWAY.y + LINKWAY.d))

  const routes = precinctRoutes.map(({ sheet, path }): MapProp => ({ kind: 'walker', name: sheet, x: 0, y: 0, w: 0, d: 0, properties: { sheet }, path }))
  const fade = (image: Phaser.GameObjects.Image, on: boolean, alpha: number) => image.setAlpha(on ? alpha : 1)
  const near = (p: Point, f: Footprint, back: number, front = 0) => p.x >= f.x - back && p.x <= f.x + f.w + front && p.y >= f.y - back && p.y <= f.y + f.d + front
  return {
    hotspots: precinctHotspots, collisions: [...precinctCollisions], size: PRECINCT_SIZE, routes,
    tick: (_time, _delta, player) => {
      if (!player) return
      // Façade cutaway: under the void deck or just in front of it, the upper floors make way for the first-storey slab.
      const open = near(player, HDB, 0, 1.2) && player.x <= HDB.x + HDB.w
      // Both drop just beneath the overhang band, so people under the deck draw over the cut slab and the ghosted floors.
      upper.setAlpha(open ? .14 : 1).setDepth(open ? top - 1 : top); cut.setVisible(open).setDepth(top - 1)
      fade(linkRoof, near(player, LINKWAY, 2.2), .4)
      fade(shelterRoof, near(player, SHELTER, 2.2), .4)
    },
  }
}
