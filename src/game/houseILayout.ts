import type { Footprint } from './isometric'
import type { Hotspot } from './events'
import { HOUSE_I_SIZE } from './locations'

export const houseIObjects: Hotspot[] = [
  { id: 'whisper-station', label: 'Launch Whisper Network (Identify the Influence)', at: { x: 5.5, y: 3.2 }, radius: 1.1 },
  { id: 'exit-house-i', label: 'Leave Whisper Network House', at: { x: 5.5, y: 7.2 }, radius: 0.95 },
]

export const houseIWalls: Footprint[] = [
  { x: 0, y: 0, w: HOUSE_I_SIZE.x, d: 0.2 },
  { x: 0, y: 0.2, w: 0.2, d: HOUSE_I_SIZE.y - 0.2 },
  { x: 0, y: HOUSE_I_SIZE.y - 0.2, w: 4.7, d: 0.2 },
  { x: 6.3, y: HOUSE_I_SIZE.y - 0.2, w: 4.7, d: 0.2 },
  { x: HOUSE_I_SIZE.x - 0.2, y: 0, w: 0.2, d: HOUSE_I_SIZE.y },
]

export const houseIFurniture: (Footprint & { kind: string })[] = [
  // Investigative Pinboard & mapping table
  { kind: 'table', x: 1.5, y: 1.2, w: 2.6, d: 1.1 },
  // Transcription & recording terminal
  { kind: 'desk', x: 7.0, y: 1.2, w: 2.4, d: 1.1 },
  { kind: 'chair', x: 7.8, y: 2.4, w: 0.6, d: 0.5 },
  // Case files filing cabinets
  { kind: 'files', x: 0.4, y: 3.2, w: 1.0, d: 0.8 },
  // Interview seating & discussion area
  { kind: 'sofa', x: 7.8, y: 3.8, w: 1.8, d: 1.1 },
  { kind: 'coffee', x: 7.6, y: 5.2, w: 1.2, d: 0.7 },
  // Planters
  { kind: 'plant', x: 0.4, y: 5.6, w: 0.7, d: 0.7 },
  { kind: 'plant', x: 9.8, y: 5.6, w: 0.7, d: 0.7 },
]

export const houseICollisions: Footprint[] = [...houseIWalls, ...houseIFurniture]
