import type { Point } from '../state/saveGame'
import type { HotspotId } from './events'
import { canStand, type Footprint } from './isometric'
import { footprint, insidePolygon } from './geoPolygon'
import type { MapProp, SourceMap } from './mapSource'
import { ESTATE_SCALE as S } from './estateScale'
import district from './maps/amk-config.json'

/**
 * Sunshine Estate gameplay layout (docs/estate-migration.md). Pure: turns the Ang Mo Kio source map (5 m cells) into
 * gameplay coordinates (ESTATE_SCALE tiles per cell) and derives everything the renderer, collision, navigation and
 * missions need. Roads and footpaths keep their true alignment; building footprints are straightened into
 * axis-aligned blocks (same centre, length and depth) so walls read cleanly in the 2:1 projection.
 */
export type Road = { pts: Point[]; width: number; major: boolean; oneway: boolean }
export type Path = { pts: Point[]; width: number; covered: boolean }
export type BuildingStyle = 'hdb' | 'mall' | 'shops' | 'civic' | 'station' | 'small'
export type Mission = 'shop' | 'house' | 'houseH' | 'houseI'
export type Building = Footprint & {
  id: number; name: string; number: string; style: BuildingStyle; storeys: number; palette: number; alongX: boolean
  residential: boolean; mission?: Mission; unit?: string; deck: boolean
  /** 0 for a block's main wing (which carries its entrance); 1, 2 for the other wings of L, T and U-shaped blocks. */
  wing: number
}
export type Thing = Footprint & { kind: string; variant: number; alongY?: boolean }
export type EstateHotspot = { id: HotspotId; label: string; at: Point; radius: number; building?: { id: number; name: string; kind: 'shop' | 'home' | 'station' }; mission?: boolean }
export type Estate = {
  size: Point; roads: Road[]; paths: Path[]; greens: Point[][]; buildings: Building[]; things: Thing[]; busStops: Footprint[]
  /** Covered-linkway roof pieces (at most 4 tiles long), each with posts at both ends. */
  roofs: { a: Point; b: Point; width: number }[]
  routes: { sheet: string; path: Point[] }[]; hotspots: EstateHotspot[]; collisions: Footprint[]; start: Point; doors: Record<Mission, Point>
  /** 0 paving, 1 grass, 2 road, 3 footpath; one byte per tile. */
  ground: Uint8Array
}

const MISSION_LABELS: Record<Mission, [HotspotId, string]> = {
  shop: ['enter', 'Enter Sunshine Minimart'], house: ['house-entrance', 'Visit The Mysterious House'],
  houseH: ['house-h-entrance', 'Enter Freeze Frame House'], houseI: ['house-i-entrance', 'Enter Whisper Network House'],
}
const UNITS = ['PROVISION SHOP', 'CLINIC', 'BAKERY', 'HAIR SALON', 'PHARMACY', 'TAILOR', 'STATIONERY', 'FLORIST']
const sc = (p: Point): Point => ({ x: p.x * S, y: p.y * S })
const hash = (x: number, y: number) => { const j = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return j - Math.floor(j) }
const segDist = (p: Point, a: Point, b: Point) => {
  const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t)
}
const overlaps = (a: Footprint, b: Footprint, gap = 0) => a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.d + gap && b.y < a.y + a.d + gap
const centre = (f: Footprint): Point => ({ x: f.x + f.w / 2, y: f.y + f.d / 2 })

