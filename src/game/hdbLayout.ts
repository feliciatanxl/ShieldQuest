import type { Footprint } from './isometric'
import { DECK } from './hdbModules'

/** The parts of a block the map describes: its footprint and Tiled properties. */
export type BlockSpec = Footprint & { properties: Record<string, unknown> }
/** A walkable HDB ground floor. Everything is in tiles except height (screen pixels of clear headroom). */
export type VoidDeck = { alongX: boolean; pillars: Footprint[]; cores: Footprint[]; walls: Footprint[]; height: number }

/** Column width in tiles: 12 px either side of its centre line on screen (MODULE.pillar in hdbModules.ts). */
export const PILLAR = .375
const evenly = (count: number, span: number) => Array.from({ length: count }, (_, i) => i * span / (count - 1))
const WALL = .16

/**
 * Lays out a void deck under a block from its map properties, so any block can have one:
 *  - voidDeck: true                   turns it on
 *  - pillarSpacing (tiles, def. 2.5)  centre-to-centre spacing of the pillars along the block
 *  - lobbyAt (0..1, def. 0.5)         where the lift lobby core sits along the block
 *  - closedSides                      comma list of walled sides: start, end (the short ends), back, front (long sides)
 *  - bay (tiles)                      when set, pillars stand on the bay grid of a modular block (hdbModules.ts)
 *  - deckHeight (px)                  clear headroom under the upper floors, DECK by default
 * The block's long axis sets its orientation. "Front" is the long side facing the camera (y + d for blocks along x,
 * x + w for blocks along y). Pillars stand in a row along each long side (and a middle row on deep blocks), and the
 * lift core leaves a passage at least two player-widths wide on both sides.
 */
export function voidDeckLayout(block: BlockSpec): VoidDeck {
  const alongX = block.w >= block.d
  const length = alongX ? block.w : block.d, depth = alongX ? block.d : block.w
  const spacing = Number(block.properties.pillarSpacing ?? 2.5)
  const height = Number(block.properties.deckHeight ?? DECK)
  const lobbyAt = Number(block.properties.lobbyAt ?? .5)
  const closed = new Set(String(block.properties.closedSides ?? '').split(',').map(side => side.trim()).filter(Boolean))
  // t runs along the block, u across it from the back (0) to the front (depth).
  const rect = (t: number, u: number, lt: number, lu: number): Footprint =>
    alongX ? { x: block.x + t, y: block.y + u, w: lt, d: lu } : { x: block.x + u, y: block.y + t, w: lu, d: lt }

  const coreLength = Math.min(1.8, length * .25), coreDepth = Math.max(.6, Math.min(1, depth - 1))
  const coreAt = Math.min(Math.max(lobbyAt * length - coreLength / 2, PILLAR + .6), length - PILLAR - .6 - coreLength)
  const core = rect(coreAt, (depth - coreDepth) / 2, coreLength, coreDepth)

  const bay = Number(block.properties.bay ?? 0)
  // On a modular block the pillars carry the bay walls above, so they stand on every bay line.
  const along = bay > 0
    ? Array.from({ length: Math.round(length / bay) + 1 }, (_, i) => Math.min(Math.max(i * bay - PILLAR / 2, 0), length - PILLAR))
    : evenly(Math.max(2, Math.round((length - PILLAR) / spacing) + 1), length - PILLAR)
  const across = depth > 3.2 ? [0, (depth - PILLAR) / 2, depth - PILLAR] : [0, depth - PILLAR]
  const overlaps = (a: Footprint, b: Footprint) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.d && a.y + a.d > b.y
  const pillars = along.flatMap(t => across.map(u => rect(t, u, PILLAR, PILLAR))).filter(pillar => !overlaps(pillar, core))

  const walls = [
    closed.has('start') && rect(0, 0, WALL, depth), closed.has('end') && rect(length - WALL, 0, WALL, depth),
    closed.has('back') && rect(0, 0, length, WALL), closed.has('front') && rect(0, depth - WALL, length, WALL),
  ].filter((wall): wall is Footprint => !!wall)
  return { alongX, pillars, cores: [core], walls, height }
}
