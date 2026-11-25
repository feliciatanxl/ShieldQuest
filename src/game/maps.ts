import town from './maps/neighbourhood.tmj?raw'
import legacyReview from '../../docs/geography/before.tmj?raw'
import type { Footprint } from './isometric'
import district from './maps/amk-config.json'
import { dressEstate, fictionalise } from './sunshineEstate'

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
  if (!props.some(p => p.kind === 'geoRoad')) return { size: { x: map.width, y: map.height }, tiles, props }
  fictionalise(props)
  const clear = [district.start, ...Object.values(district.entrances)]
  return { size: { x: map.width, y: map.height }, tiles, props: dressEstate(props, tiles, map.width, clear, district.start) as MapProp[] }
}

// Read-only development comparison. Dead-code eliminated from production.
export const neighbourhood = loadMap(import.meta.env.DEV && new URLSearchParams(location.search).has('before') ? legacyReview : town)
// Minimap colours: the estate ground palette (estateSurface.ts), four variants per material.
export const groundColors = ["#93b46f","#96b772","#90b16c","#95b570","#d8d3c6","#dad5c8","#d5d0c3","#d9d4c7","#5d6266","#5f6468","#5b6064","#5e6367","#d29a78","#d49c7a","#cf9775","#d39b79"]
