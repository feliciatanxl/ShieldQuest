import type Phaser from 'phaser'
import type { Footprint } from './isometric'
import { box, floor, front, letterSign, planter, poly, prop, side } from './worldArt'
import { houseCollisions, houseFurniture, houseObjects, houseRooms, houseWalls } from './houseLayout'
import { recordGraphics } from './pixelBake'
import { HOUSE_SIZE } from './locations'
import type { WorldLayout } from './world'

type Graphics = Phaser.GameObjects.Graphics
const wood = ['#e2bb8f', '#a97564', '#795761'] as const
const teal = ['#9fc1a8', '#668f83', '#496977'] as const
const iron = ['#818b9e', '#515972', '#363d58'] as const
const plaster = ['#fff0ca', '#e5bd99', '#bd9081'] as const

export function houseExterior(g: Graphics, { x, y, w, d }: Footprint) {
  const frontY = y + d
  // Colonial Black & White Bungalow Styling
  const colonialWhite = ['#f8fafc', '#e2e8f0', '#94a3b8'] as const
  box(g, x, y, w, d, 58, colonialWhite)

  // Black post-and-beam timber framing
  front(g, x, frontY, 0.14, 0, 58, '#0f172a')
  front(g, x + w - 0.14, frontY, 0.14, 0, 58, '#0f172a')
  front(g, x, frontY, w, 28, 2.5, '#0f172a')
  side(g, x + w, y, d, 28, 2.5, '#0f172a')
  side(g, x + w, y + d - 0.14, 0.14, 0, 58, '#0f172a')

  // Terracotta hip roof
  const ridge = y + d / 2
  poly(g, '#c2410c', [[x - .12, frontY + .14, 57], [x + w + .15, frontY + .14, 57],
    [x + w + .15, ridge, 85], [x - .12, ridge, 85]])
  poly(g, '#9a3412', [[x - .12, ridge, 85], [x + w + .15, ridge, 85], [x + w + .15, y - .14, 57], [x - .12, y - .14, 57]])
  poly(g, '#ea580c', [[x + w, y, 58], [x + w, frontY, 58], [x + w, ridge, 83]])
  front(g, x - .12, frontY + .14, w + .27, 54, 4, '#7c2d12')
  for (let i = 1; i < 5; i++) {
    const shadeY = frontY + .14 - i * (d / 2 + .14) / 5
    front(g, x - .09, shadeY, w + .22, 57 + i * 5.2, 1.5, '#ea580c')
  }

  // Peranakan patterned veranda step
  floor(g, x + .80, frontY, 1.05, .42, '#0d9488', 0, 0.7)
  floor(g, x + .86, frontY + .06, .93, .30, '#fde047', 0, 0.75)
  floor(g, x + .92, frontY + .10, .81, .22, '#0f766e', 0, 0.8)

  // Double colonial wooden entrance door
  front(g, x + .95, frontY, .75, 0, 40, '#0f172a')
  front(g, x + 1.02, frontY, .61, 1, 36, '#1e293b')
  front(g, x + 1.32, frontY, .03, 1, 36, '#0f172a')
  front(g, x + 1.48, frontY, .065, 16, 4, '#fbbf24')

  // Timber shuttered louver windows
  for (const windowX of [x + .20, x + 1.90]) {
    front(g, windowX, frontY, .46, 17, 23, '#0f172a')
    front(g, windowX + .047, frontY, .365, 20, 17, '#38bdf8')
    for (let l = 21; l < 36; l += 3) {
      front(g, windowX + .047, frontY, .365, l, 1, '#1e293b')
    }
  }

  // Signboard: "MYSTERY HOUSE"
  front(g, x + .30, frontY, 1.9, 43, 11, '#0f172a')
  letterSign(g, 'MYSTERY HOUSE', x + .42, frontY, 44, .92, '#fef08a')
}

