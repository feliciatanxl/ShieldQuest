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

export function canStand(point: Point, size: Point, scenery: Footprint[]) {
  const { x, y } = point
  if (x < PLAYER_RADIUS || y < PLAYER_RADIUS || x > size.x - PLAYER_RADIUS || y > size.y - PLAYER_RADIUS) return false
  return !scenery.some(rect =>
    x + PLAYER_RADIUS > rect.x && x - PLAYER_RADIUS < rect.x + rect.w &&
    y + PLAYER_RADIUS > rect.y && y - PLAYER_RADIUS < rect.y + rect.d)
}

export function depthAt(x: number, y: number) {
  return (x + y) * TILE_HEIGHT / 2
}
