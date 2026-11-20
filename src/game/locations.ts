import type { Point } from '../state/saveGame'

export type Location = 'Neighbourhood' | 'Minimart' | 'House'
export const SHOP_DOOR: Point = { x: 13.24, y: 9.64 }
export const SHOP_SPAWN: Point = { x: 7.72, y: 7.22 }
export const SHOP_SIZE: Point = { x: 10, y: 8 }
export const SHOP_BACKGROUND = '#19141f'
export const HOUSE_SIZE = { x: 12, y: 10 }
export const HOUSE_SPAWN = { x: 9.72, y: 8.03 }
export const HOUSE_DOOR = { x: 23.56, y: 10.14 }