export function houseHExterior(g: Graphics, { x, y, w, d }: Footprint) {
  const frontY = y + d
  // Modernized Heritage Observation Studio
  const mintPlaster = ['#f1f7f5', '#d4e5de', '#9cbdb1'] as const
  box(g, x, y, w, d, 60, mintPlaster)

  // Architectural graphite framing & observation trim
  front(g, x, frontY, 0.12, 0, 60, '#134e4a')
  front(g, x + w - 0.12, frontY, 0.12, 0, 60, '#134e4a')
  front(g, x, frontY, w, 32, 2.5, '#115e59')

  const ridge = y + d / 2
  // Teal sloped hipped roof
  poly(g, '#0f766e', [[x - .12, frontY + .14, 59], [x + w + .15, frontY + .14, 59],
    [x + w + .15, ridge, 86], [x - .12, ridge, 86]])
  poly(g, '#115e59', [[x - .12, ridge, 86], [x + w + .15, ridge, 86], [x + w + .15, y - .14, 59], [x - .12, y - .14, 59]])
  poly(g, '#14b8a6', [[x + w, y, 60], [x + w, frontY, 60], [x + w, ridge, 84]])
  front(g, x - .12, frontY + .14, w + .27, 56, 4, '#134e4a')
  for (let i = 1; i < 5; i++) {
    const shadeY = frontY + .14 - i * (d / 2 + .14) / 5
    front(g, x - .09, shadeY, w + .22, 59 + i * 5.2, 1.5, '#0d9488')
  }

  // Modern entrance door with keypad
  front(g, x + .95, frontY, .75, 0, 40, '#134e4a')
  front(g, x + 1.02, frontY, .61, 1, 36, '#042f2e')
  front(g, x + 1.48, frontY, .065, 16, 4, '#38bdf8')
  // Surveillance CCTV Dome camera over entrance
  box(g, x + 1.28, frontY + 0.05, 0.14, 0.12, 6, ['#0284c7', '#0369a1', '#075985'], 41)

  // High-tech observation bay windows
  for (const windowX of [x + .20, x + 1.95]) {
    front(g, windowX, frontY, .46, 17, 23, '#134e4a')
    front(g, windowX + .047, frontY, .365, 20, 17, '#5eead4')
    front(g, windowX + .205, frontY, .045, 20, 17, '#ccfbf1')
    front(g, windowX + .047, frontY, .365, 27, 2, '#ccfbf1')
  }

  // Gold hanging sign: "FREEZE FRAME"
  front(g, x + .30, frontY, 1.9, 43, 11, '#134e4a')
  letterSign(g, 'FREEZE FRAME', x + .42, frontY, 44, .95, '#fef08a')
}

export function houseIExterior(g: Graphics, { x, y, w, d }: Footprint) {
  const frontY = y + d
  // Warm Amber Peranakan Detective Residence
  const amberPlaster = ['#fdf6e7', '#f4e0c4', '#c99f78'] as const
  box(g, x, y, w, d, 60, amberPlaster)

  // Carved teakwood framing
  front(g, x, frontY, 0.12, 0, 60, '#78350f')
  front(g, x + w - 0.12, frontY, 0.12, 0, 60, '#78350f')
  front(g, x, frontY, w, 30, 2.5, '#92400e')

  const ridge = y + d / 2
  // Amber / Terracotta sloped roof with decorative eaves
  poly(g, '#b45309', [[x - .12, frontY + .14, 59], [x + w + .15, frontY + .14, 59],
    [x + w + .15, ridge, 86], [x - .12, ridge, 86]])
  poly(g, '#78350f', [[x - .12, ridge, 86], [x + w + .15, ridge, 86], [x + w + .15, y - .14, 59], [x - .12, y - .14, 59]])
  poly(g, '#d97706', [[x + w, y, 60], [x + w, frontY, 60], [x + w, ridge, 84]])
  front(g, x - .12, frontY + .14, w + .27, 56, 4, '#451a03')
  for (let i = 1; i < 5; i++) {
    const shadeY = frontY + .14 - i * (d / 2 + .14) / 5
    front(g, x - .09, shadeY, w + .22, 59 + i * 5.2, 1.5, '#d97706')
  }

  // Peranakan tiled doorstep
  floor(g, x + .80, frontY, 1.05, .42, '#b45309', 0, 0.7)
  floor(g, x + .86, frontY + .06, .93, .30, '#fef08a', 0, 0.75)

  // Polished mahogany double door with dual brass ring knockers
  front(g, x + .95, frontY, .75, 0, 40, '#451a03')
  front(g, x + 1.02, frontY, .61, 1, 36, '#78350f')
  front(g, x + 1.32, frontY, .03, 1, 36, '#451a03')
  front(g, x + 1.14, frontY, .06, 18, 5, '#f59e0b')
  front(g, x + 1.44, frontY, .06, 18, 5, '#f59e0b')

  // Warm deduction study windows with amber stained glass transoms
  for (const windowX of [x + .20, x + 1.95]) {
    front(g, windowX, frontY, .46, 17, 23, '#451a03')
    front(g, windowX + .047, frontY, .365, 20, 17, '#fef3c7')
    front(g, windowX + .205, frontY, .045, 20, 17, '#fef9c3')
    // Amber transom highlight
    front(g, windowX + .047, frontY, .365, 33, 4, '#f59e0b')
  }

  // Brass emblem signboard: "WHISPER NET"
  front(g, x + .30, frontY, 1.9, 43, 11, '#451a03')
  letterSign(g, 'WHISPER NET', x + .46, frontY, 44, .95, '#fbbf24')
}

