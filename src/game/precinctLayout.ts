import type { Point } from '../state/saveGame'
import type { HotspotId } from './events'
import { depthAt, type Footprint } from './isometric'

// Vertical-slice precinct layout (pure data, shared by the scene in precinct.ts and the regression tests).
// Coordinates are tiles (1 tile ≈ 1 m at the Habbo-style scale of docs/isometric-art-spec.md).
export const PRECINCT_SIZE: Point = { x: 30, y: 24 }
export const PRECINCT_SPAWN: Point = { x: 12.4, y: 16.2 }
/** Where the player stands on leaving Sunshine Minimart. */
export const PRECINCT_DOOR: Point = { x: 24.9, y: 8.5 }

export const HDB = { x: 2, y: 1, w: 18, d: 6 }
export const MART = { x: 22, y: 2, w: 6, d: 5.5 }
export const ROAD = { y: 17.6, d: 4.6 }
export const LINKWAY = { x: 5.9, y: 7, w: 1.8, d: 8.8 }
// The linkway lands just east of the bus shelter, whose route pole stands at the kerb past it.
export const SHELTER = { x: 1, y: 15.2, w: 4.6, d: 1.6 }
export const ROUTE_POLE = { x: SHELTER.x + SHELTER.w + .2, y: 17.1 }

/** Depth key for a solid footprint: anything in front of either visible face sorts above it (spec §Depth). */
export const buildingDepth = (f: Footprint) => depthAt(f.x, f.y + Math.min(f.w, f.d))

export const trees: [number, number, number, boolean?][] = [
  [.9, 3, 1], [.9, 8, 1.05], [.9, 12.6, .95], [10.2, 10.8, 1.25, true], [12.8, 13, .9], [24.3, 11.2, 1], [28.4, 12.8, .9],
  [29, 4, 1.1], [4, 23.6, 1], [11.5, 23.6, 1.1], [20.5, 23.6, 1], [27.5, 23.6, 1.05],
]
export const beds: Footprint[] = [{ x: 0, y: 1, w: 2, d: 13.3 }, { x: 8.5, y: 9, w: 5.5, d: 5.2 }, { x: 22, y: 10, w: 7.5, d: 4.2 }, { x: 28.2, y: 1, w: 1.8, d: 6.5 }]
export const pillars: Point[] = [2.4, 6, 9.5, 13, 16.5, 19.4].map(x => ({ x, y: 6.35 })).concat([6, 9.5, 13, 16.5].map(x => ({ x, y: 3.9 })))
export const lamps: Point[] = [{ x: 11.2, y: 17.15 }, { x: 21.8, y: 17.15 }, { x: 27, y: 17.15 }, { x: 8, y: 22.45 }, { x: 23, y: 22.45 }]
export const posts: Point[] = []
for (let y = LINKWAY.y + .3; y < LINKWAY.y + LINKWAY.d; y += 2.1) posts.push({ x: LINKWAY.x + .05, y }, { x: LINKWAY.x + LINKWAY.w - .17, y })

export const precinctHotspots: { id: HotspotId; label: string; at: Point; radius: number }[] = [
  { id: 'enter', label: 'Enter Sunshine Minimart', at: PRECINCT_DOOR, radius: .9 },
  { id: 'notice', label: 'Read the noticeboard', at: { x: 12.9, y: 2.4 }, radius: .9 },
  { id: 'may', label: 'Talk to Auntie May', at: { x: 8.75, y: 4.75 }, radius: .95 },
  { id: 'amir', label: 'Talk to Amir', at: { x: 5.1, y: 16.4 }, radius: .95 },
]

const small = (p: Point, s: number): Footprint => ({ x: p.x, y: p.y, w: s, d: s })
/** Ground-plane collision only: tall art (canopies, roofs, upper floors) never blocks, its trunk, post or wall does. */
export const precinctCollisions: Footprint[] = [
  { x: 0, y: 0, w: 30, d: 1 }, { x: 0, y: 23.4, w: 30, d: .6 }, { x: 29.4, y: 7.5, w: .6, d: 7 },
  { x: 2, y: 1, w: 18, d: .5 }, { x: 2, y: 1, w: 2.5, d: 3 }, ...pillars.map(p => small(p, .45)),
  { x: 7.05, y: 4.25, w: 1.4, d: 1.2 }, { x: 10.5, y: 1.7, w: 1.4, d: .45 }, { x: 17.6, y: 2, w: 1.8, d: 1.4 },
  { x: 20, y: 0, w: 2, d: 6.2 }, { x: 22, y: 0, w: 8, d: MART.y + MART.d }, ...beds,
  { x: 22.3, y: 7.7, w: 1.5, d: .5 }, { x: 25.7, y: 7.8, w: .7, d: .5 }, { x: 26.5, y: 7.7, w: 1.2, d: .6 },
  { x: 15.6, y: 10.3, w: 1.8, d: .3 }, { x: 18.2, y: 10.3, w: .6, d: 1.8 }, { x: 15.95, y: 12.1, w: .65, d: .55 },
  { x: 9.8, y: 15.1, w: 1.4, d: .45 }, { x: 18.6, y: 15.1, w: 1.4, d: .45 }, { x: 14.3, y: 11, w: .45, d: 1.4 },
  ...[...lamps, { x: 14.5, y: 17.1 }, { x: 17.3, y: 22.4 }, { x: 28.5, y: 17.1 }, ROUTE_POLE].map(p => small(p, .2)),
  small({ x: 8.1, y: 8.2 }, .36), small({ x: 14.4, y: 15.1 }, .36),
  { x: SHELTER.x + .4, y: SHELTER.y, w: SHELTER.w - .9, d: .25 }, { x: SHELTER.x + .6, y: SHELTER.y + .35, w: SHELTER.w - 1.4, d: .4 },
  ...[SHELTER.x + .2, SHELTER.x + SHELTER.w - .3].map(x => small({ x, y: SHELTER.y + .1 }, .14)),
  ...posts.map(p => small(p, .14)),
  ...trees.map(([x, y]) => small({ x: x - .1, y: y - .1 }, .2)),
  ...precinctHotspots.filter(h => h.id === 'may' || h.id === 'amir').map(h => ({ x: h.at.x - .13, y: h.at.y - .13, w: .26, d: .26 })),
]

/** Residents stroll on footpaths only: the kerbside path, the linkway, along the void deck, to the shop, across the road. */
export const precinctRoutes: { sheet: string; path: Point[] }[] = [
  { sheet: 'auntie', path: [{ x: 2.6, y: 16.85 }, { x: 14, y: 16.85 }, { x: 28.5, y: 16.85 }] },
  { sheet: 'student', path: [{ x: 6.8, y: 7.7 }, { x: 6.8, y: 16.3 }] },
  { sheet: 'office-worker', path: [{ x: 4.95, y: 7.7 }, { x: 4.95, y: 7 }, { x: 18.7, y: 7 }, { x: 18.7, y: 7.7 }] },
  { sheet: 'makcik', path: [{ x: 14.6, y: 8.5 }, { x: 21.2, y: 8.5 }, { x: 24.4, y: 8.6 }] },
  { sheet: 'kopi-uncle', path: [{ x: 16, y: 16.85 }, { x: 16, y: 23 }, { x: 26, y: 23 }] },
]