/** Minimum-area box around a polygon, snapped to the nearest grid axis. */
export function straighten(points: Point[]): Footprint {
  let best = { area: Infinity, a: 0, u0: 0, u1: 0, v0: 0, v1: 0 }
  for (let deg = 0; deg < 90; deg++) {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a)
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity
    for (const p of points) { const u = p.x * c + p.y * s, v = -p.x * s + p.y * c; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v) }
    const area = (u1 - u0) * (v1 - v0)
    if (area < best.area - 1e-9) best = { area, a, u0, u1, v0, v1 }
  }
  return frameRect(best.a, best.u0, best.u1, best.v0, best.v1)
}
/** A rectangle given in a rotated frame (angle a), straightened onto the grid around the same centre. */
function frameRect(a: number, u0: number, u1: number, v0: number, v1: number): Footprint {
  const c = Math.cos(a), s = Math.sin(a)
  const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, cx = cu * c - cv * s, cy = cu * s + cv * c
  const [w, d] = a < Math.PI / 4 ? [u1 - u0, v1 - v0] : [v1 - v0, u1 - u0]
  const half = (n: number) => Math.round(n * 2) / 2
  const W = Math.max(2, half(w)), D = Math.max(2, half(d))
  return { x: half(cx - W / 2), y: half(cy - D / 2), w: W, d: D }
}
const polygonArea = (pts: Point[]) => Math.abs(pts.reduce((sum, p, i) => { const q = pts[(i + 1) % pts.length]; return sum + p.x * q.y - q.x * p.y }, 0)) / 2
/** Footprint as straightened rectangles: one for compact shapes, up to three wings for L, T and U-shaped blocks. */
export function wings(points: Point[]): Footprint[] {
  const whole = straighten(points)
  if (polygonArea(points) / (whole.w * whole.d) > .72) return [whole]
  let best = { area: Infinity, a: 0 }
  for (let deg = 0; deg < 90; deg++) {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a)
    const us = points.map(p => p.x * c + p.y * s), vs = points.map(p => -p.x * s + p.y * c)
    const area = (Math.max(...us) - Math.min(...us)) * (Math.max(...vs) - Math.min(...vs))
    if (area < best.area - 1e-9) best = { area, a }
  }
  const { a } = best, c = Math.cos(a), s = Math.sin(a)
  const local = points.map(p => ({ x: p.x * c + p.y * s, y: -p.x * s + p.y * c }))
  const u0 = Math.floor(Math.min(...local.map(p => p.x))), v0 = Math.floor(Math.min(...local.map(p => p.y)))
  const W = Math.ceil(Math.max(...local.map(p => p.x))) - u0, H = Math.ceil(Math.max(...local.map(p => p.y))) - v0
  const filled = new Uint8Array(W * H)
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) filled[j * W + i] = insidePolygon({ x: u0 + i + .5, y: v0 + j + .5 }, local) ? 1 : 0
  const total = filled.reduce((n, v) => n + v, 0), out: Footprint[] = []
  for (let k = 0; k < 3; k++) {
    // Largest all-filled rectangle (histogram method).
    const h = new Array(W).fill(0)
    let top = { area: 0, i0: 0, i1: 0, j0: 0, j1: 0 }
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) h[i] = filled[j * W + i] ? h[i] + 1 : 0
      const stack: number[] = []
      for (let i = 0; i <= W; i++) {
        const cur = i < W ? h[i] : 0
        while (stack.length && h[stack[stack.length - 1]] >= cur) {
          const height = h[stack.pop()!], left = stack.length ? stack[stack.length - 1] + 1 : 0, area = height * (i - left)
          if (area > top.area) top = { area, i0: left, i1: i, j0: j - height + 1, j1: j + 1 }
        }
        stack.push(i)
      }
    }
    if (top.area < Math.max(12, total * .12) || Math.min(top.i1 - top.i0, top.j1 - top.j0) < 3) break
    for (let j = top.j0; j < top.j1; j++) for (let i = top.i0; i < top.i1; i++) filled[j * W + i] = 0
    out.push(frameRect(a, u0 + top.i0, u0 + top.i1, v0 + top.j0, v0 + top.j1))
  }
  return out.length ? out : [whole]
}

function style(p: MapProp, area: number): BuildingStyle {
  if (p.properties.residential) return 'hdb'
  if (/MRT/.test(p.name)) return 'station'
  if (/Mall|Plaza|Point|Arcade|Centre|Square|Hub/.test(p.name)) return 'mall'
  if (/Masjid|School|Preschool|Polyclinic|Community|Library|Church|Temple/.test(p.name)) return 'civic'
  return Number(p.properties.levels ?? 1) <= 2 && area < 60 ? 'small' : 'shops'
}

