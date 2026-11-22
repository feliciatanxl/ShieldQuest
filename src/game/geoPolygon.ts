import type { Point } from '../state/saveGame'

export const footprint = (p: { properties: Record<string, unknown> }): Point[] => JSON.parse(String(p.properties.polygon))
export function insidePolygon(at: Point, points: Point[]) {
  let inside = false
  for (let i=0,j=points.length-1;i<points.length;j=i++) {
    const a=points[i],b=points[j]
    if ((a.y>at.y)!==(b.y>at.y) && at.x<(b.x-a.x)*(at.y-a.y)/(b.y-a.y)+a.x) inside=!inside
  }
  return inside
}

