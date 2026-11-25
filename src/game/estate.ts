import { buildEstate } from './estateLayout'
import { neighbourhood } from './maps'

/** The playable Sunshine Estate, derived once from the Ang Mo Kio source map. */
export const estate = buildEstate(neighbourhood)