/** Local frame of a block: t runs along its length, s from its back (0) to its open front (depth). */
export function blockFrame(b: Footprint & { alongX: boolean }) {
  const length = b.alongX ? b.w : b.d, depth = b.alongX ? b.d : b.w
  const rect = (t: number, s: number, lt: number, ls: number): Footprint => b.alongX ? { x: b.x + t, y: b.y + s, w: lt, d: ls } : { x: b.x + s, y: b.y + t, w: ls, d: lt }
  const point = (t: number, s: number): Point => b.alongX ? { x: b.x + t, y: b.y + s } : { x: b.x + s, y: b.y + t }
  return { length, depth, rect, point }
}
export const PILLAR = .45
/** Ground-level solids of a block: void decks keep a back wall, stair core, optional shop unit and pillars. */
export function buildingSolids(b: Building): Footprint[] {
  if (!b.deck) return [b]
  const f = blockFrame(b), unit = b.unit ? Math.min(5, f.length / 3) : 0
  const solids = [f.rect(0, 0, f.length, .6), f.rect(0, 0, 2.5, Math.min(3, f.depth - 2))]
  if (unit) solids.push(f.rect(f.length - unit, 0, unit, f.depth))
  for (const p of pillars(b)) solids.push(f.rect(p.x, p.y, PILLAR, PILLAR))
  return solids
}
/** Pillar positions in the block frame (x: along, y: across). */
export function pillars(b: Building): Point[] {
  const f = blockFrame(b), end = f.length - (b.unit ? Math.min(5, f.length / 3) : 0) - .8, out: Point[] = []
  for (let t = 3.2; t < end; t += 3.6) {
    out.push({ x: t, y: f.depth - PILLAR - .15 })
    if (f.depth >= 5) out.push({ x: t, y: f.depth / 2 - .1 })
  }
  return out
}

