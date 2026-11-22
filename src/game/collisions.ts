import type { Footprint } from './isometric'
import { voidDeckLayout } from './hdbLayout'

type Prop = Footprint & { kind: string; properties: Record<string, unknown> }
// Walked under or over: roofs, flat markings, map metadata.
const nonSolid = new Set(['shelter', 'bus', 'linkway', 'sign', 'bougainvillea', 'road', 'crossing', 'detail', 'walker', 'busroute'])

/** The scenery a character can't stand in. A block with a void deck contributes only its pillars, lift core and any
 *  walls, so people can walk underneath it; a shelter only its four corner posts. Kept free of Phaser so tests and
 *  tools can check walkability straight from the map. */
export function sceneryCollisions(props: Prop[]): Footprint[] {
  const solid: Footprint[] = props.filter(p => p.w > 0 && p.d > 0 && !nonSolid.has(p.kind) && !(p.kind === 'block' && p.properties.voidDeck))
  for (const p of props.filter(p => p.kind === 'shelter' || p.kind === 'bus')) {
    for (const x of [p.x, p.x + p.w - .13]) for (const y of [p.y, p.y + p.d - .13]) solid.push({ x, y, w: .13, d: .13 })
  }
  for (const p of props.filter(p => p.kind === 'block' && p.properties.voidDeck)) {
    const deck = voidDeckLayout(p)
    solid.push(...deck.pillars, ...deck.cores, ...deck.walls)
  }
  return solid
}
