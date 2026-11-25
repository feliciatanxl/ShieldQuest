import type { Point } from '../state/saveGame'
import { footprint, insidePolygon } from './geoPolygon'

// Sunshine Estate: the OSM geometry stays untouched in neighbourhood.tmj; at load time real place names become
// original fictional ones, the park canopy is thinned where it hides buildings, and street furniture is added.
type Prop = { kind: string; name: string; x: number; y: number; w: number; d: number; properties: Record<string, unknown>; path?: Point[] }

const PLACES: Record<string, string> = {
  'Ang Mo Kio Hub': 'Sunshine Mall', 'Ang Mo Kio': 'Sunshine MRT', 'Broadway Plaza': 'Sunshine Plaza',
  'Djitsun Mall': 'Sunrise Arcade', '51@AMK': 'Sunshine Point', 'Masjid Al-Muttaqin': 'Masjid Sinar Pagi',
  'Jubilee Square': 'Rainbow Square', "McDonald's": 'Burger Corner', 'S11': 'Sunrise Kopi House',
  'The Pasar 724 Corner': 'Kopi Corner', 'Ang Mo Kio Polyclinic': 'Sunshine Polyclinic',
  'Cheng San Community Club': 'Sunshine Community Club', 'Centro': 'Sunshine Centre', 'Prata Raya': 'Prata Corner',
  'BBQ Box (AMK Hub)': 'Grill Box', 'Sprout @ AMK': 'Little Sprouts Preschool', 'Rubbish Dump': 'Refuse Centre',
  'North-South Corridor': 'Sunshine Expressway',
  'Courts Ang Mo Kio': 'Sunshine Plaza', 'Opposite Courts Ang Mo Kio': 'Opp Sunshine Plaza',
  'Before Al-Muttaqin Mosque': 'Before Masjid Sinar Pagi', 'Opposite Al-Muttaqin Mosque': 'Opp Masjid Sinar Pagi',
  'Before Ang Mo Kio Station Exit B': 'Sunshine MRT Exit B',
}
// Mission blocks keep the low numbers the story text uses; every other block follows from 106.
const MISSION_BLOCKS = ['702', '710', '715', '728', '724']
export const LANDMARK_TITLES: Record<string, string> = {
  'Sunshine Mall': 'SUNSHINE MALL · BUS INTERCHANGE', 'Sunshine MRT': 'SUNSHINE MRT',
  'Block 101': 'SUNSHINE MINIMART · BLK 101', 'Block 105': 'KOPI CORNER · MARKET & FOOD CENTRE',
}

export function fictionalise(props: Prop[]) {
  const blocks = new Map<string, string>()
  MISSION_BLOCKS.forEach((real, i) => blocks.set(real, String(101 + i)))
  for (const p of props) {
    const real = /^(?:Block|Blk) (\d+[A-Z]?)$/.exec(p.name)?.[1]
    if (real && !blocks.has(real)) blocks.set(real, String(101 + blocks.size))
  }
  const block = (real: string) => blocks.get(real) ?? real
  for (const p of props) {
    if (p.properties.number && blocks.has(String(p.properties.number))) p.properties.number = block(String(p.properties.number))
    p.name = PLACES[p.name] ?? p.name.replace(/\b(Block|Blk) (\d+[A-Z]?)\b/g, (_, word, n) => `${word} ${block(n)}`)
      .replace(/Ang Mo Kio|AMK/g, 'Sunshine')
    if (typeof p.properties.name === 'string') p.properties.name = p.name
  }
}

