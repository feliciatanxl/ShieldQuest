import Phaser from 'phaser'
import { project, TILE_HEIGHT, TILE_WIDTH, type Footprint } from './isometric'
import { neighbourhood, type MapProp } from './maps'
import { box, floor, front, side } from './worldArt'

// Detail areas (`detail` rectangles in the map) get ground-level realism that the shared 64×32 tiles can't carry:
// worn asphalt, kerbs, drains, jointed paving, grass variation, tactile paving and contact shadows. It is all drawn
// once and baked into one render texture per area, so it costs a single textured quad per frame.
// Sun from the left of the screen, as in the PixelLab sprites: cast shadows fall to the screen right.

type Graphics = Phaser.GameObjects.Graphics
const GRASS = 0, PAVEMENT = 1, ROAD = 2, PLAZA = 3
const { size, tiles } = neighbourhood
const kindAt = (x: number, y: number) => {
  if (x < 0 || y < 0 || x >= size.x || y >= size.y) return -1
  const t = tiles[y * size.x + x]
  return t ? (t - 1) >> 2 : -1
}
/** Deterministic noise in [0, 1): the same cell always gets the same wear. */
const noise = (x: number, y: number, i = 0) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + i * 74.7) * 43758.5453
  return s - Math.floor(s)
}
const inside = (a: Footprint, x: number, y: number) => x >= a.x && y >= a.y && x < a.x + a.w && y < a.y + a.d

function asphalt(g: Graphics, x: number, y: number) {
  for (let i = 0; i < 7; i++) {
    const s = .05 + noise(x, y, i) * .14
    floor(g, x + noise(x, y, i + 9) * (1 - s), y + noise(x, y, i + 19) * (1 - s), s, s * .8, noise(x, y, i + 29) > .45 ? '#262833' : '#9a9aa2', 0, .1 + noise(x, y, i + 39) * .12)
  }
  if (noise(x, y, 51) > .86) {
    // A patch repair: a slightly darker, sharp-edged rectangle of newer asphalt.
    const w = .35 + noise(x, y, 52) * .4, d = .25 + noise(x, y, 53) * .35
    floor(g, x + .1, y + .2, w, d, '#3c3f4a', 0, .55)
    floor(g, x + .1, y + .2, w, .03, '#2a2c34', 0, .6)
  }
  if (noise(x, y, 61) > .8) floor(g, x + noise(x, y, 62) * .7, y + .1, .025, .7, '#24262e', 0, .35)
}

/** Darker tyre tracks down each lane, worn in by the buses. */
function laneWear(g: Graphics, road: MapProp, area: Footprint) {
  const alongX = road.w >= road.d
  const span = alongX ? road.d : road.w
  for (let lane = 0; lane < 2; lane++) {
    for (const u of [.42, 1.05].map(v => lane * span / 2 + v * span / 4)) {
      const from = Math.max(alongX ? road.x : road.y, alongX ? area.x : area.y)
      const to = Math.min(alongX ? road.x + road.w : road.y + road.d, alongX ? area.x + area.w : area.y + area.d)
      for (let t = from; t < to; t += .5) {
        const x = alongX ? t : road.x + u, y = alongX ? road.y + u : t
        if (kindAt(Math.floor(x), Math.floor(y)) !== ROAD) continue
        floor(g, x, y, alongX ? .5 : .14, alongX ? .14 : .5, '#1d1f27', 0, .07 + noise(x, y, 3) * .05)
      }
    }
  }
}

function paving(g: Graphics, x: number, y: number) {
  // 50 cm slabs with faint joints, each slab a touch lighter or darker, a few stained.
  for (const [ox, oy] of [[0, 0], [.5, 0], [0, .5], [.5, .5]]) {
    const n = noise(x + ox, y + oy, 5)
    floor(g, x + ox, y + oy, .5, .5, n > .5 ? '#ffffff' : '#5d564c', 0, Math.abs(n - .5) * .12)
    if (noise(x + ox, y + oy, 8) > .93) floor(g, x + ox + .12, y + oy + .1, .22, .18, '#6e6658', 0, .18)
  }
  floor(g, x, y + .49, 1, .02, '#7a7468', 0, .28)
  floor(g, x + .49, y, .02, 1, '#7a7468', 0, .28)
  floor(g, x, y, 1, .02, '#7a7468', 0, .22)
  floor(g, x, y, .02, 1, '#7a7468', 0, .22)
}

