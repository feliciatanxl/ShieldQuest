import type { Point } from '../state/saveGame'
import district from './maps/amk-config.json'
import { ESTATE_SIZE, toEstate } from './estateScale'

export type Location = 'Building' | 'Neighbourhood' | 'Minimart' | 'House' | 'HouseH' | 'HouseI' | 'FreezeFrame' | 'Precinct'
// Outdoor positions are gameplay tiles (estateScale.ts); the mission doors are the source entrances, scaled.
export const NEIGHBOURHOOD_SIZE: Point = ESTATE_SIZE
export const SHOP_DOOR: Point = toEstate(district.entrances.shop)
export const SHOP_SPAWN: Point = { x: 7.72, y: 7.22 }
export const SHOP_SIZE: Point = { x: 10, y: 8 }
export const SHOP_BACKGROUND = '#19141f'
export const HOUSE_SIZE = { x: 12, y: 10 }
export const HOUSE_SPAWN = { x: 9.72, y: 8.03 }
export const HOUSE_DOOR = toEstate(district.entrances.house)

// SHIELD House H · Freeze Frame (Hold Before Acting)
export const HOUSE_H_DOOR: Point = toEstate(district.entrances.houseH)
export const HOUSE_H_SPAWN: Point = { x: 5.0, y: 6.8 }
export const HOUSE_H_SIZE: Point = { x: 10, y: 8 }
export const HOUSE_H_BACKGROUND = '#141e28'

// Playable Freeze Frame Minimart Investigation
export const FREEZE_FRAME_SPAWN: Point = { x: 7.2, y: 7.0 }
export const FREEZE_FRAME_SIZE: Point = { x: 10, y: 8 }
export const FREEZE_FRAME_BACKGROUND = '#100e16'

// SHIELD House I · Whisper Network (Identify the Influence)
export const HOUSE_I_DOOR: Point = toEstate(district.entrances.houseI)
export const HOUSE_I_SPAWN: Point = { x: 5.5, y: 6.8 }
export const HOUSE_I_SIZE: Point = { x: 11, y: 8 }
export const HOUSE_I_BACKGROUND = '#171d22'


export { BUILDING_SIZE, BUILDING_SPAWN } from './buildingEntrances'
