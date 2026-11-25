import type { Point } from '../state/saveGame'

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32

export function project(x: number, y: number, height = 0): Point {
  return { x: (x - y) * TILE_WIDTH / 2, y: (x + y) * TILE_HEIGHT / 2 - height }
}

export function unproject(x: number, y: number): Point {
  return { x: y / TILE_HEIGHT + x / TILE_WIDTH, y: y / TILE_HEIGHT - x / TILE_WIDTH }
}

export function screenMovement(x: number, y: number, strength: number): Point {
  const world = unproject(x, y)
  const scale = strength / (Math.hypot(world.x, world.y) || 1)
  return { x: world.x * scale, y: world.y * scale }
}

export type Footprint = { x: number; y: number; w: number; d: number }
const PLAYER_RADIUS = 0.17
// Large districts use a cached broad phase; collision semantics stay identical.
const collisionGrids = new WeakMap<Footprint[], { length: number; cells: Map<string, Footprint[]> }>()
function nearbyScenery(point: Point, scenery: Footprint[]) {
  if(scenery.length<200)return scenery
  let grid=collisionGrids.get(scenery)
  if(!grid||grid.length!==scenery.length){
    grid={length:scenery.length,cells:new Map()}
    for(const r of scenery)for(let y=Math.floor(r.y/2);y<=Math.floor((r.y+r.d)/2);y++)for(let x=Math.floor(r.x/2);x<=Math.floor((r.x+r.w)/2);x++){
      const key=`${x},${y}`,list=grid.cells.get(key)??[];list.push(r);grid.cells.set(key,list)
    }
    collisionGrids.set(scenery,grid)
  }
  const result: Footprint[]=[]
  for(let y=Math.floor((point.y-PLAYER_RADIUS)/2);y<=Math.floor((point.y+PLAYER_RADIUS)/2);y++)for(let x=Math.floor((point.x-PLAYER_RADIUS)/2);x<=Math.floor((point.x+PLAYER_RADIUS)/2);x++)result.push(...grid.cells.get(`${x},${y}`)??[])
  return result
}

export function canStand(point: Point, size: Point, scenery: Footprint[]) {
  const { x, y } = point
  if (x < PLAYER_RADIUS || y < PLAYER_RADIUS || x > size.x - PLAYER_RADIUS || y > size.y - PLAYER_RADIUS) return false
  return !nearbyScenery(point, scenery).some(rect =>
    x + PLAYER_RADIUS > rect.x && x - PLAYER_RADIUS < rect.x + rect.w &&
    y + PLAYER_RADIUS > rect.y && y - PLAYER_RADIUS < rect.y + rect.d)
}

export function depthAt(x: number, y: number) {
  return (x + y) * TILE_HEIGHT / 2
}

/** Camera zoom for pixel art: whole steps when the view fits at 1× or more (square pixels), else shrink to fit. */
export const pixelZoom = (fit: number) => fit >= 1 ? Math.floor(fit) : Math.max(.18, fit)
