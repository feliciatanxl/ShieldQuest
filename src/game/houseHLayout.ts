import type { Footprint } from './isometric'
import type { Hotspot } from './events'
import { HOUSE_H_SIZE } from './locations'

export const houseHObjects: Hotspot[] = [
  { id: 'freeze-station', label: 'Launch Freeze Frame (Hold Before Acting)', at: { x: 5.0, y: 3.2 }, radius: 1.1 },
  { id: 'exit-house-h', label: 'Leave Freeze Frame House', at: { x: 5.0, y: 7.2 }, radius: 0.95 },
]

export const houseHWalls: Footprint[] = [
  { x: 0, y: 0, w: HOUSE_H_SIZE.x, d: 0.2 },
  { x: 0, y: 0.2, w: 0.2, d: HOUSE_H_SIZE.y - 0.2 },
  { x: 0, y: HOUSE_H_SIZE.y - 0.2, w: 4.2, d: 0.2 },
  { x: 5.8, y: HOUSE_H_SIZE.y - 0.2, w: 4.2, d: 0.2 },
  { x: HOUSE_H_SIZE.x - 0.2, y: 0, w: 0.2, d: HOUSE_H_SIZE.y },
]

export const houseHFurniture: (Footprint & { kind: string })[] = [
  // Surveillance & investigation desk
  { kind: 'desk', x: 1.8, y: 1.2, w: 2.2, d: 1.1 },
  { kind: 'chair', x: 2.4, y: 2.4, w: 0.6, d: 0.5 },
  // Case archive bookshelf
  { kind: 'books', x: 0.3, y: 0.8, w: 1.2, d: 0.7 },
  // Analysis terminal & review bench
  { kind: 'table', x: 6.8, y: 1.4, w: 2.2, d: 1.0 },
  // Plant & decorative items
  { kind: 'plant', x: 0.4, y: 5.4, w: 0.7, d: 0.7 },
  { kind: 'plant', x: 8.8, y: 5.4, w: 0.7, d: 0.7 },
  // Waiting bench
  { kind: 'bench', x: 7.8, y: 4.2, w: 1.4, d: 0.8 },
]

export const houseHCollisions: Footprint[] = [...houseHWalls, ...houseHFurniture]
