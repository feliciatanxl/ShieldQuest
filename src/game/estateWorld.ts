import Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import { estate } from './estate'
import type { Building, Thing } from './estateLayout'
import * as art from './estateArt'
import type { Hotspot } from './events'
import { registerBlocker, registerOverhang } from './hdbBlock'
import { depthAt, project, TILE_WIDTH, type Footprint } from './isometric'
import type { MapProp } from './maps'
import type { Painter } from './pixelIso'
import { bake, bakeAt, bakeTexture, opaqueAt } from './pixelBake'
import { buildingDepth } from './precinctLayout'
import { estateNight, type Light } from './estateLighting'
import { glyphs as GLYPHS } from './glyphs'
import type { WorldLayout } from './world'

/**
 * The playable Sunshine Estate (docs/estate-migration.md): the Ang Mo Kio layout from estateLayout.ts drawn to the
 * approved slice standard. Nothing is drawn up front: ground is baked in CHUNK × CHUNK tile chunks and buildings on
 * approach, both evicted (textures freed) once well off screen, so memory stays flat however far the player walks.
 */
const CHUNK = 16
const MARGIN = 420, EVICT = 900 // px around the camera view: bake inside, free outside
const C = {
  pave: ['#ddd0b6', '#d8caae', '#e2d6bf'], grass: ['#74b84f', '#79b656'], path: '#c9b89c', covered: '#d5c9b0', kerb: '#d6d0c2',
  drain: '#a8a296', road: '#2f2d28', white: '#f4f1e8', yellow: '#f0c23b', deck: ['#d6d0c2', '#d1cbbd'], tactile: '#e3c25a', slab: ['#d9c9ab', '#d4c3a4', '#ddcdb0'],
}
const inShowcase = (x: number, y: number) => x >= estate.showcase.x && y >= estate.showcase.y && x < estate.showcase.x + estate.showcase.w && y < estate.showcase.y + estate.showcase.d
const hash = (x: number, y: number) => { const j = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return j - Math.floor(j) }
type Seg = { a: Point; b: Point; width: number; road: number; major?: boolean; oneway?: boolean }
const segDist = (p: Point, a: Point, b: Point) => {
  const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t)
}
const box = (f: Footprint) => {
  const l = project(f.x, f.y + f.d).x - TILE_WIDTH / 2, r = project(f.x + f.w, f.y).x + TILE_WIDTH / 2
  return { l, r, t: project(f.x, f.y).y - 420, b: project(f.x + f.w, f.y + f.d).y + 20 }
}
const near = (p: Point, f: Footprint, back: number, front = 0) => p.x >= f.x - back && p.x <= f.x + f.w + front && p.y >= f.y - back && p.y <= f.y + f.d + front

/** World-space strip for a polyline segment, plus a round joint, as painter polygons. */
function strip(g: Painter, a: Point, b: Point, width: number, color: string) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / len * width / 2, ny = (b.x - a.x) / len * width / 2
  g.poly(color, [[a.x + nx, a.y + ny], [b.x + nx, b.y + ny], [b.x - nx, b.y - ny], [a.x - nx, a.y - ny]], 1, false)
  const r = width / 2
  g.poly(color, Array.from({ length: 12 }, (_, i) => [b.x + Math.cos(i / 6 * Math.PI) * r, b.y + Math.sin(i / 6 * Math.PI) * r] as [number, number]), 1, false)
}