function drawFurniture(g: Graphics, f: typeof houseFurniture[number]) {
  const { x, y, w, d, kind } = f
  const face = y + d
  if (kind === 'plant') return planter(g, x, y, w)
  if (kind === 'sofa') {
    box(g, x, y, w, d, 17, teal)
    box(g, x, y, w, .30, 34, teal)
    box(g, x, y + .32, .22, d - .32, 25, teal)
    box(g, x + w - .22, y + .32, .22, d - .32, 25, teal)
    floor(g, x + .28, y + .42, w - .56, .48, '#b5cfb2', 18)
    return
  }
  if (kind === 'chair') {
    box(g, x, y, w, d, 13, wood)
    box(g, x, y, w, .13, 24, wood)
    return
  }
  if (kind === 'coffee' || kind === 'dining') {
    const height = kind === 'coffee' ? 15 : 25
    for (const px of [x + .07, x + w - .17]) {
      for (const py of [y + .06, face - .16]) box(g, px, py, .10, .10, height, wood)
    }
    box(g, x, y, w, d, 4, wood, height)
    floor(g, x + .21, y + .15, .42, .25, '#f2ddb3', height + 4)
    box(g, x + .28, y + .20, .10, .10, 4, teal, height + 4)
    return
  }
  const height = { books: 44, desk: 28, files: 35, safe: 32, cabinet: 28, fridge: 49, shoe: 18 }[kind]
  const palette = kind === 'safe' || kind === 'files' ? iron : kind === 'fridge' || kind === 'cabinet' ? teal : wood
  box(g, x, y, w, d, height, palette)
  front(g, x + .09, face, w - .18, 4, height - 8, palette[2])
  if (kind === 'books') {
    const books = ['#e1ab72', '#c78e8c', '#a2bda3', '#b2a3bd']
    for (const z of [8, 20, 32]) {
      front(g, x + .08, face, w - .16, z - 2, 2, '#dfad83')
      for (let i = 0; i < Math.floor((w - .19) / .14); i++) {
        front(g, x + .10 + i * .14, face, .105, z, 6 + i % 3, books[(i + z) % books.length])
      }
    }
  } else if (kind === 'safe') {
    front(g, x + .21, face, .71, 7, 19, '#717c90')
    front(g, x + .61, face, .16, 13, 9, '#353b52')
    for (const z of [15, 18]) front(g, x + .64, face, .07, z, 1, '#ffda93')
  } else if (kind === 'shoe') {
    front(g, x + .12, face, w - .24, 8, 2, '#e2bb8f')
    for (let i = 0; i < 4; i++) front(g, x + .18 + i * .27, face, .17, 3, 3, i % 2 ? '#ecc595' : '#9eb4a4')
  } else {
    for (const z of kind === 'fridge' ? [19, 37] : [10, 19]) {
      front(g, x + .11, face, w - .22, z, 2, palette[1])
      front(g, x + w * .45, face, .16, z + 3, 2, '#f9d897')
    }
    if (kind === 'desk') floor(g, x + .62, y + .28, .45, .27, '#fff0c9', height)
  }
}

