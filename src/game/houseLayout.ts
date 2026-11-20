import type { Footprint } from './isometric'
import type { PickupId, PuzzleId } from '../state/missingEvidence'

export const houseRooms = [
  { name: 'Living Room', x: 0, y: 0, w: 6, d: 5, colors: ['#ecc39e', '#e0b18e'] },
  { name: 'Study', x: 6, y: 0, w: 6, d: 5, colors: ['#c6aa90', '#bfa088'] },
  { name: 'Kitchen', x: 0, y: 5, w: 6, d: 5, colors: ['#c3d0b6', '#e9d9b4'] },
  { name: 'Entrance Hall', x: 6, y: 5, w: 6, d: 5, colors: ['#ebcaa4', '#e4b991'] },
] as const

const inspect = (x: number, y: number, radius = .85) => ({ at: { x, y }, radius })

export type HouseObject = {
  id: `house-${string}`
  type: 'shelf' | 'drawer' | 'painting' | 'clock' | 'cabinet' | 'safe' | 'door' | 'table' | 'board'
  at: { x: number; y: number }
  radius: number
  name: string
  description: string
  pickup?: { label: string; objectId: PickupId }
  puzzleId?: PuzzleId
}

export const houseObjects = [
  { id: 'house-coffee-table', type: 'table', ...inspect(2.63, 4.04), name: 'Coffee Table', description: 'A scrap of paper peeks out from beneath the coaster.', pickup: { label: 'Take Letter Fragment', objectId: 'house-coffee-table' }, puzzleId: 'letter' },
  { id: 'house-bookshelf', type: 'shelf', ...inspect(2.02, 1.53), name: 'Old Bookshelf', description: 'A letter fragment is tucked between two books.', pickup: { label: 'Take Letter Fragment', objectId: 'house-bookshelf' }, puzzleId: 'letter' },
  { id: 'house-painting', type: 'painting', ...inspect(.8, 3.45), name: 'Wall Painting', description: 'Two lit windows look out over the garden. A letter fragment is caught behind the frame.', pickup: { label: 'Take Letter Fragment', objectId: 'house-painting' }, puzzleId: 'letter' },
  { id: 'house-study-shelf', type: 'shelf', ...inspect(6.70, 1.36), name: 'Study Bookshelf', description: 'The book spines display symbols and numbers.', puzzleId: 'cipher' },
  { id: 'house-drawer', type: 'drawer', ...inspect(8.2, 2.42, .70), name: 'Desk Drawer', description: 'A three-digit lock protects the case documents.' },
  { id: 'house-timeline', type: 'table', ...inspect(8.94, 3.57), name: 'Study Timeline', description: 'A work surface is set aside for arranging the four incident events.', puzzleId: 'timeline' },
  { id: 'house-board', type: 'board', ...inspect(9.64, .62, .75), name: 'Study Evidence Board', description: 'Pin claims to the board and link them to the records that let you verify them.', puzzleId: 'board' },
  { id: 'house-files', type: 'cabinet', ...inspect(10.95, 2.99), name: 'Filing Cabinet', description: 'The stock-transfer record is filed here.', pickup: { label: 'Take Transaction Record', objectId: 'house-files' } },
  { id: 'house-safe', type: 'safe', ...inspect(10.72, 1.65), name: 'Study Safe', description: 'The final evidence file is inside a safe with a four-digit keypad.', puzzleId: 'study-safe' },
  { id: 'house-cabinet', type: 'cabinet', ...inspect(1.62, 6.94), name: 'Kitchen Cabinet', description: 'A shop receipt sits on a shelf.', pickup: { label: 'Take Shop Receipt', objectId: 'house-cabinet' } },
  { id: 'house-clock', type: 'clock', ...inspect(.72, 8.25, .76), name: 'Wall Clock', description: 'A training observer’s timestamped note is pinned beside the clock.', pickup: { label: 'Take Clock Observation', objectId: 'house-clock' } },
  { id: 'house-front-door', type: 'door', ...inspect(9.72, 8.95, 1), name: 'Front Door', description: 'Use the challenge key here to finish the level.' },
] as const satisfies readonly HouseObject[]

export type HouseObjectId = typeof houseObjects[number]['id']
export const houseObject = (id: string): HouseObject | undefined => houseObjects.find(object => object.id === id)

export const houseWalls: Footprint[] = [
  { x: 0, y: 0, w: 12, d: .16 }, { x: 0, y: .16, w: .16, d: 9.84 },
  { x: 0, y: 9.84, w: 12, d: .16 }, { x: 11.84, y: 0, w: .16, d: 10 },
  { x: .16, y: 4.91, w: 2.23, d: .18 }, { x: 3.83, y: 4.91, w: 4.22, d: .18 }, { x: 9.60, y: 4.91, w: 2.24, d: .18 },
  { x: 5.91, y: .16, w: .18, d: 1.74 }, { x: 5.91, y: 3.42, w: .18, d: 3.21 }, { x: 5.91, y: 8.22, w: .18, d: 1.62 },
]

export const houseFurniture = [
  { kind: 'books', x: 1.05, y: .30, w: 2.3, d: .65 },
  { kind: 'sofa', x: 4.08, y: 3.55, w: 1.43, d: 1.03 },
  { kind: 'coffee', x: 2.1, y: 3.03, w: 1.05, d: .68 },
  { kind: 'plant', x: .30, y: 3.96, w: .48, d: .48 },
  { kind: 'desk', x: 7.23, y: .98, w: 1.82, d: .91 },
  { kind: 'chair', x: 7.28, y: 2.15, w: .50, d: .46 },
  { kind: 'books', x: 6.26, y: .25, w: .88, d: .64 },
  { kind: 'files', x: 10.34, y: 3.43, w: 1.05, d: .74 },
  { kind: 'coffee', x: 8.45, y: 2.75, w: 1.15, d: .55 },
  { kind: 'safe', x: 10.18, y: .39, w: 1.15, d: .75 },
  { kind: 'cabinet', x: .35, y: 5.22, w: 2.65, d: .85 },
  { kind: 'fridge', x: 4.50, y: 5.23, w: 1.00, d: .91 },
  { kind: 'dining', x: 2.40, y: 7.18, w: 1.63, d: 1.12 },
  { kind: 'chair', x: 4.07, y: 7.39, w: .53, d: .55 },
  { kind: 'shoe', x: 6.62, y: 8.62, w: 1.47, d: .68 },
] as const

export const houseCollisions = [...houseWalls, ...houseFurniture]
