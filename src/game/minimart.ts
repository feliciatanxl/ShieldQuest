import type Phaser from 'phaser'
import { clues, isClue } from '../state/investigation'
import type { Hotspot } from './events'
import type { Footprint } from './isometric'
import { SHOP_SIZE } from './locations'
import { bag, checkout, display, fridge, plants, shelfRows, shopFixtures } from './minimartLayout'
import type { WorldLayout } from './world'
import { box, floor, front, letterSign, planter, prop, side } from './worldArt'

const hotspots = ([
  { id: 'shelf', at: { x: 2.76, y: 3.02 }, radius: .73, label: '' },
  { id: 'item', at: { x: 5.85, y: 5.33 }, radius: .68, label: '' },
  { id: 'bag', at: { x: 4.67, y: 5.0 }, radius: .68, label: '' },
  { id: 'counter', at: { x: 8.43, y: 6.13 }, radius: .73, label: '' },
  { id: 'entrance', at: { x: 7.04, y: 7.18 }, radius: .82, label: '' },
  { id: 'jun', at: { x: 4.83, y: 3.31 }, radius: .87, label: 'Talk to Jun' },
  { id: 'cashier', at: { x: 8.77, y: 4.32 }, radius: .95, label: 'Talk to the cashier' },
  { id: 'exit', at: { x: 8.53, y: 7.66 }, radius: .82, label: 'Leave Sunshine Minimart' },
] satisfies Hotspot[]).map(spot => isClue(spot.id) ? { ...spot, label: 'Inspect ' + clues[spot.id].title.toLowerCase() } : spot)

const merchandise = ['#ed9e83', '#eec167', '#90bc9f', '#b4a0cb', '#f1d6a7', '#aed188']
function room(scene: Phaser.Scene) {
  const g = scene.add.graphics().setDepth(-1000)
  const { x: w, y: d } = SHOP_SIZE
  floor(g, -.03, .25, w + .49, d + .19, '#100e16', -8)
  box(g, -.06, -.06, w + .12, d + .12, 11, ['#f0c6a3', '#ae786e', '#8a626c'], -11)
  const tiles = ['#f3cba6', '#f5d2ac', '#ecc09f', '#e9bc9a']
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < d; y++) {
      floor(g, x, y, 1, 1, tiles[(x + y) % 2 * 2 + (x * 31 + y * 7) % 3 % 2])
      floor(g, x, y, 1, .032, '#a6736e', 0, .35)
      floor(g, x, y, .032, 1, '#a6736e', 0, .35)
    }
  }

  box(g, -.08, -.11, w + .13, .25, 88, ['#ffe0b9', '#efc39a', '#a78083'])
  box(g, -.08, .14, .22, d - .10, 88, ['#ffdbb1', '#c68c7d', '#dca585'])
  front(g, .14, .14, 9.9, 4, 8, '#bc806e')
  side(g, .14, .14, 7.9, 4, 8, '#ab726a')
  front(g, .14, .14, 9.9, 65, 4, '#fff0c3')
  side(g, .14, .14, 7.9, 65, 4, '#f8d0a5')
  for (let x = .5; x < 10; x += 1.05) front(g, x, .14, .033, 12, 52, '#e2ad8e')
  for (let y = .50; y < 8; y += .94) side(g, .14, y, .033, 12, 52, '#c28d78')
  front(g, 3.19, .14, 4.58, 47, 15, '#a66362')
  letterSign(g, 'SUNSHINE MART', 3.47, .14, 51, 1.65, '#fff3cb')
  front(g, 8.43, .14, .87, 32, 24, '#62908b')
  front(g, 8.52, .14, .69, 35, 18, '#c7ded0')
  for (let z = 39; z < 54; z += 4) front(g, 8.63, .14, .47, z, 1, '#7d9e91')
  for (const [x, y] of [[1.28, .36], [5.17, .36], [8.37, .36], [.55, 2.69], [.55, 5.87]]) {
    floor(g, x - .36, y, 1.36, 1.43, '#ffefa9', 0, .20)
    box(g, x, y, .55, .25, 5, ['#ffdb9b', '#fff0b8', '#d69c77'], 76)
  }
  floor(g, 6.76, 6.91, 2.26, 1.06, '#51837d')
  floor(g, 6.85, 7.02, 2.08, .85, '#79a893')
  for (let i = 0; i < 11; i++) floor(g, 6.95 + .18 * i, 7.12, .048, .63, '#94b9a0')
  floor(g, 8.15, 7.75, .77, .22, '#f3d78c')
}

