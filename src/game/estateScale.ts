import type { Point } from '../state/saveGame'
import district from './maps/amk-config.json'

/**
 * Gameplay scale of Sunshine Estate (docs/estate-migration.md): the Ang Mo Kio source map uses 5 m cells; the playable
 * estate uses 2.5 gameplay tiles per source cell, which lands roads (~4–8 tiles) and HDB slabs (~6 tiles deep) on the
 * proportions of the approved vertical slice while compressing walking distances to about 2 m per tile.
 */
export const ESTATE_SCALE = 2.5
/** Save revision for gameplay coordinates; saves on the source revision are migrated by scaling. */
export const ESTATE_REVISION = `${district.revision}@x${ESTATE_SCALE}`
export const toEstate = (p: Point): Point => ({ x: p.x * ESTATE_SCALE, y: p.y * ESTATE_SCALE })
export const ESTATE_SIZE: Point = { x: Math.ceil(district.width * ESTATE_SCALE), y: Math.ceil(district.height * ESTATE_SCALE) }
