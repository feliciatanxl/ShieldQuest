import town from './maps/neighbourhood.tmj?raw'
import legacyReview from '../../docs/geography/before.tmj?raw'
import type { Footprint } from './isometric'

type MapObject = { name: string; type: string; x: number; y: number; width: number; height: number; polyline?: { x: number; y: number }[]; polygon?: {x:number;y:number}[];
  properties?: { name: string; value: string | number | boolean }[] }
type MapLayer = { type: 'tilelayer'; data: number[] } | { type: 'objectgroup'; objects: MapObject[] }
type TiledMap = { orientation: 'isometric'; width: number; height: number; tileheight: number; layers: MapLayer[] }
/** path: the points of a polyline object (walker routes), in tiles. */
export type MapProp = Footprint & { kind: string; name: string; properties: Record<string, unknown>; path?: { x: number; y: number }[] }

function loadMap(source: string) {
  const map: TiledMap = JSON.parse(source)
  const tiles = map.layers.find(layer => layer.type === 'tilelayer')?.data ?? []
  const objects = map.layers.flatMap(layer => layer.type === 'objectgroup' ? layer.objects : [])
  const props: MapProp[] = objects.map(object => ({
    kind: object.type, name: object.name,
    x: object.x / map.tileheight, y: object.y / map.tileheight,
    w: object.width / map.tileheight, d: object.height / map.tileheight,
    properties: { ...Object.fromEntries((object.properties ?? []).map(property => [property.name, property.value])),
      ...(object.polygon ? { polygon:JSON.stringify(object.polygon.map(p=>({x:(object.x+p.x)/map.tileheight,y:(object.y+p.y)/map.tileheight}))) } : {}) },
    path: object.polyline?.map(point => ({ x: (object.x + point.x) / map.tileheight, y: (object.y + point.y) / map.tileheight })),
  }))
  return { size: { x: map.width, y: map.height }, tiles, props }
}

// Read-only development comparison. Dead-code eliminated from production.
export const neighbourhood = loadMap(import.meta.env.DEV && new URLSearchParams(location.search).has('before') ? legacyReview : town)
export const groundColors = ["#a8bd83","#acc187","#aec28b","#a4b980","#d8cbbb","#dfd2bd","#dbcfbe","#d7c9b6","#878b98","#8a8e9b","#8d909d","#868a98","#dab8a5","#e2c3ab","#dcbba7","#e0bdac"]
