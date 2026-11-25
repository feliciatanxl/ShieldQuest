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
  const kept = props.filter(p => !(p.kind === 'tree' && p.properties.approximate &&
    (covered({ x: p.x, y: p.y }, 1.5) || keepClear.some(c => near(c, p, 3)))))
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
  // Residential void decks get a little street life on the paving out front.
  const rotation = ['bench', 'planter', 'bikes', 'lamp'] as const
  const sizes = { bench: [.5, .3], planter: [.9, .4], bikes: [.6, 1.4], lamp: [.12, .12] }
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
  return [...kept, ...placed]
}