function grass(g: Graphics, x: number, y: number) {
  for (let i = 0; i < 9; i++) {
    const s = .05 + noise(x, y, i + 70) * .1
    const light = noise(x, y, i + 80) > .6
    floor(g, x + noise(x, y, i + 90) * (1 - s), y + noise(x, y, i + 100) * (1 - s), s, s, light ? '#c3d48e' : '#4f6b3a', 0, light ? .22 : .2)
  }
  if (noise(x, y, 110) > .9) floor(g, x + noise(x, y, 111) * .8, y + noise(x, y, 112) * .8, .07, .07, noise(x, y, 113) > .5 ? '#f1e3a1' : '#e8a6b8', 0, .9)
}

/** Raised kerb where a road meets pavement or verge: a pale top edge, and a lit face where it faces the camera. */
function kerbs(g: Graphics, x: number, y: number) {
  const k = kindAt(x, y)
  if (k === ROAD || k < 0) return
  if (kindAt(x + 1, y) === ROAD) { floor(g, x + .9, y, .1, 1, '#d9d6cc'); side(g, x + 1, y, 1, 0, 3, '#9d9a92') }
  if (kindAt(x, y + 1) === ROAD) { floor(g, x, y + .9, 1, .1, '#d9d6cc'); front(g, x, y + 1, 1, 0, 3, '#b3b0a6') }
  if (kindAt(x - 1, y) === ROAD) floor(g, x, y, .1, 1, '#e3e0d6')
  if (kindAt(x, y - 1) === ROAD) floor(g, x, y, 1, .1, '#e3e0d6')
}

/** Covered roadside drain along the edge where pavement meets the verge: concrete lips, a dark slot, grating bars. */
function drains(g: Graphics, x: number, y: number) {
  if (kindAt(x, y) !== PAVEMENT) return
  const run = (alongX: boolean, at: number) => {
    const [dx, dy, w, d] = alongX ? [x, at, 1, .18] : [at, y, .18, 1]
    floor(g, dx, dy, w, d, '#b5b1a6')
    floor(g, alongX ? dx : dx + .06, alongX ? dy + .06 : dy, alongX ? 1 : .06, alongX ? .06 : 1, '#30333a')
    for (let t = .06; t < 1; t += .16) floor(g, alongX ? dx + t : dx + .05, alongX ? dy + .05 : dy + t, alongX ? .04 : .08, alongX ? .08 : .04, '#8c8a83')
  }
  if (kindAt(x, y + 1) === GRASS) run(true, y + .82)
  if (kindAt(x + 1, y) === GRASS) run(false, x + .82)
}

/** Yellow tactile strips at both kerbs of a crossing, studs picked out darker. */
function tactile(g: Graphics, c: MapProp) {
  const acrossY = c.d >= c.w
  const strips = acrossY ? [[c.x, c.y - .42, c.w, .3], [c.x, c.y + c.d + .12, c.w, .3]] : [[c.x - .42, c.y, .3, c.d], [c.x + c.w + .12, c.y, .3, c.d]]
  for (const [x, y, w, d] of strips) {
    floor(g, x, y, w, d, '#d9b23c')
    for (let i = .05; i < w - .04; i += .1) for (let j = .05; j < d - .04; j += .1) floor(g, x + i, y + j, .04, .04, '#a8861f')
  }
}

const shadowed = new Set(['block', 'building', 'shop', 'kopi', 'house', 'hawker', 'play', 'fitness', 'pavilion', 'shelter', 'linkway', 'bus', 'tree', 'bench', 'bin', 'recycle', 'bikes', 'chess', 'lamp', 'notice', 'planter', 'bougainvillea', 'trafficLight'])

/** Ambient occlusion where things meet the ground, plus a short cast shadow to the screen right for tall ones. */
function contactShadow(g: Graphics, p: MapProp) {
  if (p.kind === 'tree' || p.kind === 'lamp' || p.kind === 'trafficLight') {
    const c = project(p.x + p.w / 2, p.y + p.d / 2)
    const r = p.kind === 'tree' ? (p.properties.palm ? 30 : 38) : 9
    g.fillStyle(0x1b2a24, .2).fillEllipse(c.x + r * .35, c.y + 2, r * 2, r)
    return
  }
  const pad = p.kind === 'block' || p.kind === 'building' ? .22 : .1
  floor(g, p.x - pad, p.y - pad, p.w + pad * 2, p.d + pad * 2, '#1d2430', 0, .13)
  floor(g, p.x - pad / 2, p.y - pad / 2, p.w + pad, p.d + pad, '#1d2430', 0, .12)
  if (p.kind === 'block') {
    // The block's shadow falls along its right-hand wall: a band one storey deep on the ground.
    g.fillStyle(0x1d2430, .14)
    const a = project(p.x + p.w, p.y), b = project(p.x + p.w, p.y + p.d), reach = 46
    g.fillPoints([new Phaser.Math.Vector2(a.x, a.y), new Phaser.Math.Vector2(b.x, b.y), new Phaser.Math.Vector2(b.x + reach, b.y), new Phaser.Math.Vector2(a.x + reach, a.y)], true)
  }
}