function stockedUnit(scene: Phaser.Scene, footprint: Footprint, theme: number, cold = false) {
  const { x, y, w, d } = footprint
  const bays = cold ? 6 : 4
  const bay = w / bays
  const h = cold ? 56 : 40
  const top = cold ? '#a7cdc7' : '#edc594'
  const edge = cold ? '#648c90' : '#aa755e'
  const shade = cold ? '#486c79' : '#825d58'
  for (let i = 0; i < bays; i++) {
    const part = { x: x + i * bay, y, w: bay, d }
    prop(scene, part, g => {
      box(g, part.x, y, bay, d, h, [top, edge, shade])
      front(g, part.x + .028, y + d, bay - .056, 4, h - 8, cold ? '#577485' : '#6c4d52')
      for (let row = 0; row < 3; row++) {
        const z = 7 + row * (cold ? 15 : 10)
        front(g, part.x + .025, y + d, bay - .05, z - 2, 2, top)
        for (let packet = 0; packet < 3; packet++) {
          if (theme === 0 && i === 2 && row === 2 && packet === 1) continue
          const px = part.x + .065 + packet * (bay - .11) / 3
          const color = merchandise[theme === 0 && row === 2 ? 0 : (i + row + packet + theme) % merchandise.length]
          front(g, px, y + d, .103, z, cold ? 10 : 5 + (i + packet) % 3, color)
          front(g, px + .019, y + d, .066, z + 2, 1, '#fff2d4')
        }
      }
      if (cold) {
        front(g, part.x + .04, y + d, .045, 3, 49, '#c8dfd4')
        front(g, part.x + bay - .10, y + d, .034, 25, 10, '#c8dfd4')
        front(g, part.x, y + d, bay, 52, 3, '#dcf1d9')
      } else {
        for (let j = 0; j < 2; j++) box(g, part.x + .12 + .21 * j, y + .22, .13, .22, 5, [
          merchandise[(i + j + theme) % merchandise.length], '#bd8a72', '#8d695f',
        ], h)
      }
    })
  }
}

export function createMinimart(scene: Phaser.Scene): WorldLayout {
  room(scene)
  stockedUnit(scene, fridge, 3, true)
  shelfRows.forEach((shelf, i) => stockedUnit(scene, shelf, i))
  prop(scene, checkout, g => {
    const { x, y, w, d } = checkout
    box(g, x, y, w, d, 28, ['#f3cd96', '#b67462', '#905b55'])
    front(g, x + .14, y + d, w - .28, 4, 16, '#d29879')
    front(g, x + .14, y + d, w - .28, 18, 3, '#ffdeaa')
    box(g, x + .31, y + .21, .44, .35, 6, ['#97b7ab', '#57777e', '#46626c'], 28)
    box(g, x + .39, y + .22, .30, .13, 8, ['#b5d4bd', '#718b8a', '#526b72'], 34)
    box(g, x + 1.42, y + .22, .35, .30, 3, ['#ffeac1', '#c48f70', '#b57f6b'], 28)
    floor(g, x + 1.48, y + .29, .20, .13, '#fff9e6', 31)
  })
  prop(scene, display, g => {
    const { x, y, w, d } = display
    box(g, x + .08, y + .12, .72, .49, 17, ['#a47864', '#9b6957', '#79554f'])
    box(g, x, y, w, d, 5, ['#f3cc93', '#bf876a', '#946657'], 17)
    box(g, x + .32, y + .27, .26, .27, 4, ['#e58d72', '#c46d62', '#975751'], 22)
    floor(g, x + .39, y + .31, .12, .09, '#fff2bb', 26)
  })
  prop(scene, bag, g => {
    box(g, bag.x, bag.y, bag.w, bag.d, 12, ['#f1be80', '#c48161', '#a76a59'])
    front(g, bag.x + .09, bag.y + bag.d, .16, 11, 5, '#754b53')
    front(g, bag.x + .12, bag.y + bag.d, .10, 11, 3, '#f1be80')
  })
  plants.forEach(plant => prop(scene, plant, g => planter(g, plant.x, plant.y, plant.w)))
  const hints = scene.add.graphics().setDepth(-1)
  for (const { id, at: { x, y } } of hotspots) {
    if (isClue(id)) {
      floor(hints, x - .10, y - .10, .20, .20, '#936e62')
      floor(hints, x - .069, y - .069, .138, .138, '#ffe6a3')
    }
  }
  const residentFootprints = hotspots.filter(({ id }) => id === 'jun' || id === 'cashier')
    .map(({ at }) => ({ x: at.x - .13, y: at.y - .13, w: .26, d: .26 }))
  const walls = [{ x: 0, y: 0, w: 10, d: .14 }, { x: 0, y: 0, w: .14, d: 8 }]
  return { size: SHOP_SIZE, hotspots, collisions: [...walls, ...shopFixtures, ...residentFootprints] }
}
