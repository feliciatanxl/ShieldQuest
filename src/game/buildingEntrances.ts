import type { Point } from '../state/saveGame'
import type { MapProp } from './maps'
import type { Hotspot, HotspotId } from './events'
import { canStand, type Footprint } from './isometric'
import { footprint, insidePolygon } from './geoPolygon'

export type BuildingKind = 'shop' | 'home' | 'station'
export type BuildingVisit = { id: number; name: string; kind: BuildingKind; returnAt: Point }
export const BUILDING_SIZE = { x: 12, y: 10 }
export const BUILDING_SPAWN = { x: 8.4, y: 8.5 }
export const buildingCollisions: Footprint[] = [
  { x: 0, y: 0, w: 12, d: .2 }, { x: 0, y: 0, w: .2, d: 10 },
  { x: 1, y: 1, w: 3, d: .8 }, { x: 6, y: 1, w: 3, d: .8 },
  { x: 1.4, y: 4, w: 1.4, d: 2.6 }, { x: 4.5, y: 4, w: 1.4, d: 2.6 },
  { x: 9, y: 3.5, w: 1.6, d: 2 },
]

export function boundaryDistance(at: Point, polygon: Point[]) {
  let distance = Infinity
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length], dx = b.x - a.x, dy = b.y - a.y
    const t = Math.max(0, Math.min(1, ((at.x - a.x) * dx + (at.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
    distance = Math.min(distance, Math.hypot(at.x - a.x - t * dx, at.y - a.y - t * dy))
  }
  return distance
}

export function hotspotDistance(hotspot: Hotspot, at: Point) {
  const point = Math.hypot(hotspot.at.x - at.x, hotspot.at.y - at.y)
  if (!hotspot.approach) return point
  return Math.min(point, insidePolygon(at, hotspot.approach) ? .45 : boundaryDistance(at, hotspot.approach) + .45)
}

/** Gameplay entrances are approximations; the OSM extract supplies footprints, not verified door positions. */
export function buildingEntrances(props: MapProp[], collisions: Footprint[], size: Point, missions: Hotspot[]): Hotspot[] {
  const buildings = props.filter(p => p.kind === 'geoBuilding')
  const assigned = new Map<MapProp, Hotspot>()
  for (const mission of missions) {
    const nearest = (mission.id === 'enter' ? buildings.find(p => String(p.properties.number) === '702') : undefined)
      ?? [...buildings].sort((a, b) => boundaryDistance(mission.at, footprint(a)) - boundaryDistance(mission.at, footprint(b)))[0]
    if (nearest) assigned.set(nearest, mission)
  }
  return buildings.flatMap(p => {
    const polygon = footprint(p), mission = assigned.get(p)
    if (mission) return [{ ...mission, radius: 1.65, approach: polygon }]
    const candidates: { at: Point; score: number }[] = []
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length], dx = b.x - a.x, dy = b.y - a.y
      const length = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(length))
      for (let j = 0; j < steps; j++) for (const side of [-1, 1]) {
        const t = (j + .5) / steps
        const at = { x: a.x + dx * t - dy / (length || 1) * side * .85, y: a.y + dy * t + dx / (length || 1) * side * .85 }
        if (!insidePolygon(at, polygon) && canStand(at, size, collisions)) candidates.push({ at, score: (a.x + a.y + b.x + b.y) / 2 - Math.abs(t - .5) * 2 })
      }
    }
    candidates.sort((a, b) => b.score - a.score)
    if (!candidates.length) return []
    const id = Number(p.properties.osmId), name = p.name || 'Neighbourhood building'
    const kind: BuildingKind = p.properties.residential ? 'home' : name === 'Ang Mo Kio' || /mrt|station/i.test(name) ? 'station' : 'shop'
    return [{ id: `building-${id}` as HotspotId, label: `Enter ${name}`, at: candidates[0].at, radius: 1.65, approach: polygon, building: { id, name, kind } }]
  })
}

export function readBuildingVisit(raw: unknown): BuildingVisit | undefined {
  if (!raw || typeof raw !== 'object') return
  const p = raw as BuildingVisit
  if (!Number.isSafeInteger(p.id) || p.id <= 0 || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 100 ||
      !['shop', 'home', 'station'].includes(p.kind) || !p.returnAt || !Number.isFinite(p.returnAt.x) || !Number.isFinite(p.returnAt.y)) return
  return { id: p.id, name: p.name, kind: p.kind, returnAt: { ...p.returnAt } }
}