/** A paved apron round each HDB block in the area: residents step out of the void deck onto paving, not grass. */
function apron(g: Graphics, p: MapProp) {
  const m = .7
  floor(g, p.x - m, p.y - m, p.w + m * 2, p.d + m * 2, '#d3cbbb')
  for (let t = 0; t < p.w + m * 2; t += .5) floor(g, p.x - m + t, p.y - m, .02, p.d + m * 2, '#9c9586', 0, .35)
  for (let t = 0; t < p.d + m * 2; t += .5) floor(g, p.x - m, p.y - m + t, p.w + m * 2, .02, '#9c9586', 0, .35)
  floor(g, p.x - m, p.y + p.d + m - .06, p.w + m * 2, .06, '#a9a294')
  floor(g, p.x + p.w + m - .06, p.y - m, .06, p.d + m * 2, '#a9a294')
}

/** Small surface carpark: painted bays, wheel stops and a clear central drive aisle. */
function parking(g: Graphics, p: MapProp) {
  floor(g, p.x, p.y, p.w, p.d, '#656c6d')
  for (const u of [.08, p.w - .08]) floor(g, p.x + u, p.y, .035, p.d, '#e0ded1')
  for (let t = .1; t < p.d; t += 1.25) {
    floor(g, p.x, p.y + t, 1.1, .035, '#e0ded1')
    floor(g, p.x + p.w - 1.1, p.y + t, 1.1, .035, '#e0ded1')
    floor(g, p.x + .15, p.y + t + .25, .08, .65, '#b6b6aa')
    floor(g, p.x + p.w - .23, p.y + t + .25, .08, .65, '#b6b6aa')
  }
}

/** Neighbourhood noticeboard: two posts and a green board pinned with notices. */
export function noticeboard(g: Graphics, p: MapProp) {
  const { x, y } = p
  for (const px of [x + .04, x + p.w - .1]) box(g, px, y + .06, .06, .06, 30, ['#9aa3a5', '#6f787a', '#5d6567'])
  box(g, x, y + .02, p.w, .1, 22, ['#3d6b56', '#2f5a47', '#284c3c'], 22)
  ;['#f4efe2', '#f2c96b', '#e7a69a', '#cfe3ef', '#f4efe2'].forEach((paper, i) =>
    front(g, x + .05 + i * (p.w - .1) / 5, y + .12, (p.w - .1) / 5 - .03, 26 + (i % 2) * 4, 8, paper))
}

export function detailAreas() {
  return neighbourhood.props.filter(p => p.kind === 'detail')
}

/** Bakes one detail area's ground and shadows into a render texture just above the ground tiles. */
export function bakeDetail(scene: Phaser.Scene, area: MapProp) {
  const g = scene.make.graphics({}, false)
  const x0 = Math.floor(area.x), y0 = Math.floor(area.y), x1 = Math.ceil(area.x + area.w), y1 = Math.ceil(area.y + area.d)
  const props = neighbourhood.props.filter(p => inside(area, p.x + p.w / 2, p.y + p.d / 2))
  for (const p of props.filter(p => p.kind === 'block')) apron(g, p)
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const k = kindAt(x, y)
    if (k === ROAD) asphalt(g, x, y)
    else if (k === PAVEMENT || k === PLAZA) paving(g, x, y)
    else if (k === GRASS && !props.some(p => p.kind === 'block' && x + 1 > p.x - .7 && x < p.x + p.w + .7 && y + 1 > p.y - .7 && y < p.y + p.d + .7)) grass(g, x, y)
  }
  for (const p of props.filter(p => p.kind === 'parking')) parking(g, p)
  for (const road of neighbourhood.props.filter(p => p.kind === 'road')) laneWear(g, road, area)
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { drains(g, x, y); kerbs(g, x, y) }
  for (const c of props.filter(p => p.kind === 'crossing')) tactile(g, c)
  for (const p of props.filter(p => shadowed.has(p.kind))) contactShadow(g, p)

  const left = project(x0, y1).x - TILE_WIDTH, right = project(x1, y0).x + TILE_WIDTH
  const top = project(x0, y0).y - TILE_HEIGHT * 2, bottom = project(x1, y1).y + TILE_HEIGHT
  const rt = scene.add.renderTexture(left, top, right - left, bottom - top).setOrigin(0).setDepth(-2000.5)
  rt.draw(g, -left, -top)
  g.destroy()
  return rt
}
