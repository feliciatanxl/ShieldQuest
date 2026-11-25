import type { Footprint } from './isometric'
import district from './maps/amk-config.json'
import { dressEstate, fictionalise } from './sunshineEstate'

type MapObject = { name: string; type: string; x: number; y: number; width: number; height: number; polyline?: { x: number; y: number }[]; polygon?: {x:number;y:number}[];
  properties?: { name: string; value: string | number | boolean }[] }
type MapLayer = { type: 'tilelayer'; data: number[] } | { type: 'objectgroup'; objects: MapObject[] }
type TiledMap = { orientation: 'isometric'; width: number; height: number; tileheight: number; layers: MapLayer[] }
/** path: the points of a polyline object (walker routes), in tiles. */
export type MapProp = Footprint & { kind: string; name: string; properties: Record<string, unknown>; path?: { x: number; y: number }[] }
export type SourceMap = { size: { x: number; y: number }; tiles: number[]; props: MapProp[] }

/** Parses a Tiled map (geographic source scale, 5 m cells); pure so tests can load it without Vite. */
export function loadMap(source: string): SourceMap {
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
