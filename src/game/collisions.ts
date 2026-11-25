import type { Footprint } from './isometric'
import { voidDeckLayout } from './hdbLayout'
import { footprint, insidePolygon } from './geoPolygon'

type Prop = Footprint & { kind: string; properties: Record<string, unknown> }
// Walked under or over: roofs, flat markings, map metadata.
const nonSolid = new Set(['geoBuilding', 'geoRoad', 'geoPath', 'entry', 'shelter', 'bus', 'linkway', 'sign', 'bougainvillea', 'road', 'crossing', 'detail', 'walker', 'busroute', 'parking'])

/** Void-deck openings per footprint edge, as distances along the edge to each 1.8-tile gap's centre: one every ~7 tiles
 *  on edges that fit a gap; a block whose outline has no such edge opens the middle of its two longest edges.
 *  Shared by collisions and the drawn void-deck walls so what you see is what blocks you. */
export function voidDeckOpenings(points: { x: number; y: number }[]): number[][] {
  const lengths = points.map((a, i) => { const b = points[(i + 1) % points.length]; return Math.hypot(b.x - a.x, b.y - a.y) })
  const gaps = lengths.map(l => { const n = l < 2.4 ? 0 : Math.max(1, Math.round(l / 7)); return Array.from({ length: n }, (_, k) => (k + .5) * l / n) })
  if (gaps.every(g => !g.length)) [...lengths.keys()].sort((a, b) => lengths[b] - lengths[a]).slice(0, 2).forEach(i => { gaps[i] = [lengths[i] / 2] })
  return gaps
}

/** The scenery a character can't stand in. A block with a void deck contributes only its pillars, lift core and any
 *  walls, so people can walk underneath it; a shelter only its four corner posts. Kept free of Phaser so tests and
 *  tools can check walkability straight from the map. */
export function sceneryCollisions(props: Prop[]): Footprint[] {
  const solid: Footprint[] = props.filter(p => p.w > 0 && p.d > 0 && !nonSolid.has(p.kind) && !(p.kind === 'block' && p.properties.voidDeck))
  for (const p of props.filter(p => p.kind === 'geoBuilding')) {
    const points = footprint(p)
    if (p.properties.residential) {
      // Solid outer wall with void-deck openings (voidDeckOpenings) so the deck stays walkable.
      const openings=voidDeckOpenings(points)
      for (let i=0;i<points.length;i++) {
        const a=points[i],b=points[(i+1)%points.length],length=Math.hypot(b.x-a.x,b.y-a.y)
        const gaps=openings[i]
        for(let n=0;n<length;n+=.3){
          if(!gaps.some(c=>Math.abs(n-c)<.9))solid.push({x:a.x+(b.x-a.x)*n/length-.15,y:a.y+(b.y-a.y)*n/length-.15,w:.3,d:.3})
        }
      }
      const center = {x:p.x+p.w/2,y:p.y+p.d/2}
      if(insidePolygon(center,points))solid.push({...center,w:.5,d:.5})
    } else {
      // Fine polygon raster rather than blocking a rotated building's entire bounding box.
      for(let y=p.y;y<p.y+p.d;y+=.5)for(let x=p.x;x<p.x+p.w;x+=.5)
        if(insidePolygon({x:x+.25,y:y+.25},points))solid.push({x,y,w:.5,d:.5})
    }
  }
  for (const p of props.filter(p => p.kind === 'shelter' || p.kind === 'bus')) {
    for (const x of [p.x, p.x + p.w - .13]) for (const y of [p.y, p.y + p.d - .13]) solid.push({ x, y, w: .13, d: .13 })
  }
  for (const p of props.filter(p => p.kind === 'block' && p.properties.voidDeck)) {
    const deck = voidDeckLayout(p)
    solid.push(...deck.pillars, ...deck.cores, ...deck.walls)
  }
  return solid
}