const near = (a: Point, b: Point, r: number) => Math.hypot(a.x - b.x, a.y - b.y) < r
function edgeDistance(at: Point, points: Point[]) {
  let best = Infinity
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], dx = b.x - a.x, dy = b.y - a.y
    const t = Math.max(0, Math.min(1, ((at.x - a.x) * dx + (at.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
    best = Math.min(best, Math.hypot(at.x - a.x - dx * t, at.y - a.y - dy * t))
  }
  return best
}

/** Thins canopy over buildings and adds benches, planters, bicycles, lamps and one playground on open pavement. */
export function dressEstate(props: Prop[], tiles: number[], width: number, keepClear: Point[], start: Point) {
  const buildings = props.filter(p => p.kind === 'geoBuilding').map(p => ({ p, points: footprint(p) }))
  const kindAt = (x: number, y: number) => { const t = tiles[Math.floor(y) * width + Math.floor(x)]; return t ? (t - 1) >> 2 : -1 }
  const covered = (at: Point, margin: number) => buildings.some(({ p, points }) =>
    at.x > p.x - margin && at.x < p.x + p.w + margin && at.y > p.y - margin && at.y < p.y + p.d + margin &&
    (insidePolygon(at, points) || edgeDistance(at, points) < margin))
  // Small approximate canopy trees crowding a building face or a door.
  let filler = 0
  const kept = props.filter(p => !(p.kind === 'tree' && p.properties.approximate &&
    (covered({ x: p.x, y: p.y }, 1.5) || keepClear.some(c => near(c, p, 3)) || filler++ % 2 === 1)))
  const placed: Prop[] = []
  const lanes = props.filter(p => (p.kind === 'geoPath' || p.kind === 'geoRoad') && p.path)
    .flatMap(p => p.path!.slice(1).map((b, i) => ({ points: [p.path![i], b], clear: Number(p.properties.width || 1) / 2 + .35 })))
  const onLane = (at: Point) => lanes.some(({ points: [a, b], clear }) =>
    at.x > Math.min(a.x, b.x) - clear && at.x < Math.max(a.x, b.x) + clear && at.y > Math.min(a.y, b.y) - clear &&
    at.y < Math.max(a.y, b.y) + clear && edgeDistance(at, [a, b]) < clear)
  const free = (at: Point, w: number, d: number, grass = false) => {
    for (let y = at.y - .5; y <= at.y + d + .5; y += .5) for (let x = at.x - .5; x <= at.x + w + .5; x += .5) {
      if (!(kindAt(x, y) === 1 || grass && kindAt(x, y) === 0) || covered({ x, y }, 0) || onLane({ x, y })) return false
    }
    return !keepClear.some(c => near(c, at, 3.5)) && !placed.some(o => near(o, at, 2.2)) && !covered(at, 1)
  }
  const add = (kind: string, at: Point, w: number, d: number) => placed.push({ kind, name: '', x: at.x, y: at.y, w, d, properties: { sunshine: true } })
  // One playground on open paving close to where the player starts.
  search: for (let r = 4; r < 45; r++) for (let a = 0; a < 24; a++) {
    const at = { x: Math.round(start.x + Math.cos(a / 24 * Math.PI * 2) * r), y: Math.round(start.y + Math.sin(a / 24 * Math.PI * 2) * r) }
    if (free(at, 3, 2.5, true)) { add('play', at, 3, 2.5); add('bench', { x: at.x + 3.6, y: at.y + 1 }, .5, .3); break search }
  }
  // A fitness corner, and kopitiam tables on the paving outside Kopi Corner (Block 105).
  const spot = (kind: string, from: Point, w: number, d: number) => {
    for (let r = 2; r < 40; r++) for (let a = 0; a < 24; a++) {
      const at = { x: Math.round(from.x + Math.cos(a / 24 * Math.PI * 2) * r), y: Math.round(from.y + Math.sin(a / 24 * Math.PI * 2) * r) }
      if (free(at, w, d, true)) { add(kind, at, w, d); return at }
    }
  }
  spot('fitness', { x: start.x + 12, y: start.y - 12 }, 2.5, 2)
  const kopi = props.find(p => p.kind === 'geoBuilding' && p.name === 'Block 105')
  if (kopi) for (let i = 0; i < 3; i++) spot('kopitiam', { x: kopi.x + kopi.w + .5, y: kopi.y + kopi.d / 2 + i }, .6, .6)
  // Residential void decks get a little street life on the paving out front.
  const rotation = ['bench', 'bin', 'bikes', 'planter', 'lamp', 'chess', 'recycle'] as const
  const sizes = { bench: [.5, .3], planter: [.9, .4], bikes: [.6, 1.4], lamp: [.12, .12], bin: [.3, .3], chess: [.7, .7], recycle: [.9, .4] }
  let n = 0
  for (const { p, points } of buildings.filter(b => b.p.properties.residential)) {
    const cx = p.x + p.w / 2, cy = p.y + p.d / 2
    for (const [ax, ay] of [[1.5, 0], [0, 1.5], [1.5, .5], [.5, 1.5], [-1.5, 0], [0, -1.5]].flatMap(([x, y]) => [[x, y], [x * 1.4, y * 1.4]])) {
      const at = { x: Math.round((ax > 0 ? p.x + p.w + ax : ax < 0 ? p.x + ax : cx) * 2) / 2, y: Math.round((ay > 0 ? p.y + p.d + ay : ay < 0 ? p.y + ay : cy) * 2) / 2 }
      const kind = rotation[n % rotation.length], [w, d] = sizes[kind]
      if (!insidePolygon(at, points) && free(at, w, d)) { add(kind, at, w, d); n++; break }
    }
  }
  if (import.meta.env?.DEV) console.assert(placed.every(o => !covered(o, 0)), 'Sunshine dressing placed inside a building')
  // Community gardens beside every fourth residential block.
  buildings.filter(b => b.p.properties.residential).forEach(({ p }, i) => {
    if (i % 4 === 0) spot('garden', { x: p.x - 2.5, y: p.y + p.d / 2 }, 2, 1.5)
  })
  // Street trees on the verges of main avenues, about every 7 tiles; alternating sizes so rows don't look stamped.
  const roads = props.filter(p => p.kind === 'geoRoad' && p.path && !/^(service|residential|construction|proposed)$/.test(p.name) && Number(p.properties.width) >= 1.6)
  const trees: Point[] = []
  let planted = 0
  for (const r of roads) for (let i = 1; i < r.path!.length; i++) {
    const a = r.path![i - 1], b = r.path![i], len = Math.hypot(b.x - a.x, b.y - a.y), off = Number(r.properties.width) / 2 + .7
    if (!len) continue
    for (let n = 3; n < len - 2; n += 7) for (const side of [-1, 1]) {
      const at = { x: a.x + (b.x - a.x) * n / len - (b.y - a.y) / len * off * side, y: a.y + (b.y - a.y) * n / len + (b.x - a.x) / len * off * side }
      if (covered(at, .9) || onLane(at) || keepClear.some(c => near(c, at, 3)) || trees.some(t => near(t, at, 4)) || placed.some(o => near(o, at, 1.5))) continue
      trees.push(at)
      placed.push({ kind: 'tree', name: 'Street tree', x: at.x - .2, y: at.y - .2, w: .4, d: .4, properties: { sunshine: true, large: planted++ % 3 === 0 } })
    }
  }
  // Park canopy: break up the mapped grid with a deterministic jitter and a few large rain trees.
  for (const t of kept) if (t.kind === 'tree' && t.properties.approximate) {
    const j = Math.sin(t.x * 12.9898 + t.y * 78.233) * 43758.5453, r = j - Math.floor(j)
    t.x += (r - .5) * 1.2; t.y += (((r * 7) % 1) - .5) * 1.2
    if (r > .8) { t.properties = { ...t.properties, approximate: false, palm: true } }
  }
  return [...kept, ...placed]
}
