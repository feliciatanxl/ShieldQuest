import { project, TILE_HEIGHT, type Footprint } from './isometric'
import type { BlockSpec } from './hdbLayout'

// Modular HDB blocks: the same few modules stacked to any length and height, so one set of art builds every block.
//   bay      one storey of one bay on the long face (windows, corridor ledge, recolourable panel layer)
//   end      one storey of the end wall on the short face
//   roof     the roof over one bay (parapet, plus a water tank or lift motor room on some bays)
//   ground   the void deck: pillars, lift core and floor (hdbLayout.ts)
// Sizes are in tiles along the ground and screen pixels upwards, on the 64×32 isometric grid.

/** Grid size of one bay along the block, and the standard block depth. Footprints are whole multiples of these. */
export const BAY = 2
export const BLOCK_DEPTH = 2
/** Chosen from side-by-side tests against the 62 px player at 40, 48 and 64 px storeys and 4, 8 and 12 floors (see
 *  docs/pixellab-assets.md). 64 px keeps a storey about one character tall and the void deck (104 px, about 1.7
 *  characters of headroom) at 1.6 storeys, the closest of the three to a real void deck; 48 and 40 px made the deck
 *  read as stilts and the windows as toys. Height is managed by placement instead: precinct blocks stay at about four
 *  storeys (hiding about 12 tiles behind them), and 8 to 12 storey blocks stand on the north and west map edges, where
 *  the ground they hide is off the map. */
export const STOREY = 64
export const DECK = 104
export const ROOF = 14

/** Exact canvases for module art, in pixels, and the anchor pixel that sits on the module's grid point. Every module is
 *  drawn lit, as a face turned towards the screen's lower left (sun from the left); the renderer mirrors it and darkens
 *  it for faces turned the other way, so one image serves both block orientations. PixelLab output must match these. */
export const MODULE = {
  /** One storey of one bay of the long face: anchor is the face's bottom-left corner (the bay's start, at slab level). */
  bay: { w: BAY * 32, h: STOREY + BAY * 16, anchor: { x: 0, y: STOREY } },
  /** One storey of the end wall, drawn as a lit face: anchor as for the bay. */
  end: { w: BLOCK_DEPTH * 32, h: STOREY + BLOCK_DEPTH * 16, anchor: { x: 0, y: STOREY } },
  /** The roof over one bay with its parapet on the long side, and headroom for a tank: anchor is the roof's back vertex. */
  roof: { w: (BAY + BLOCK_DEPTH) * 32, h: (BAY + BLOCK_DEPTH) * 16 + 26, anchor: { x: BLOCK_DEPTH * 32, y: 26 } },
  /** A void-deck column 0.375 tiles square and DECK - 7 px tall: anchor is the back vertex of its footprint. */
  pillar: { w: 24, h: DECK + 8, anchor: { x: 12, y: DECK - 5 } },
} as const

export type Module = { kind: 'bay' | 'end' | 'roof'; t: number; z: number; storey: number }
export type BlockPlan = {
  alongX: boolean; length: number; depth: number; bays: number; floors: number
  storey: number; deck: number; top: number; modules: Module[]
}

/** Every module of a block and where it goes: t along the block in tiles, z its base height in pixels. */
export function blockPlan(block: BlockSpec): BlockPlan {
  const alongX = block.w >= block.d
  const length = alongX ? block.w : block.d, depth = alongX ? block.d : block.w
  const floors = Math.max(1, Math.round(Number(block.properties.floors ?? 8)))
  const storey = Number(block.properties.storeyHeight ?? STOREY), deck = Number(block.properties.deckHeight ?? DECK)
  const bays = Math.max(1, Math.round(length / BAY))
  const modules: Module[] = []
  for (let s = 0; s < floors; s++) {
    const z = deck + s * storey
    for (let b = 0; b < bays; b++) modules.push({ kind: 'bay', t: b * BAY, z, storey: s })
    modules.push({ kind: 'end', t: length, z, storey: s })
  }
  const top = deck + floors * storey
  for (let b = 0; b < bays; b++) modules.push({ kind: 'roof', t: b * BAY, z: top, storey: floors })
  return { alongX, length, depth, bays, floors, storey, deck, top: top + ROOF, modules }
}

/** How many tiles of ground behind the block its full height can hide: each tile further back rises 32 px on screen. */
export const hiddenDepth = (plan: BlockPlan) => Math.ceil(plan.top / (TILE_HEIGHT))

type P = { x: number; y: number }
function hull(points: P[]): P[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (o: P, a: P, b: P) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const half = (list: P[]) => list.reduce<P[]>((h, p) => {
    while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop()
    h.push(p)
    return h
  }, [])
  const lower = half(sorted), upper = half([...sorted].reverse())
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

/** The screen outline of a block's upper floors (everything above the void deck), as a convex polygon. */
export function upperOutline(block: Footprint, plan: BlockPlan): P[] {
  const corners: P[] = []
  for (const x of [block.x, block.x + block.w]) for (const y of [block.y, block.y + block.d]) {
    for (const z of [plan.deck, plan.top]) corners.push(project(x, y, z))
  }
  return hull(corners)
}

function insideConvex(poly: P[], p: P) {
  // Inside when the point is on the same side of every edge, whichever way the outline winds.
  const sides = poly.map((a, i) => {
    const b = poly[(i + 1) % poly.length]
    return Math.sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x))
  })
  return sides.every(s => s >= 0) || sides.every(s => s <= 0)
}

/** Whether the upper floors cover part of a character standing here: never when in front of either visible wall;
 *  otherwise when its feet, waist or head (screen offsets) fall inside the block's outline. */
export function coversCharacter(block: Footprint, outline: P[], at: P, height = 60) {
  if (at.x >= block.x + block.w || at.y >= block.y + block.d) return false
  const feet = project(at.x, at.y)
  return [2, height / 2, height].some(lift => insideConvex(outline, { x: feet.x, y: feet.y - lift }))
}