export function createEstateWorld(scene: Phaser.Scene): WorldLayout {
  const E = estate, nx = Math.ceil(E.size.x / CHUNK), ny = Math.ceil(E.size.y / CHUNK)
  const chunkOf = (x: number, y: number) => Phaser.Math.Clamp(Math.floor(y / CHUNK), 0, ny - 1) * nx + Phaser.Math.Clamp(Math.floor(x / CHUNK), 0, nx - 1)
  const buckets = <T>(items: T[], bounds: (t: T) => [number, number, number, number]) => {
    const out: T[][] = Array.from({ length: nx * ny }, () => [])
    for (const it of items) {
      const [x0, y0, x1, y1] = bounds(it)
      for (let cy = Math.max(0, Math.floor(y0 / CHUNK)); cy <= Math.min(ny - 1, Math.floor(y1 / CHUNK)); cy++)
        for (let cx = Math.max(0, Math.floor(x0 / CHUNK)); cx <= Math.min(nx - 1, Math.floor(x1 / CHUNK)); cx++) out[cy * nx + cx].push(it)
    }
    return out
  }
  const segs = (lines: { pts: Point[]; width: number; major?: boolean; oneway?: boolean }[]) => lines.flatMap((l, road) => l.pts.slice(1).map((b, i) => ({ a: l.pts[i], b, width: l.width, road, major: l.major, oneway: l.oneway })))
  const segBounds = (s: Seg): [number, number, number, number] => [Math.min(s.a.x, s.b.x) - s.width, Math.min(s.a.y, s.b.y) - s.width, Math.max(s.a.x, s.b.x) + s.width, Math.max(s.a.y, s.b.y) + s.width]
  const roadSegs = buckets(segs(E.roads), segBounds), pathSegs = buckets(segs(E.paths), segBounds)
  const coveredSegs = buckets(segs(E.paths.filter(p => p.covered)), segBounds)
  const decks = buckets(E.buildings.filter(b => b.deck), b => [b.x, b.y, b.x + b.w, b.y + b.d])
  const mats = buckets(E.things.filter(t => t.kind === 'play' || t.kind === 'fitness'), t => [t.x, t.y, t.x + t.w, t.y + t.d])
  const doors = buckets(E.hotspots.filter(h => h.building || h.mission), h => [h.at.x - 1, h.at.y - 1, h.at.x + 1, h.at.y + 1])
  const thingsIn = buckets(E.things, t => [t.x, t.y, t.x, t.y])
  const roofsIn = buckets(E.roofs.map((r, i) => ({ ...r, i })), r => [Math.min(r.a.x, r.b.x), Math.min(r.a.y, r.b.y), Math.min(r.a.x, r.b.x), Math.min(r.a.y, r.b.y)])

  // ------------------------------------------------------------------ ground chunks
  function paintGround(g: Painter, cx: number, cy: number) {
    const x0 = cx * CHUNK, y0 = cy * CHUNK, x1 = Math.min(x0 + CHUNK, E.size.x), y1 = Math.min(y0 + CHUNK, E.size.y), i = cy * nx + cx
    const cls = (x: number, y: number) => x < 0 || y < 0 || x >= E.size.x || y >= E.size.y ? 0 : E.ground[y * E.size.x + x]
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (cls(x, y) === 1) {
        // Lawn: one continuous sheet (no tile seams), with tufts and the odd fallen flower.
        g.poly(C.grass[0], [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]], 1, false)
        for (let k = 0; k < 3; k++) { const h = hash(x * 3 + k, y); g.dot(x + h, y + hash(y, x * 5 + k), 0, 0, 0, 2, 1, h > .5 ? '#6aa94c' : '#92cc6a') }
        if (hash(x + 9, y) > .93) g.dot(x + .5, y + .5, 0, 0, 0, 2, 2, '#f2a0c8')
      } else {
        // Precinct: large concrete slabs as in the reference; elsewhere interlocking pavers (half-tile units, three tones).
        if (inShowcase(x, y)) g.floor(x, y, 1, 1, C.slab[Math.floor(hash(x, y) * 3)])
        else for (const [dx, dy] of [[0, 0], [.5, 0], [0, .5], [.5, .5]]) g.floor(x + dx, y + dy, .5, .5, C.pave[Math.floor(hash(x + dx * 2, y + dy * 2) * 3)])
      }
    }
    // Planting beds get a precast kerb wherever they meet paving or a footpath (roads have their own kerb).
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (cls(x, y) === 1) {
      if (cls(x, y + 1) !== 1 && cls(x, y + 1) !== 2) g.floor(x, y + .9, 1, .1, '#e8e1d0')
      if (cls(x + 1, y) !== 1 && cls(x + 1, y) !== 2) g.floor(x + .9, y, .1, 1, '#d9d1bf')
      if (cls(x, y - 1) !== 1 && cls(x, y - 1) !== 2) g.floor(x, y, 1, .1, '#e8e1d0')
      if (cls(x - 1, y) !== 1 && cls(x - 1, y) !== 2) g.floor(x, y, .1, 1, '#d9d1bf')
    }
    // Void decks: speckled terrazzo in large panels, in the slab's shade.
    for (const b of decks[i]) for (let y = Math.max(y0, Math.floor(b.y)); y < Math.min(y1, b.y + b.d); y++) for (let x = Math.max(x0, Math.floor(b.x)); x < Math.min(x1, b.x + b.w); x++) {
      const fx = Math.max(x, b.x), fy = Math.max(y, b.y)
      g.floor(fx, fy, Math.min(x + 1, b.x + b.w) - fx, Math.min(y + 1, b.y + b.d) - fy, C.deck[(x + y) & 1])
      for (let k = 0; k < 4; k++) g.dot(fx + hash(x + k, y) * .9, fy + hash(y + k, x) * .9, 0, 0, 0, 1, 1, k % 2 ? '#a9a192' : '#efe9dc')
    }
    for (const b of decks[i]) g.floor(b.x, b.y, b.w, b.d, '#20283a', 0, .12)
    for (const t of mats[i]) art.mat(g, t.x, t.y, t.w, t.d)
    // Tree pits: a cast-iron grate in paving, a mulch ring on grass, so trunks grow out of the ground.
    for (const t of thingsIn[i]) if (t.kind === 'tree') {
      const c = { x: t.x + t.w / 2, y: t.y + t.d / 2 }
      if (cls(Math.floor(c.x), Math.floor(c.y)) === 1) g.blob(c.x, c.y, 0, 0, 0, 18, 9, '#6b5038', .55)
      else { g.floor(c.x - .5, c.y - .5, 1, 1, '#8d857a').floor(c.x - .42, c.y - .42, .84, .84, '#5e574c'); for (let k = 1; k < 4; k++) g.floor(c.x - .42 + k * .21, c.y - .42, .04, .84, '#7a7265') }
    }
    for (const s of pathSegs[i]) strip(g, s.a, s.b, s.width, C.path)
    for (const s of coveredSegs[i]) strip(g, s.a, s.b, s.width - .2, C.covered)
    // Roadside: covered drain with its grating, then the raised kerb, then asphalt with aggregate speckle.
    for (const s of roadSegs[i]) strip(g, s.a, s.b, s.width + 1.3, C.drain)
    for (const s of roadSegs[i]) strip(g, s.a, s.b, s.width + .5, C.kerb)
    for (const s of roadSegs[i]) strip(g, s.a, s.b, s.width, C.road)
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (cls(x, y) === 2) for (let k = 0; k < 3; k++) g.dot(x + hash(x, y + k * 7), y + hash(y + k, x), 0, 0, 0, 1, 1, k ? '#3d3a33' : '#25231e')
    // Markings stop wherever another road's carriageway takes over (junctions).
    const crossing = (p: Point, own: number) => roadSegs[i].some(s => s.road !== own && segDist(p, s.a, s.b) < s.width / 2)
    for (const s of roadSegs[i]) {
      const len = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y), ux = (s.b.x - s.a.x) / len, uy = (s.b.y - s.a.y) / len, vx = -uy, vy = ux
      const dash = (t: number, off: number, l: number, w: number, color: string) => {
        const p = { x: s.a.x + ux * (t + l / 2) + vx * off, y: s.a.y + uy * (t + l / 2) + vy * off }
        if (crossing(p, s.road)) return
        const a = { x: p.x - ux * l / 2, y: p.y - uy * l / 2 }, b = { x: p.x + ux * l / 2, y: p.y + uy * l / 2 }
        g.poly(color, [[a.x + vx * w / 2, a.y + vy * w / 2], [b.x + vx * w / 2, b.y + vy * w / 2], [b.x - vx * w / 2, b.y - vy * w / 2], [a.x - vx * w / 2, a.y - vy * w / 2]], 1, false)
      }
      for (let t = 0; t + .3 < len; t += 1) {
        // Singapore kerbside lines: double yellow (no parking at any time) on main roads, single yellow on estate roads.
        if (s.width >= 3) for (const side of [1, -1]) for (const inset of s.major ? [.35, .5] : [.35]) dash(t, side * (s.width / 2 - inset), Math.min(1, len - t), .07, C.yellow)
        if (s.major && !s.oneway && t % 2 === 0) dash(t + .3, 0, Math.min(1, len - t - .3), .1, C.white)
        if (s.major && s.oneway && t % 3 === 0 && s.width >= 4) dash(t + .3, 0, Math.min(1, len - t - .3), .08, C.white)
      }
    }
    // Zebra crossings wherever a footpath crosses a carriageway.
    for (const s of pathSegs[i]) {
      const len = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y), ux = (s.b.x - s.a.x) / len, uy = (s.b.y - s.a.y) / len, vx = -uy, vy = ux
      const onRoad = (t: number) => { const p = { x: s.a.x + ux * t, y: s.a.y + uy * t }; return roadSegs[i].some(r => segDist(p, r.a, r.b) < r.width / 2 + .25) }
      // Tactile warning strips where the footpath meets the kerb, either side of the crossing.
      for (let t = .25; t < len - .25; t += .25) if (onRoad(t) !== onRoad(t - .25)) {
        const at = onRoad(t) ? t - .5 : t, half = s.width / 2 - .15
        const c = (a: number, b: number) => [s.a.x + ux * (at + a) + vx * b, s.a.y + uy * (at + a) + vy * b] as [number, number]
        g.poly(C.tactile, [c(0, -half), c(.45, -half), c(.45, half), c(0, half)], 1, false)
        for (let a = .08; a < .45; a += .12) for (let b = -half + .1; b < half; b += .14) { const p = c(a, b); g.dot(p[0], p[1], 0, 0, 0, 1, 1, '#b8962e') }
      }
      for (let t = .2; t < len; t += .45) {
        const p = { x: s.a.x + ux * t, y: s.a.y + uy * t }
        if (!roadSegs[i].some(r => segDist(p, r.a, r.b) < r.width / 2 - .3)) continue
        for (let k = -1.5; k <= 1.5; k++) {
          const c = { x: p.x + vx * k * .42, y: p.y + vy * k * .42 }
          g.poly(C.white, [[c.x - ux * .2 + vx * .12, c.y - uy * .2 + vy * .12], [c.x + ux * .2 + vx * .12, c.y + uy * .2 + vy * .12], [c.x + ux * .2 - vx * .12, c.y + uy * .2 - vy * .12], [c.x - ux * .2 - vx * .12, c.y - uy * .2 - vy * .12]], 1, false)
        }
      }
    }
    // Precinct bus bays: a yellow box on the carriageway in front of the shelter with BUS painted in road letters.
    for (const f of E.bays) {
      const y0 = f.y, x0 = f.x, w = f.w, d = f.d, line = (x: number, y: number, lw: number, ld: number) => g.floor(x, y, lw, ld, C.yellow)
      line(x0, y0, w, .08); line(x0, y0 + d - .08, w, .08); line(x0, y0, .08, d); line(x0 + w - .08, y0, .08, d)
      Array.from('BUS').forEach((ch, k) => Array.from(GLYPHS[ch]).forEach((bit, cell) => { if (bit === '1') g.floor(x0 + 1.4 + k * 1 + (cell % 3) * .25, y0 + .3 + Math.floor(cell / 3) * .25, .25, .25, C.yellow) }))
    }
    for (const h of doors[i]) g.floor(h.at.x - .4, h.at.y - .25, .8, .5, h.mission ? '#f2c14e' : '#c9b48f')
    // The estate sits on a slab with a visible edge along the two near borders.
    if (x1 === E.size.x) g.side(x1, y0, y1 - y0, -16, 16, '#4b4038')
    if (y1 === E.size.y) g.front(x0, y1, x1 - x0, -16, 16, '#5d5045')
  }
  type Chunk = { image?: Phaser.GameObjects.Image; things: Phaser.GameObjects.Image[]; roofs: { image: Phaser.GameObjects.Image; a: Point; b: Point }[]; shelterRoofs: { image: Phaser.GameObjects.Image; f: Footprint }[]; pending: boolean }
  const chunks = new Map<number, Chunk>()
  const chunkFrame = (cx: number, cy: number) => {
    const x0 = cx * CHUNK, y0 = cy * CHUNK, x1 = Math.min(x0 + CHUNK, E.size.x), y1 = Math.min(y0 + CHUNK, E.size.y)
    const x = Math.floor(project(x0, y1).x) - 2, y = Math.floor(project(x0, y0).y) - 6
    return { x, y, W: Math.ceil(project(x1, y0).x) - x + 2, H: Math.ceil(project(x1, y1).y) - y + 20 }
  }
  const chunkBox = (cx: number, cy: number) => { const f = chunkFrame(cx, cy); return { l: f.x, r: f.x + f.W, t: f.y - 200, b: f.y + f.H } }

  // ------------------------------------------------------------------ things (shared textures per kind and variant)
  const painters: Record<string, (g: Painter, t: Thing) => void> = {
    tree: (g, t) => art.tree(g, t.variant), shrub: (g, t) => art.shrub(g, t.variant), bench: g => art.bench(g), bin: g => art.bin(g),
    lamp: g => art.lamp(g), bikes: (g, t) => art.bikes(g, t.alongY), plant: (g, t) => art.plant(g, t.variant), fridge: g => art.fridge(g), crates: (g, t) => art.crates(g, t.variant), chess: g => art.chess(g), recycle: g => art.recycle(g), planter: g => art.planter(g),
    fruit: g => art.crates(g, 1), snacks: g => art.crates(g, 2), bluecrates: g => art.drinkCrates(g), bed: (g, t) => art.bed(g, t.w, t.d), rail: (g, t) => art.rail(g, t.w), garden: g => art.garden(g), kopitiam: g => art.kopitiam(g), notice: g => art.notice(g), shelter: g => art.shelter(g, false),
  }
  const origin: Record<string, Point> = { tree: { x: .12, y: .12 }, shrub: { x: 0, y: 0 } }
  // PixelLab estate sprites (docs/pixellab-assets.md): anchored on their lowest opaque pixel (trunk or feet). Three were
  // generated standing on a little grass block; that block is cropped off (BASE: first row of it) so every trunk grows
  // straight out of the estate's own ground and tree pit.
  const SPRITE_TREES: (string | null)[] = ['rain-tree-c', 'rain-tree-b', 'angsana-b', 'tembusu', null, null, 'flame-tree', 'rain-tree-c', 'rain-tree-a', 'frangipani', 'angsana-b', null]
  const SPRITE_SHRUBS: (string | null)[] = ['bougainvillea', 'ixora', null, 'heliconia']
  const BASE: Record<string, number> = { 'flame-tree': 99, 'rain-tree-a': 99, frangipani: 82, 'angsana-b': 122, 'drinks-fridge': 59 }
  const anchors = new Map<string, Point>()
  const anchor = (key: string, rows?: number) => {
    if (!anchors.has(key)) {
      const src = scene.textures.get(key).getSourceImage() as HTMLImageElement, cv = document.createElement('canvas')
      cv.width = src.width; cv.height = src.height
      const ctx = cv.getContext('2d')!; ctx.drawImage(src, 0, 0)
      const data = ctx.getImageData(0, 0, src.width, src.height).data
      let found = { x: src.width / 2, y: src.height - 1 }
      rows: for (let y = (rows ?? src.height) - 1; y >= 0; y--) {
        let sum = 0, n = 0
        for (let x = 0; x < src.width; x++) if (data[(y * src.width + x) * 4 + 3] > 128) { sum += x; n++ }
        if (n) { found = { x: sum / n, y }; break rows }
      }
      anchors.set(key, found)
    }
    return anchors.get(key)!
  }
  const sprite = (name: string, x: number, y: number, depth: number) => {
    const key = 'pl-estate-' + name, a = anchor(key, BASE[name]), p = project(x, y)
    const image = scene.add.image(Math.round(p.x - a.x), Math.round(p.y - a.y - 1), key).setOrigin(0).setDepth(depth)
    return BASE[name] ? image.setCrop(0, 0, image.width, BASE[name]) : image
  }
  const pick = (names: (string | null)[], t: Thing) => {
    const name = names[t.variant % names.length]
    return name && scene.textures.exists('pl-estate-' + name) ? name : null
  }
  function placeThings(c: Chunk, i: number) {
    for (const t of thingsIn[i]) {
      const spriteName = t.kind === 'tree' ? pick(SPRITE_TREES, t) : t.kind === 'shrub' ? pick(SPRITE_SHRUBS, t) : t.kind === 'kopitiam' && scene.textures.exists('pl-estate-kopitiam-set') ? 'kopitiam-set' : t.kind === 'fruit' && scene.textures.exists('pl-estate-fruit-stand') ? 'fruit-stand' : t.kind === 'fridge' && scene.textures.exists('pl-estate-drinks-fridge') ? 'drinks-fridge' : t.kind === 'snacks' && scene.textures.exists('pl-estate-snack-rack') ? 'snack-rack' : null
      if (spriteName) {
        const c0 = { x: t.x + t.w / 2, y: t.y + t.d / 2 }
        c.things.push(sprite(spriteName, c0.x, c0.y, buildingDepth(t)))
        continue
      }
      if (t.kind === 'play' && scene.textures.exists('pl-estate-playground-tower')) {
        c.things.push(sprite('playground-tower', t.x + 1.2, t.y + 2.2, buildingDepth({ x: t.x + .4, y: t.y + .4, w: 1.4, d: 1.6 })))
        c.things.push(sprite('swing-set', t.x + 3.6, t.y + .7, buildingDepth({ x: t.x + 2.6, y: t.y + .5, w: 2, d: .35 })))
        c.things.push(bakeAt(scene, 'et-play-2', art.PLAY_PARTS[2].draw, t.x, t.y, buildingDepth({ x: t.x + 2.9, y: t.y + 2.4, w: 1.4, d: .8 })))
        continue
      }
      if (t.kind === 'play' || t.kind === 'fitness') {
        for (const [k, part] of (t.kind === 'play' ? art.PLAY_PARTS : art.FITNESS_PARTS).entries())
          c.things.push(bakeAt(scene, `et-${t.kind}-${k}`, part.draw, t.x, t.y, buildingDepth({ x: t.x + part.rect.x, y: t.y + part.rect.y, w: part.rect.w, d: part.rect.d })))
        continue
      }
      const draw = painters[t.kind]
      if (!draw) continue
      const o = origin[t.kind] ?? { x: 0, y: 0 }
      c.things.push(bakeAt(scene, `et-${t.kind}-${['tree', 'shrub', 'crates', 'plant'].includes(t.kind) ? t.variant % 12 : t.kind === 'bed' || t.kind === 'rail' ? `${t.w}x${t.d}` : t.alongY ? 'y' : 0}`, g => draw(g, t), t.x + o.x, t.y + o.y, buildingDepth(t.kind === 'shelter' ? { ...t, d: .8 } : t)))
      if (t.kind === 'lamp') c.things.push(lighting.glow({ x: t.x + .07, y: t.y - .34, z: 88, r: 10, color: 0xfff0c8, depth: buildingDepth(t) + .01, base: .9 }))
      if (t.kind === 'shelter') c.shelterRoofs.push({ image: bakeAt(scene, 'et-shelter-roof', g => art.shelter(g, true), t.x, t.y, depthAt(t.x + t.w, t.y + t.d)), f: t })
    }
    for (const r of roofsIn[i]) c.roofs.push({ image: bake(scene, `et-roof-${r.i}`, g => inShowcase((r.a.x + r.b.x) / 2, (r.a.y + r.b.y) / 2) ? art.linkwayCurved(g, r.a, r.b, r.width) : art.linkwayRoof(g, r.a, r.b, r.width), depthAt(Math.max(r.a.x, r.b.x) + r.width / 2, Math.max(r.a.y, r.b.y) + r.width / 2)), a: r.a, b: r.b })
  }
  function dropChunk(i: number, c: Chunk) {
    c.image?.destroy()
    if (scene.textures.exists(`eg-${i}`)) scene.textures.remove(`eg-${i}`)
    c.things.forEach(t => t.destroy())
    c.roofs.forEach(r => { r.image.destroy(); scene.textures.remove(r.image.texture.key) })
    c.shelterRoofs.forEach(r => r.image.destroy())
    chunks.delete(i)
  }

  // ------------------------------------------------------------------ buildings
  const bands = new Map<Building, (x: number, y: number) => number>()
  for (const b of E.buildings) {
    if (b.deck) bands.set(b, registerOverhang(scene, b, buildingDepth(b)))
    registerBlocker(scene, b, buildingDepth(b), b.deck ? art.DECK_H + b.storeys * art.STOREY + 40 : 300)
  }
  const doorOf = new Map(E.buildings.map(b => [b, E.hotspots.find(h => (h.building?.id === b.id) || (h.mission && b.mission && h.id === { shop: 'enter', house: 'house-entrance', houseH: 'house-h-entrance', houseI: 'house-i-entrance' }[b.mission]))?.at]))
  type Live = { images: Phaser.GameObjects.Image[]; keys: string[]; main: Phaser.GameObjects.Image; cut?: Phaser.GameObjects.Image; unit?: Phaser.GameObjects.Image; unitRect?: Footprint; unitBaked?: ReturnType<typeof bakeTexture>; baked: ReturnType<typeof bakeTexture>
    /** Night layers (lit windows, shopfronts, signs), baked the first time the building is seen after dusk. */
    lit?: { image: Phaser.GameObjects.Image; follows?: Phaser.GameObjects.Image }[] }
  const live = new Map<Building, Live>()
  // Precinct signs use a pixel font; if it was still loading when they baked, bake them again once it arrives.
  if (typeof document !== 'undefined' && !document.fonts.check('8px "Press Start 2P"')) document.fonts.load('8px "Press Start 2P"').then(() => { for (const [b, l] of live) if (b.showcase) lower(b, l) })
  const boxes = new Map(E.buildings.map(b => [b, box(b)]))
  function raise(b: Building): Live {
    const key = buildingDepth(b), keys: string[] = [], images: Phaser.GameObjects.Image[] = []
    const add = (k: string, draw: (g: Painter) => void, depth: number, mask = false) => {
      const baked = bakeTexture(scene, k, draw, true, undefined, mask)
      keys.push(k)
      const image = scene.add.image(baked.x, baked.y, k).setOrigin(0).setDepth(depth)
      images.push(image)
      return { image, baked }
    }
    if (!b.deck) {
      const { image, baked } = add(`eb-${b.id}`, g => art.building(g, b, doorOf.get(b)), key, true)
      return { images, keys, main: image, baked }
    }
    const band = bands.get(b)!, fr = { x: b.x, y: b.y }
    add(`eb-w-${b.id}`, g => art.deckWall(g, b), b.alongX ? band(b.x, b.y + .6) : band(b.x + .6, b.y))
    add(`eb-s-${b.id}`, g => art.stairCore(g, b), band(fr.x + (b.alongX ? 2.5 : 3), fr.y + (b.alongX ? 3 : 2.5)))
    // In the precinct every other front pillar carries a No Smoking plate, as in the reference.
    art.pillarPositions(b).forEach((p, k) => { const sign = !!b.showcase && k % 4 === 0; images.push(bakeAt(scene, `et-pillar-${b.palette}${sign ? '-ns' : ''}`, g => art.pillar(g, b.palette, sign), p.x, p.y, band(p.x + p.w, p.y + p.d))) })
    for (const t of b.furniture ?? []) {
      // PixelLab sprites where the precinct has them (cats, potted cluster), code-drawn props otherwise.
      const sp = ({ cat: 'cat-sit', cat2: 'cat-lie', pots: 'pot-cluster' } as Record<string, string>)[t.kind]
      if (sp && scene.textures.exists('pl-estate-' + sp)) { images.push(sprite(sp, t.x + t.w / 2, t.y + t.d / 2, band(t.x + t.w, t.y + t.d))); continue }
      if (t.kind === 'cat' || t.kind === 'cat2') continue
      const draw = t.kind === 'bench' ? (g: Painter) => art.deckBench(g, t.alongY) : t.kind === 'bikes' ? (g: Painter) => art.bikes(g, t.alongY) : t.kind === 'plant' ? (g: Painter) => art.plant(g, t.variant)
        : t.kind === 'pots' ? (g: Painter) => art.plant(g, 1) : t.kind === 'chess' ? art.chess : t.kind === 'stone' ? art.stoneTable : t.kind === 'recycle' ? art.recycleBin : t.kind === 'box' ? art.cardboard : art.bin
      images.push(bakeAt(scene, `et-deck-${t.kind}-${t.kind === 'plant' ? t.variant % 2 : t.alongY ? 'y' : 'x'}`, draw, t.x, t.y, band(t.x + t.w, t.y + t.d)))
    }
    let unit: Phaser.GameObjects.Image | undefined, unitRect: Footprint | undefined, unitBaked: ReturnType<typeof bakeTexture> | undefined
    if (b.unit) {
      const len = Math.min(5, (b.alongX ? b.w : b.d) / 3)
      unitRect = b.alongX ? { x: b.x + b.w - len, y: b.y, w: len, d: b.d } : { x: b.x, y: b.y + b.d - len, w: b.w, d: len }
      ;({ image: unit, baked: unitBaked } = add(`eb-n-${b.id}`, g => art.shopUnit(g, b), buildingDepth(unitRect), true))
    }
    const upper = add(`eb-u-${b.id}`, g => art.hdbUpper(g, b), key, true)
    const cut = add(`eb-c-${b.id}`, g => art.hdbCut(g, b), key - 1).image.setVisible(false)
    return { images, keys, main: upper.image, cut, unit, unitRect, unitBaked, baked: upper.baked }
  }
  /** Bakes a building's night layer: only its light sources, drawn additively just above the building itself. */
  function litUp(b: Building, l: Live) {
    const layer = (k: string, draw: (g: Painter) => void, depth: number, follows?: Phaser.GameObjects.Image) => {
      const baked = bakeTexture(scene, k, g => { g.dot(b.x, b.y, 0, 0, 0, 1, 1, '#000000'); draw(g) }, false)
      l.keys.push(k)
      const image = scene.add.image(baked.x, baked.y, k).setOrigin(0).setDepth(depth + .01).setBlendMode(Phaser.BlendModes.ADD).setData('emissive', true)
      l.images.push(image)
      return { image, follows }
    }
    l.lit = [b.deck ? layer(`ebl-u-${b.id}`, g => art.hdbUpper(g, b, true), l.main.depth, l.main) : layer(`ebl-${b.id}`, g => art.building(g, b, doorOf.get(b), true), l.main.depth)]
    if (l.unit) l.lit.push(layer(`ebl-n-${b.id}`, g => art.shopUnit(g, b, true), l.unit.depth))
  }
  function lower(b: Building, l: Live) {
    l.images.forEach(i => i.destroy())
    l.keys.forEach(k => scene.textures.exists(k) && scene.textures.remove(k))
    live.delete(b)
  }

  // ------------------------------------------------------------------ streaming
  let lastScan = -Infinity
  const wanted: (() => void)[] = []
  function scan(view: Phaser.Geom.Rectangle) {
    wanted.length = 0
    const inside = (r: { l: number; r: number; t: number; b: number }, m: number) => r.r > view.x - m && r.l < view.right + m && r.b > view.y - m && r.t < view.bottom + m
    const cxv = view.centerX, cyv = view.centerY, dist = (r: { l: number; r: number; t: number; b: number }) => Math.hypot((r.l + r.r) / 2 - cxv, (r.t + r.b) / 2 - cyv)
    const jobs: { d: number; run: () => void }[] = []
    for (let cy = 0; cy < ny; cy++) for (let cx = 0; cx < nx; cx++) {
      const i = cy * nx + cx, r = chunkBox(cx, cy), c = chunks.get(i)
      if (c && !inside(r, EVICT)) dropChunk(i, c)
      else if (!c?.image && inside(r, MARGIN)) {
        let chunk = c
        if (!chunk) { chunk = { things: [], roofs: [], shelterRoofs: [], pending: true }; chunks.set(i, chunk); placeThings(chunk, i) }
        const ch = chunk
        jobs.push({ d: dist(r), run: () => {
          if (chunks.get(i) !== ch || ch.image) return
          const f = chunkFrame(cx, cy)
          bakeTexture(scene, `eg-${i}`, g => paintGround(g, cx, cy), 'seams', f)
          ch.image = scene.add.image(f.x, f.y, `eg-${i}`).setOrigin(0).setDepth(-2000)
        } })
      }
    }
    for (const b of E.buildings) {
      const r = boxes.get(b)!, l = live.get(b)
      if (l && !inside(r, EVICT)) lower(b, l)
      else if (!l && inside(r, MARGIN)) jobs.push({ d: dist(r) + 200, run: () => { if (!live.has(b)) live.set(b, raise(b)) } })
    }
    jobs.sort((a, b) => a.d - b.d)
    wanted.push(...jobs.map(j => j.run))
  }
  /** Bakes queued work, at most `budget` milliseconds per frame (always at least one job). */
  function stream(budget: number) {
    const start = performance.now()
    do wanted.shift()?.()
    while (wanted.length && performance.now() - start < budget)
  }

  // ------------------------------------------------------------------ labels, lighting, hotspots
  for (const h of E.hotspots.filter(h => h.mission)) {
    const at = project(h.at.x, h.at.y), name = h.label.replace(/^(Enter|Visit) /, '')
    scene.add.text(at.x, at.y - 70, `◆ ${name} · E`, { fontFamily: 'Outfit', fontSize: 12, color: '#ffdf88', backgroundColor: '#28463f', padding: { x: 4, y: 2 } })
      .setOrigin(.5, 1).setDepth(1e5).setResolution(2)
  }
  // Evening light pools on the ground: street lamps, bus shelters, mission doors, void-deck ceiling lights, shopfronts
  // and covered linkways.
  const pools: Light[] = [
    ...E.things.filter(t => t.kind === 'lamp').map(t => ({ x: t.x + .07, y: t.y - .34, r: 46, color: 0xffd49a })),
    ...E.busStops.map(f => ({ x: f.x + f.w / 2, y: f.y + f.d / 2, r: 52, color: 0xfff0d0 })), ...E.hotspots.filter(h => h.mission).map(h => ({ ...h.at, r: 40, color: 0xffe2a0, base: .65 })),
    ...E.roofs.map(r => ({ x: (r.a.x + r.b.x) / 2, y: (r.a.y + r.b.y) / 2, r: 30, color: 0xfff0d0, base: .4 })),
  ]
  // Precinct linkways: a string of warm bulbs under each eave.
  for (const r of E.roofs) if (inShowcase((r.a.x + r.b.x) / 2, (r.a.y + r.b.y) / 2)) {
    const len = Math.hypot(r.b.x - r.a.x, r.b.y - r.a.y) || 1, ux = (r.b.x - r.a.x) / len, uy = (r.b.y - r.a.y) / len, nx = -uy * r.width / 2 * .98, ny = ux * r.width / 2 * .98
    const depth = depthAt(Math.max(r.a.x, r.b.x) + r.width / 2, Math.max(r.a.y, r.b.y) + r.width / 2) + .02
    for (const sgn of [1, -1]) for (let t = .35; t < len; t += .7) pools.push({ x: r.a.x + ux * t + nx * sgn, y: r.a.y + uy * t + ny * sgn, z: 65, r: 4, color: 0xffd890, depth, base: .85 })
  }
  for (const b of E.buildings) {
    const along = b.alongX ? b.w : b.d, depth = b.alongX ? b.d : b.w, at = (t: number, s: number) => b.alongX ? { x: b.x + t, y: b.y + s } : { x: b.x + s, y: b.y + t }
    if (b.deck) for (let t = 2; t < along - 1; t += 4) pools.push({ ...at(t, depth * .55), r: 44, color: 0xfff2d8, base: .45 })
    const shopFront = b.style === 'shops' || b.style === 'small' ? along : b.unit ? Math.min(5, along / 3) : 0
    for (let t = along - shopFront + 1.3; t < along; t += 2.6) pools.push({ ...at(t, depth + 1), r: 40, color: 0xffc27a, base: .5 })
  }
  const lighting = estateNight(scene, pools)
  const hotspots: Hotspot[] = E.hotspots.map(({ id, label, at, radius, building }) => ({ id, label, at, radius, building }))
  const routes: MapProp[] = E.routes.map(({ sheet, path }) => ({ kind: 'walker', name: sheet, x: 0, y: 0, w: 0, d: 0, properties: { sheet }, path }))

  let primed = false
  return {
    hotspots, collisions: E.collisions, size: E.size, routes,
    hides: at => {
      const feet = project(at.x, at.y)
      for (const [b, l] of live) {
        if (l.main.visible && at.x < b.x + b.w && at.y < b.y + b.d && [16, 36, 56].some(h => opaqueAt(l.baked, feet.x, feet.y - h))) return true
        // A shop unit at the end of a deck hides whoever walks behind it: x-ray them instead of fading the shop out.
        const u = l.unitRect
        if (u && l.unitBaked && at.x < u.x + u.w && at.y < u.y + u.d && [16, 36, 56].some(h => opaqueAt(l.unitBaked!, feet.x, feet.y - h))) return true
      }
      return false
    },
    tick: (time, _delta, player) => {
      const view = scene.cameras.main.worldView
      if (time - lastScan > 200 || !primed) { lastScan = time; scan(view) }
      // First frame: bake everything on screen so the estate never appears half-drawn; then a few ms per frame.
      stream(primed ? 6 : 1e4)
      primed = true
      lighting.tick(time)
      const night = lighting.night()
      let baking = 0
      for (const [b, l] of live) {
        if (night > .02 && !l.lit && baking++ < 2) litUp(b, l)
        for (const x of l.lit ?? []) x.image.setVisible(night > .02 && (x.follows?.visible ?? true)).setAlpha(night * .95)
      }
      if (!player) return
      for (const [b, l] of live) {
        if (b.deck && l.cut) {
          // Cut away the upper floors only while they actually cover the player (under the deck or behind the block):
          // in front of an open deck the whole block stays standing, as in the reference.
          const feet = project(player.x, player.y)
          const open = player.x < b.x + b.w && player.y < b.y + b.d && [16, 36, 56].some(h => opaqueAt(l.baked, feet.x, feet.y - h))
          l.main.setVisible(!open); l.cut.setVisible(open)
          if (open) continue
        }
      }
      for (const c of chunks.values()) {
        for (const r of c.roofs) r.image.setAlpha(segDist(player, r.a, r.b) < 2.6 ? .4 : 1)
        for (const r of c.shelterRoofs) r.image.setAlpha(near(player, r.f, 2.2) ? .4 : 1)
      }
    },
  }
}

/** Menu backdrop framings in world pixels: the estate around the start, and a void deck for the wardrobe. */
export function estatePreviewSpots() {
  const start = project(estate.start.x, estate.start.y)
  const deck = estate.buildings.filter(b => b.deck).sort((a, b) => Math.hypot(a.x - estate.start.x, a.y - estate.start.y) - Math.hypot(b.x - estate.start.x, b.y - estate.start.y))[0]
  const d = deck ? project(deck.x + deck.w / 2, deck.y + deck.d) : start
  return { menu: { x: start.x, y: start.y - 60, zoom: 1 }, customise: { x: d.x, y: d.y - 40, zoom: 2 } }
}
