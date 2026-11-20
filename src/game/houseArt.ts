import type Phaser from 'phaser'
import type { Footprint } from './isometric'
import { box, floor, front, letterSign, planter, poly, prop, side } from './worldArt'
import { houseCollisions, houseFurniture, houseObjects, houseRooms, houseWalls } from './houseLayout'
import { HOUSE_SIZE } from './locations'
import type { WorldLayout } from './world'

type Graphics = Phaser.GameObjects.Graphics
const wood = ['#e2bb8f', '#a97564', '#795761'] as const
const teal = ['#9fc1a8', '#668f83', '#496977'] as const
const iron = ['#818b9e', '#515972', '#363d58'] as const
const plaster = ['#fff0ca', '#e5bd99', '#bd9081'] as const

export function houseExterior(g: Graphics, { x, y, w, d }: Footprint) {
  const frontY = y + d
  box(g, x, y, w, d, 58, plaster)
  const ridge = y + d / 2
  poly(g, '#815467', [[x - .10, frontY + .14, 57], [x + w + .13, frontY + .14, 57],
    [x + w + .13, ridge, 83], [x - .10, ridge, 83]])
  poly(g, '#64445d', [[x - .10, ridge, 83], [x + w + .13, ridge, 83], [x + w + .13, y - .14, 57], [x - .10, y - .14, 57]])
  poly(g, '#b98579', [[x + w, y, 58], [x + w, frontY, 58], [x + w, ridge, 81]])
  front(g, x - .10, frontY + .14, w + .23, 54, 4, '#62455b')
  for (let i = 1; i < 5; i++) {
    const shadeY = frontY + .14 - i * (d / 2 + .14) / 5
    front(g, x - .07, shadeY, w + .18, 57 + i * 5.2, 1.5, '#ac6f77')
  }
  front(g, x + .95, frontY, .72, 0, 39, '#654d5b')
  front(g, x + 1.02, frontY, .58, 1, 35, '#56817c')
  front(g, x + 1.46, frontY, .065, 15, 4, '#f4d38d')
  for (const windowX of [x + .20, x + 1.89]) {
    front(g, windowX, frontY, .44, 17, 22, '#866275')
    front(g, windowX + .047, frontY, .345, 20, 16, '#b9dbcc')
    front(g, windowX + .193, frontY, .045, 20, 16, '#f8dec0')
    front(g, windowX + .047, frontY, .345, 27, 2, '#f8dec0')
  }
  front(g, x + .35, frontY, 1.78, 42, 10, '#645266')
  letterSign(g, 'MYSTERY HOUSE', x + .46, frontY, 43, .94, '#fff0c4')
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
  const g = scene.add.graphics().setDepth(-2000)
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