export function createHouse(scene: Phaser.Scene): WorldLayout {
  const g = recordGraphics(scene, -2000)
  box(g, -.07, -.07, 12.14, 10.14, 10, ['#fee5b3', '#ac7e71', '#835e6d'], -10)
  for (const room of houseRooms) {
    for (let x = room.x; x < room.x + room.w; x++) {
      for (let y = room.y; y < room.y + room.d; y++) {
        floor(g, x, y, 1, 1, room.colors[(x + y) % 2])
        floor(g, x, y, 1, .026, '#906f66', 0, .28)
        floor(g, x, y, .026, 1, '#906f66', 0, .28)
      }
    }
  }
  floor(g, 1.75, 2.75, 3.48, 1.91, '#9b6d77')
  floor(g, 1.88, 2.87, 3.22, 1.66, '#bc8883')
  floor(g, 9.12, 8.45, 1.22, 1.12, '#75a095')
  houseWalls.forEach((wall, index) => {
    if (index < 4) {
      box(g, wall.x, wall.y, wall.w, wall.d, index < 2 ? 64 : 8, plaster)
      return
    }
    const across = wall.w > wall.d
    const length = across ? wall.w : wall.d
    for (let offset = 0; offset < length; offset += .75) {
      const span = Math.min(.75, length - offset)
      const part = across ? { ...wall, x: wall.x + offset, w: span } : { ...wall, y: wall.y + offset, d: span }
      prop(scene, part, layer => {
        box(layer, part.x, part.y, part.w, part.d, 21, plaster)
        if (!across && index === houseWalls.length - 1 && offset === 0) {
          side(layer, part.x + part.w, part.y + .11, .46, 7, 10, '#845b68')
          side(layer, part.x + part.w, part.y + .16, .36, 9, 6, '#aac0a1')
        }
      })
    }
  })
  front(g, 3.70, .16, 1.19, 28, 22, '#805b63')
  front(g, 3.77, .16, 1.05, 30, 18, '#b3c7ad')
  front(g, 9.38, .16, 1.54, 27, 28, '#805b63')
  front(g, 9.44, .16, 1.42, 30, 22, '#c08f70')
  for (const x of [9.55, 9.99, 10.43]) front(g, x, .16, .25, 36, 10, '#fff0cc')
  side(g, .16, 3.04, .88, 25, 22, '#865e67')
  side(g, .16, 3.12, .72, 28, 16, '#edc893')
  side(g, .16, 3.25, .42, 30, 9, '#78a599')
  for (const y of [3.31, 3.50]) side(g, .16, y, .075, 34, 3, '#ffdf95')
  side(g, .16, 7.95, .56, 34, 18, '#88616a')
  side(g, .16, 8.01, .44, 36, 14, '#fff0cc')
  side(g, .16, 8.18, .07, 39, 8, '#665362')
  houseFurniture.forEach(furniture => prop(scene, furniture, layer => drawFurniture(layer, furniture)))
  prop(scene, { x: 9.30, y: 9.77, w: .86, d: .14 }, layer => {
    box(layer, 9.30, 9.77, .86, .14, 45, wood)
    front(layer, 9.38, 9.91, .70, 2, 39, '#638f83')
    front(layer, 9.87, 9.91, .13, 15, 7, '#f3cb83')
  })
  const hotspots = houseObjects.map(({ id, name, at, radius }) => ({ id, label: 'Inspect ' + name, at, radius }))
  for (const { at: { x, y } } of hotspots) {
    floor(g, x - .11, y - .11, .22, .22, '#946d66')
    floor(g, x - .07, y - .07, .14, .14, '#ffe2a4')
  }
  return { size: HOUSE_SIZE, hotspots, collisions: houseCollisions }
}
