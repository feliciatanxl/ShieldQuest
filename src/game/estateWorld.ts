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
import { estateLighting } from './estateLighting'
import type { WorldLayout } from './world'

/**
 * The playable Sunshine Estate (docs/estate-migration.md): the Ang Mo Kio layout from estateLayout.ts drawn to the
 * approved slice standard. Nothing is drawn up front: ground is baked in CHUNK × CHUNK tile chunks and buildings on
 * approach, both evicted (textures freed) once well off screen, so memory stays flat however far the player walks.
 */
const CHUNK = 16
const MARGIN = 420, EVICT = 900 // px around the camera view: bake inside, free outside
const C = {
  pave: ['#d9d0be', '#d3c9b6'], grass: ['#7fbd5b', '#79b656'], path: '#cbbfa7', covered: '#d5c9b0', kerb: '#c9c3b4',
  road: '#59606a', white: '#f4f1e8', yellow: '#f0c23b', deck: ['#cfc8ba', '#c8c1b2'],
}
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
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const grass = E.ground[y * E.size.x + x] === 1
      g.floor(x, y, 1, 1, (grass ? C.grass : C.pave)[(x + y) & 1])
    }
    for (const b of decks[i]) for (let y = Math.max(y0, Math.floor(b.y)); y < Math.min(y1, b.y + b.d); y++) for (let x = Math.max(x0, Math.floor(b.x)); x < Math.min(x1, b.x + b.w); x++) {
      const fx = Math.max(x, b.x), fy = Math.max(y, b.y)
      g.floor(fx, fy, Math.min(x + 1, b.x + b.w) - fx, Math.min(y + 1, b.y + b.d) - fy, C.deck[(x + y) & 1])
    }
    for (const b of decks[i]) g.floor(b.x, b.y, b.w, b.d, '#20283a', 0, .12)
    for (const t of mats[i]) art.mat(g, t.x, t.y, t.w, t.d)
    for (const s of pathSegs[i]) strip(g, s.a, s.b, s.width, C.path)
    for (const s of coveredSegs[i]) strip(g, s.a, s.b, s.width - .2, C.covered)
    for (const s of roadSegs[i]) strip(g, s.a, s.b, s.width + .5, C.kerb)
    for (const s of roadSegs[i]) strip(g, s.a, s.b, s.width, C.road)
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
        if (s.width >= 3) for (const side of [1, -1]) dash(t, side * (s.width / 2 - .35), Math.min(1, len - t), .08, C.yellow)
        if (s.major && !s.oneway && t % 2 === 0) dash(t + .3, 0, Math.min(1, len - t - .3), .1, C.white)
        if (s.major && s.oneway && t % 3 === 0 && s.width >= 4) dash(t + .3, 0, Math.min(1, len - t - .3), .08, C.white)
      }
    }
    // Zebra crossings wherever a footpath crosses a carriageway.
    for (const s of pathSegs[i]) {
      const len = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y), ux = (s.b.x - s.a.x) / len, uy = (s.b.y - s.a.y) / len, vx = -uy, vy = ux
      for (let t = .2; t < len; t += .45) {
        const p = { x: s.a.x + ux * t, y: s.a.y + uy * t }
        if (!roadSegs[i].some(r => segDist(p, r.a, r.b) < r.width / 2 - .3)) continue
        for (let k = -1.5; k <= 1.5; k++) {
          const c = { x: p.x + vx * k * .42, y: p.y + vy * k * .42 }
          g.poly(C.white, [[c.x - ux * .2 + vx * .12, c.y - uy * .2 + vy * .12], [c.x + ux * .2 + vx * .12, c.y + uy * .2 + vy * .12], [c.x + ux * .2 - vx * .12, c.y + uy * .2 - vy * .12], [c.x - ux * .2 - vx * .12, c.y - uy * .2 - vy * .12]], 1, false)
        }
      }
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
    lamp: g => art.lamp(g), bikes: g => art.bikes(g), chess: g => art.chess(g), recycle: g => art.recycle(g), planter: g => art.planter(g),
    garden: g => art.garden(g), kopitiam: g => art.kopitiam(g), notice: g => art.notice(g), shelter: g => art.shelter(g, false),
  }
  const origin: Record<string, Point> = { tree: { x: .12, y: .12 }, shrub: { x: 0, y: 0 } }
  // PixelLab estate sprites (docs/pixellab-assets.md): anchored on their lowest opaque pixel (trunk or feet), lifted
  // where the sprite carries its own small planting base; those are only used on lawns.
  const SPRITE_TREES: (string | null)[] = [null, 'rain-tree-b', null, 'tembusu', null, 'palm', 'flame-tree', null, 'rain-tree-a', 'frangipani', null, null]
  const SPRITE_SHRUBS: (string | null)[] = ['bougainvillea', 'ixora', null, 'angsana']
  const LAWN_ONLY: Record<string, number> = { 'flame-tree': 4, 'rain-tree-a': 11, frangipani: 9, angsana: 0 }
  const anchors = new Map<string, Point>()
  const anchor = (key: string) => {
    if (!anchors.has(key)) {
      const src = scene.textures.get(key).getSourceImage() as HTMLImageElement, cv = document.createElement('canvas')
      cv.width = src.width; cv.height = src.height
      const ctx = cv.getContext('2d')!; ctx.drawImage(src, 0, 0)
      const data = ctx.getImageData(0, 0, src.width, src.height).data
      let found = { x: src.width / 2, y: src.height - 1 }
      rows: for (let y = src.height - 1; y >= 0; y--) {
        let sum = 0, n = 0
        for (let x = 0; x < src.width; x++) if (data[(y * src.width + x) * 4 + 3] > 128) { sum += x; n++ }
        if (n) { found = { x: sum / n, y }; break rows }
      }
      anchors.set(key, found)
    }
    return anchors.get(key)!
  }
  const sprite = (name: string, x: number, y: number, depth: number, lift = 0) => {
    const key = 'pl-estate-' + name, a = anchor(key), p = project(x, y)
    return scene.add.image(Math.round(p.x - a.x), Math.round(p.y - a.y - 2 + lift), key).setOrigin(0).setDepth(depth)
  }
  const pick = (names: (string | null)[], t: Thing) => {
    const name = names[t.variant % names.length]
    if (!name || !scene.textures.exists('pl-estate-' + name)) return null
    return name in LAWN_ONLY && E.ground[Math.floor(t.y) * E.size.x + Math.floor(t.x)] !== 1 ? null : name
  }
  function placeThings(c: Chunk, i: number) {
    for (const t of thingsIn[i]) {
      const spriteName = t.kind === 'tree' ? pick(SPRITE_TREES, t) : t.kind === 'shrub' ? pick(SPRITE_SHRUBS, t) : t.kind === 'kopitiam' && scene.textures.exists('pl-estate-kopitiam-set') ? 'kopitiam-set' : null
      if (spriteName) {
        const c0 = { x: t.x + t.w / 2, y: t.y + t.d / 2 }
        c.things.push(sprite(spriteName, c0.x, c0.y, buildingDepth(t), LAWN_ONLY[spriteName] ?? 0))
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
      c.things.push(bakeAt(scene, `et-${t.kind}-${t.kind === 'tree' || t.kind === 'shrub' ? t.variant : 0}`, g => draw(g, t), t.x + o.x, t.y + o.y, buildingDepth(t.kind === 'shelter' ? { ...t, d: .8 } : t)))
      if (t.kind === 'shelter') c.shelterRoofs.push({ image: bakeAt(scene, 'et-shelter-roof', g => art.shelter(g, true), t.x, t.y, depthAt(t.x + t.w, t.y + t.d)), f: t })
    }
    for (const r of roofsIn[i]) c.roofs.push({ image: bake(scene, `et-roof-${r.i}`, g => art.linkwayRoof(g, r.a, r.b, r.width), depthAt(Math.max(r.a.x, r.b.x) + r.width / 2, Math.max(r.a.y, r.b.y) + r.width / 2)), a: r.a, b: r.b })
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
  type Live = { images: Phaser.GameObjects.Image[]; keys: string[]; main: Phaser.GameObjects.Image; cut?: Phaser.GameObjects.Image; unit?: Phaser.GameObjects.Image; unitRect?: Footprint; baked: ReturnType<typeof bakeTexture> }
  const live = new Map<Building, Live>()
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
    for (const p of art.pillarPositions(b)) images.push(bakeAt(scene, `et-pillar-${b.palette}`, g => art.pillar(g, b.palette), p.x, p.y, band(p.x + p.w, p.y + p.d)))
    let unit: Phaser.GameObjects.Image | undefined, unitRect: Footprint | undefined
    if (b.unit) {
      const len = Math.min(5, (b.alongX ? b.w : b.d) / 3)
      unitRect = b.alongX ? { x: b.x + b.w - len, y: b.y, w: len, d: b.d } : { x: b.x, y: b.y + b.d - len, w: b.w, d: len }
      unit = add(`eb-n-${b.id}`, g => art.shopUnit(g, b), buildingDepth(unitRect)).image
    }
    const upper = add(`eb-u-${b.id}`, g => art.hdbUpper(g, b), key, true)
    const cut = add(`eb-c-${b.id}`, g => art.hdbCut(g, b), key - 1).image.setVisible(false)
    return { images, keys, main: upper.image, cut, unit, unitRect, baked: upper.baked }
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
  const light = (kind: string, p: Point): MapProp => ({ kind, name: '', x: p.x, y: p.y, w: 0, d: 0, properties: {} })
  const lighting = estateLighting(scene, [
    ...E.things.filter((t, i) => t.kind === 'lamp' && i % 4 === 0).map(t => light('lamp', t)),
    ...E.busStops.map(f => light('bus', { x: f.x + f.w / 2, y: f.y + f.d / 2 })), ...E.hotspots.filter(h => h.mission).map(h => light('entry', h.at)),
  ])
  const hotspots: Hotspot[] = E.hotspots.map(({ id, label, at, radius, building }) => ({ id, label, at, radius, building }))
  const routes: MapProp[] = E.routes.map(({ sheet, path }) => ({ kind: 'walker', name: sheet, x: 0, y: 0, w: 0, d: 0, properties: { sheet }, path }))

  let primed = false
  return {
    hotspots, collisions: E.collisions, size: E.size, routes,
    hides: at => {
      const feet = project(at.x, at.y)
      for (const [b, l] of live) if (l.main.visible && at.x < b.x + b.w && at.y < b.y + b.d && [16, 36, 56].some(h => opaqueAt(l.baked, feet.x, feet.y - h))) return true
      return false
    },
    tick: (time, _delta, player) => {
      const view = scene.cameras.main.worldView
      if (time - lastScan > 200 || !primed) { lastScan = time; scan(view) }
      // First frame: bake everything on screen so the estate never appears half-drawn; then a few ms per frame.
      stream(primed ? 6 : 1e4)
      primed = true
      lighting(time)
      if (!player) return
      for (const [b, l] of live) {
        if (b.deck && l.cut) {
          const open = near(player, b, 0, 1.2) && (b.alongX ? player.x <= b.x + b.w : player.y <= b.y + b.d)
          l.main.setVisible(!open); l.cut.setVisible(open)
          const u = l.unitRect
          l.unit?.setAlpha(open && u && player.x < u.x + u.w && player.y < u.y + u.d ? .4 : 1)
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