export function buildEstate(map: SourceMap): Estate {
  const size = { x: Math.ceil(map.size.x * S), y: Math.ceil(map.size.y * S) }
  const props = map.props
  const roads: Road[] = props.filter(p => p.kind === 'geoRoad' && p.path && p.path.length > 1).map(p => ({
    pts: p.path!.map(sc), width: Math.max(1.8, Number(p.properties.width || 1) * S), major: Number(p.properties.width || 1) >= 1.6, oneway: Boolean(p.properties.oneway),
  }))
  const paths: Path[] = props.filter(p => p.kind === 'geoPath' && p.path && p.path.length > 1).map(p => ({
    pts: p.path!.map(sc), width: Math.max(1.4, Number(p.properties.width || .6) * S), covered: Boolean(p.properties.covered),
  }))
  const greens = props.filter(p => p.kind === 'geoGreen' && p.properties.polygon).map(p => footprint(p).map(sc))

  // Ground classes per tile: paving, the source map's grass, green areas, footpaths, roads (later wins).
  const ground = new Uint8Array(size.x * size.y)
  for (let y = 0; y < size.y; y++) for (let x = 0; x < size.x; x++) {
    const t = map.tiles[Math.floor(y / S) * map.size.x + Math.floor(x / S)]
    if (t && (t - 1) >> 2 === 0) ground[y * size.x + x] = 1
  }
  for (const g of greens) {
    const x0 = Math.max(0, Math.floor(Math.min(...g.map(p => p.x)))), x1 = Math.min(size.x - 1, Math.ceil(Math.max(...g.map(p => p.x))))
    const y0 = Math.max(0, Math.floor(Math.min(...g.map(p => p.y)))), y1 = Math.min(size.y - 1, Math.ceil(Math.max(...g.map(p => p.y))))
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (insidePolygon({ x: x + .5, y: y + .5 }, g)) ground[y * size.x + x] = 1
  }
  const stroke = (pts: Point[], width: number, value: number) => {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], r = width / 2
      for (let y = Math.max(0, Math.floor(Math.min(a.y, b.y) - r)); y <= Math.min(size.y - 1, Math.ceil(Math.max(a.y, b.y) + r)); y++)
        for (let x = Math.max(0, Math.floor(Math.min(a.x, b.x) - r)); x <= Math.min(size.x - 1, Math.ceil(Math.max(a.x, b.x) + r)); x++)
          if (segDist({ x: x + .5, y: y + .5 }, a, b) <= r) ground[y * size.x + x] = value
    }
  }
  paths.forEach(p => stroke(p.pts, p.width, 3))
  roads.filter(r => !r.major).forEach(r => stroke(r.pts, r.width, 4))
  roads.filter(r => r.major).forEach(r => stroke(r.pts, r.width, 2))
  const at = (p: Point) => p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y ? 255 : ground[Math.floor(p.y) * size.x + Math.floor(p.x)]
  /** Whether a footprint touches a carriageway; major: main roads only (minor driveways give way to buildings). */
  const onRoad = (f: Footprint, margin = .3, major = false) => {
    for (let y = Math.floor(f.y - margin); y < f.y + f.d + margin; y++) for (let x = Math.floor(f.x - margin); x < f.x + f.w + margin; x++) {
      const v = at({ x: x + .5, y: y + .5 })
      if (v === 2 || (!major && v === 4)) return true
    }
    return false
  }
  const inMap = (f: Footprint) => f.x >= 0 && f.y >= 0 && f.x + f.w <= size.x && f.y + f.d <= size.y

  // Missions keep the buildings their entrances belonged to (the minimart stays in Block 101).
  const geo = props.filter(p => p.kind === 'geoBuilding')
  const missionOf = new Map<MapProp, Mission>()
  for (const [mission, point] of Object.entries(district.entrances) as [Mission, Point][]) {
    const dist = (p: MapProp) => { const pts = footprint(p); return Math.min(...pts.map((a, i) => segDist(point, a, pts[(i + 1) % pts.length]))) }
    const owner = (mission === 'shop' ? geo.find(p => String(p.properties.number) === '101') : undefined) ?? [...geo].sort((a, b) => dist(a) - dist(b))[0]
    if (owner) missionOf.set(owner, mission)
  }
  // Straighten, largest first, shrinking any block that would sit on a road or crowd a neighbour.
  const buildings: Building[] = []
  /** The longest stretch of a block clear of main roads, trimmed along its length, then across its depth. */
  const trim = (q: Footprint): Footprint => {
    for (const alongX of q.w >= q.d ? [true, false] : [false, true]) {
      const len = alongX ? q.w : q.d, ok: boolean[] = []
      for (let t = 0; t < len; t += .5) ok.push(!onRoad(alongX ? { x: q.x + t, y: q.y, w: .5, d: q.d } : { x: q.x, y: q.y + t, w: q.w, d: .5 }, .3, true))
      if (ok.every(Boolean)) return q
      let best = [0, 0], start = -1
      ok.concat(false).forEach((v, i) => { if (v && start < 0) start = i; if (!v && start >= 0) { if (i - start > best[1] - best[0]) best = [start, i]; start = -1 } })
      const from = best[0] * .5, to = Math.min(len, best[1] * .5), cut = to - from
      if (cut >= Math.max(3, len * .45)) q = alongX ? { ...q, x: q.x + from + .3, w: cut - .6 } : { ...q, y: q.y + from + .3, d: cut - .6 }
    }
    return q
  }
  // Each wing is clipped to the map; wings off the map, or too thin once clipped, are dropped.
  const clip = (r: Footprint) => { const x = Math.max(.5, r.x), y = Math.max(.5, r.y); return { x, y, w: Math.min(size.x - .5, r.x + r.w) - x, d: Math.min(size.y - .5, r.y + r.d) - y } }
  const drafts = geo.flatMap(p => wings(footprint(p).map(sc)).map((r, part) => ({ p, part, r: clip(r) })))
    .filter(({ r }) => r.w >= 3 && r.d >= 3).sort((a, b) => Number(!missionOf.has(a.p)) - Number(!missionOf.has(b.p)) || b.r.w * b.r.d - a.r.w * a.r.d)
  // No straightened block may swallow another mapped building's centre.
  const centres = geo.map(p => { const pts = footprint(p).map(sc); return { p, x: pts.reduce((n, q) => n + q.x, 0) / pts.length, y: pts.reduce((n, q) => n + q.y, 0) / pts.length } })
  let unitCount = 0
  for (const { p, part, r } of drafts) {
    // Clear of main roads and neighbours: slide up to 3 tiles, then shrink about the centre (wings may be dropped,
    // a block's main wing is kept even if it still grazes a neighbour's margin).
    // Mission buildings keep a forecourt: neighbours stay 4 tiles clear so their doors and signs stay in view.
    const clear = (q: Footprint) => !onRoad(q, .3, true) && !buildings.some(o => overlaps(o, q, o.mission || missionOf.has(p) ? 4 : 1.2)) && inMap(q) &&
      !centres.some(c => c.p !== p && c.x > q.x - 1 && c.x < q.x + q.w + 1 && c.y > q.y - 1 && c.y < q.y + q.d + 1)
    let rect = trim(r)
    for (let i = 0; i < 14 && !clear(rect); i++) {
      const slid = [0.5, 1, 1.5, 2, 3].flatMap(k => [[k, 0], [-k, 0], [0, k], [0, -k], [k, k], [-k, -k], [k, -k], [-k, k]]).map(([dx, dy]) => ({ ...rect, x: rect.x + dx, y: rect.y + dy })).find(clear)
      if (slid) { rect = slid; break }
      const c = centre(rect), w = Math.max(3, rect.w * .93), d = Math.max(3, rect.d * .93)
      rect = { x: c.x - w / 2, y: c.y - d / 2, w, d }
    }
    if (buildings.some(o => overlaps(o, rect, .2)) || onRoad(rect, 0, true) || !inMap(rect) || (part && !clear(rect))) continue
    const s = style(p, rect.w * rect.d), levels = Number(p.properties.levels ?? 1), mission = part ? undefined : missionOf.get(p)
    const number = String(p.properties.number ?? ''), alongX = rect.w >= rect.d
    const deck = s === 'hdb' && Math.min(rect.w, rect.d) >= 4 && Math.max(rect.w, rect.d) >= 10
    const unit = !deck ? undefined : part ? undefined : mission === 'shop' ? 'SUNSHINE MINIMART' : p.name === 'Block 105' ? 'KOPI CORNER' : hash(rect.x, rect.y) < .4 ? UNITS[unitCount++ % UNITS.length] : undefined
    const storeys = s === 'hdb' ? Math.max(2, Math.min(5, Math.round(levels / 4) + 1)) : s === 'mall' ? 3 : s === 'small' ? 1 : s === 'shops' ? Math.min(3, Math.max(2, levels)) : 2
    buildings.push({ ...rect, id: Number(p.properties.osmId) * (part ? 10 : 1) + part, wing: part, name: p.name || 'Neighbourhood building', number, style: s, storeys, palette: Math.floor(hash(rect.y, rect.x) * 5), alongX, residential: Boolean(p.properties.residential), mission, unit, deck })
  }

  // Driveways end where a block now stands; the rest of each minor road stays. Then all roads are one ground class.
  const insideAny = (p: Point, m = .2) => buildings.some(b => p.x > b.x - m && p.x < b.x + b.w + m && p.y > b.y - m && p.y < b.y + b.d + m)
  for (const b of buildings) for (let y = Math.max(0, Math.floor(b.y)); y < Math.min(size.y, b.y + b.d); y++) for (let x = Math.max(0, Math.floor(b.x)); x < Math.min(size.x, b.x + b.w); x++)
    if (ground[y * size.x + x] === 4) ground[y * size.x + x] = 0
  for (let i = 0; i < ground.length; i++) if (ground[i] === 4) ground[i] = 2
  const cutRoads: Road[] = []
  for (const r of roads) {
    if (r.major) { cutRoads.push(r); continue }
    let run: Point[] = []
    const flush = () => { if (run.length > 1 && Math.hypot(run[run.length - 1].x - run[0].x, run[run.length - 1].y - run[0].y) > 1) cutRoads.push({ ...r, pts: run }); run = [] }
    for (let i = 1; i < r.pts.length; i++) {
      const a = r.pts[i - 1], b = r.pts[i], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / .5))
      for (let k = i === 1 ? 0 : 1; k <= n; k++) {
        const q = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }
        if (insideAny(q)) flush(); else run.push(q)
      }
    }
    flush()
  }
  roads.length = 0
  roads.push(...cutRoads)

  // Lawns: open paving well away from roads, footpaths and buildings turns to grass (town-centre plazas stay paved).
  const hard = new Float32Array(size.x * size.y).fill(Infinity), queue: number[] = []
  const civic = buildings.filter(b => b.style === 'mall' || b.style === 'station')
  for (let y = 0; y < size.y; y++) for (let x = 0; x < size.x; x++) {
    const i = y * size.x + x, p = { x: x + .5, y: y + .5 }
    if (ground[i] === 2 || ground[i] === 3 || buildings.some(b => p.x > b.x - .5 && p.x < b.x + b.w + .5 && p.y > b.y - .5 && p.y < b.y + b.d + .5)
      || civic.some(b => p.x > b.x - 9 && p.x < b.x + b.w + 9 && p.y > b.y - 9 && p.y < b.y + b.d + 9)) { hard[i] = 0; queue.push(i) }
  }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], x = i % size.x, y = (i - x) / size.x
    for (const j of [x > 0 ? i - 1 : -1, x < size.x - 1 ? i + 1 : -1, y > 0 ? i - size.x : -1, y < size.y - 1 ? i + size.x : -1])
      if (j >= 0 && hard[j] > hard[i] + 1) { hard[j] = hard[i] + 1; queue.push(j) }
  }
  for (let i = 0; i < ground.length; i++) if (ground[i] === 0 && hard[i] >= 3) ground[i] = 1

  const collisions: Footprint[] = buildings.flatMap(buildingSolids)
  const blocked = (p: Point, r = .3) => p.x < r || p.y < r || p.x > size.x - r || p.y > size.y - r || collisions.some(c => p.x > c.x - r && p.x < c.x + c.w + r && p.y > c.y - r && p.y < c.y + c.d + r)
  const inBuilding = (p: Point, m = 0) => buildings.some(b => p.x > b.x - m && p.x < b.x + b.w + m && p.y > b.y - m && p.y < b.y + b.d + m)
  const things: Thing[] = []
  const place = (t: Thing, solid: Footprint | Footprint[] | null = t) => {
    things.push(t)
    if (solid) collisions.push(...(Array.isArray(solid) ? solid : [solid]))
  }
  const free = (f: Footprint, m = .4) => inMap(f) && !onRoad(f, .2) && !inBuilding(centre(f), m + Math.max(f.w, f.d) / 2) && !things.some(t => overlaps(t, f, m))

  // Bus stops (shelter + route pole) and street furniture from the estate dressing, at standard sizes.
  const busStops = props.filter(p => p.kind === 'bus').map(p => { const c = sc(centre(p)); return { x: c.x - 2.3, y: c.y - .8, w: 4.6, d: 1.6 } })
    .filter(f => !inBuilding(centre(f), 2.5))
  for (const f of busStops) {
    things.push({ ...f, kind: 'shelter', variant: 0 })
    collisions.push({ x: f.x + .4, y: f.y, w: f.w - .9, d: .25 }, { x: f.x + .6, y: f.y + .35, w: f.w - 1.4, d: .4 }, { x: f.x + .2, y: f.y + .1, w: .14, d: .14 }, { x: f.x + f.w - .3, y: f.y + .1, w: .14, d: .14 },
      { x: f.x + f.w + .2, y: f.y + 1.9, w: .1, d: .1 })
  }
  const sizes: Record<string, [number, number]> = { bench: [1.4, .45], bin: [.36, .36], bikes: [1.8, 1.4], lamp: [.14, .14], chess: [1.4, 1.2], recycle: [1.8, .6], planter: [1.6, .6], garden: [3.4, 1], play: [5, 4], fitness: [5, 3.5], kopitiam: [1.6, 1.6] }
  for (const p of props.filter(p => p.properties.sunshine && sizes[p.kind])) {
    const [w, d] = sizes[p.kind], c = sc(centre(p)), f = { x: c.x - w / 2, y: c.y - d / 2, w, d }
    if (!free(f)) continue
    const solid = p.kind === 'play' ? [{ x: f.x + .4, y: f.y + .4, w: 1.4, d: 1.6 }, { x: f.x + 2.6, y: f.y + .5, w: 2, d: .3 }, { x: f.x + 2.9, y: f.y + 2.4, w: 1.4, d: .8 }]
      : p.kind === 'fitness' ? [{ x: f.x + .5, y: f.y + .4, w: 1.8, d: .3 }, { x: f.x + 3.1, y: f.y + .3, w: .6, d: 1.8 }, { x: f.x + .85, y: f.y + 2.1, w: .65, d: .55 }]
        : p.kind === 'garden' ? [{ x: f.x, y: f.y, w: 1.6, d: f.d }, { x: f.x + 1.8, y: f.y, w: 1.6, d: f.d }] : f
    place({ ...f, kind: p.kind, variant: Math.floor(hash(f.x, f.y) * 4) }, solid)
  }
  // Covered linkways: roof pieces with a post at each corner (kept off the carriageway).
  const roofs: Estate['roofs'] = []
  for (const p of paths.filter(p => p.covered)) for (let i = 1; i < p.pts.length; i++) {
    const a = p.pts[i - 1], b = p.pts[i], len = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(len / 4)), width = p.width + .5
    for (let k = 0; k < n; k++) {
      const pa = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }, pb = { x: a.x + (b.x - a.x) * (k + 1) / n, y: a.y + (b.y - a.y) * (k + 1) / n }
      if (inBuilding(pa) && inBuilding(pb)) continue
      roofs.push({ a: pa, b: pb, width })
      const nx = -(b.y - a.y) / (len || 1) * width / 2 * .9, ny = (b.x - a.x) / (len || 1) * width / 2 * .9
      for (const q of [pa, pb]) for (const sgn of [1, -1]) {
        const post = { x: q.x + nx * sgn - .06, y: q.y + ny * sgn - .06, w: .12, d: .12 }
        if (at(centre(post)) !== 2 && !inBuilding(centre(post))) collisions.push(post)
      }
    }
  }
  // Lamp posts along the kerbs of main roads, alternating sides.
  for (const r of roads.filter(r => r.major)) {
    let carry = 6
    for (let i = 1; i < r.pts.length; i++) {
      const a = r.pts[i - 1], b = r.pts[i], len = Math.hypot(b.x - a.x, b.y - a.y)
      for (let t = carry; t < len; t += 14) {
        const side = Math.round(t / 14) % 2 ? 1 : -1, off = r.width / 2 + .6
        const p = { x: a.x + (b.x - a.x) * t / len - (b.y - a.y) / len * off * side, y: a.y + (b.y - a.y) * t / len + (b.x - a.x) / len * off * side }
        const f = { x: p.x - .07, y: p.y - .07, w: .14, d: .14 }
        if (at(p) !== 2 && free(f, .8)) place({ ...f, kind: 'lamp', variant: 0 }, { x: f.x - .03, y: f.y - .03, w: .2, d: .2 })
      }
      carry = Math.max(0, carry - len)
    }
  }
  // Trees: mapped park and street trees, then extra canopy and shrubs filling each green area.
  const trees: Point[] = []
  const plantTree = (p: Point, scale: number, kind = 'tree') => {
    const f = { x: p.x - .12, y: p.y - .12, w: .24, d: .24 }
    if (at(p) === 2 || at(p) === 3 || at(p) === 255 || inBuilding(p, 2) || trees.some(t => Math.hypot(t.x - p.x, t.y - p.y) < 3.2) || !free(f, .9)) return
    trees.push(p)
    place({ ...f, kind, variant: Math.floor(hash(p.x, p.y) * 6) + (scale > 1.1 ? 6 : 0) }, f)
  }
  for (const t of props.filter(p => p.kind === 'tree')) plantTree(sc(centre(t)), t.properties.large || t.properties.palm ? 1.2 : 1)
  // Lawns and parks get a loose canopy, never in neat rows.
  for (let y = 2; y < size.y - 2; y += 5.5) for (let x = 2; x < size.x - 2; x += 5.5) {
    const p = { x: x + (hash(x, y) - .5) * 4, y: y + (hash(y, x) - .5) * 4 }
    if (at(p) === 1 && hash(p.x + 3, p.y) < .8) plantTree(p, hash(p.x, 1) > .7 ? 1.2 : 1)
  }
  for (let y = 3; y < size.y - 2; y += 3.3) for (let x = 3; x < size.x - 2; x += 3.3) {
    const p = { x: x + (hash(x, y) - .5) * 2, y: y + (hash(y, x) - .5) * 2 }
    const f = { x: p.x - .3, y: p.y - .3, w: .6, d: .6 }
    if (at(p) === 1 && hash(p.y, p.x) < .35 && !inBuilding(p, 1.5) && free(f, .3)) place({ ...f, kind: 'shrub', variant: Math.floor(hash(p.x + 1, p.y) * 4) }, null)
  }

  // Interaction anchors: residents and the noticeboard keep their mapped spots, moved clear if a block now stands there.
  const nudge = (p: Point) => {
    for (let r = 0; r < 8; r += .5) for (let a = 0; a < 16; a++) {
      const q = { x: p.x + Math.cos(a / 8 * Math.PI) * r, y: p.y + Math.sin(a / 8 * Math.PI) * r }
      if (!blocked(q, .45) && at(q) !== 2) return q
    }
    return p
  }
  const hotspots: EstateHotspot[] = []
  for (const kind of ['may', 'amir'] as const) {
    const p = props.find(p => p.kind === kind)
    if (!p) continue
    const q = nudge(sc(p))
    hotspots.push({ id: kind, label: kind === 'may' ? 'Talk to Auntie May' : 'Talk to Amir', at: q, radius: 1.3 })
    collisions.push({ x: q.x - .13, y: q.y - .13, w: .26, d: .26 })
  }
  for (const n of props.filter(p => p.kind === 'notice')) {
    const q = nudge(sc(centre(n)))
    place({ x: q.x - .9, y: q.y - .15, w: 1.8, d: .3, kind: 'notice', variant: 0 })
    hotspots.push({ id: 'notice', label: 'Read the noticeboard', at: { x: q.x, y: q.y + .9 }, radius: 1.1 })
  }
  // Doors: void-deck blocks are entered from the lift lobby (or a shop unit's front); others from the first clear face,
  // preferring the two faces the camera sees.
  const doors = {} as Record<Mission, Point>
  for (const b of buildings) {
    if (b.wing) continue
    let door: Point | undefined
    const f = blockFrame(b), unit = b.unit ? Math.min(5, f.length / 3) : 0
    if (b.deck) door = b.unit && (b.mission === 'shop' || b.unit === 'KOPI CORNER') ? f.point(f.length - unit / 2, f.depth + .9) : f.point(f.length / 2 - unit / 2, 1.4)
    else {
      const c = centre(b)
      const options = [{ x: c.x, y: b.y + b.d + .9 }, { x: b.x + b.w + .9, y: c.y }, { x: c.x, y: b.y - .9 }, { x: b.x - .9, y: c.y }]
      door = options.find(p => !blocked(p, .3) && at(p) !== 2)
    }
    if (!door || blocked(door, .25)) continue
    if (b.mission) {
      const [id, label] = MISSION_LABELS[b.mission]
      doors[b.mission] = door
      hotspots.push({ id, label, at: door, radius: 1.4, mission: true })
    } else {
      const kind = b.residential ? 'home' : b.style === 'station' ? 'station' : 'shop'
      hotspots.push({ id: `building-${b.id}` as HotspotId, label: `Enter ${b.name}`, at: door, radius: 1.4, building: { id: b.id, name: b.name, kind } })
    }
  }
  // Residents stroll their mapped routes, cut short where a route now meets a wall.
  const routes = props.filter(p => p.kind === 'walker' && p.path && p.path.length > 1).flatMap(p => {
    const pts = p.path!.map(sc), out: Point[] = [pts[0]]
    if (blocked(pts[0], .35)) return []
    walk: for (let i = 1; i < pts.length; i++) {
      const a = out[out.length - 1], b = pts[i], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / .2)
      for (let k = 1; k <= n; k++) {
        const q = { x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n }
        if (blocked(q, .35)) { if (k > 1) out.push({ x: a.x + (b.x - a.x) * (k - 1) / n, y: a.y + (b.y - a.y) * (k - 1) / n }); break walk }
      }
      out.push(b)
    }
    const length = out.slice(1).reduce((sum, q, i) => sum + Math.hypot(q.x - out[i].x, q.y - out[i].y), 0)
    return length > 4 ? [{ sheet: String(p.properties.sheet), path: out }] : []
  })
  // Players begin outside Sunshine Minimart, a couple of tiles out from its door.
  const shopDoor = hotspots.find(h => h.id === 'enter')?.at
  const start = nudge(shopDoor ? { x: shopDoor.x + .6, y: shopDoor.y + 1.6 } : sc(district.start))
  for (const m of Object.keys(MISSION_LABELS) as Mission[]) doors[m] ??= nudge(sc(district.entrances[m]))
  return { size, roads, paths, greens, buildings, things, busStops, roofs, routes, hotspots, collisions, start, doors, ground }
}

/** Whether a gameplay point is clear for a standing character. */
export const estateStandable = (e: Estate, p: Point) => canStand(p, e.size, e.collisions)
