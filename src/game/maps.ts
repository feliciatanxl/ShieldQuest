import town from './maps/neighbourhood.tmj?raw'
import legacyReview from '../../docs/geography/before.tmj?raw'
import { loadMap } from './mapSource'
export type { MapProp } from './mapSource'

// Read-only development comparison. Dead-code eliminated from production.
export const neighbourhood = loadMap(import.meta.env.DEV && new URLSearchParams(location.search).has('before') ? legacyReview : town)
// Minimap colours: the estate ground palette (estateSurface.ts), four variants per material.
export const groundColors = ["#93b46f","#96b772","#90b16c","#95b570","#d8d3c6","#dad5c8","#d5d0c3","#d9d4c7","#5d6266","#5f6468","#5b6064","#5e6367","#d29a78","#d49c7a","#cf9775","#d39b79"]
