import type Phaser from 'phaser'
import type { Hotspot } from './events'
import type { Point } from '../state/saveGame'
import { HOUSE_DOOR, SHOP_DOOR } from './locations'
import { type Footprint } from './isometric'
import { groundColors, neighbourhood, type MapProp } from './maps'
import { isResident } from './residentData'
import { bench, block, box, floor, front, lamp, planter, poly, prop, shelter, shop, tree } from './worldArt'
import { eveningLights, minimartFront, streetFurniture } from './estateFrontage'
import { houseExterior } from './houseArt'

const labels = {
  may: 'Talk to Auntie May', amir: 'Talk to Amir',
} as const

export type WorldLayout = { hotspots: Hotspot[]; collisions: Footprint[]; size: Point; setEvening?: (visible: boolean) => void }

function pavement(scene: Phaser.Scene) {
  const map = neighbourhood
  const g = scene.add.graphics().setDepth(-2000)
  floor(g, -13, -13, 51, 49, '#9caf7c')
  map.tiles.forEach((tile, index) => {
    if (!tile) return
    const x = index % map.size.x
    const y = Math.floor(index / map.size.x)
    floor(g, x, y, 1, 1, groundColors[tile - 1])
    const detail = (x * 37 + y * 139 + x * y * 41) % 19
    if (tile <= 4 && detail < 12) {
      floor(g, x + .19, y + .23, .13, .052, '#819d6d', 0, .75)
      floor(g, x + .63, y + .68, .085, .056, detail < 4 ? '#f1d39e' : '#b9ce8b')
      floor(g, x + .40, y + .23, .045, .15, '#91a86f')
    } else if ((tile >= 5 && tile <= 8) || (tile >= 13 && tile <= 16)) {
      floor(g, x, y, 1, .022, '#b2a398', 0, .5)
      floor(g, x, y, .022, 1, '#b2a398', 0, .5)
      if (detail < 6) floor(g, x + .65, y + .26, .115, .05, '#c6af9e')
    }
  })
  return g
}

const linkway = { x: 7.84, y: 9.36, w: 2.57, d: .74 }

function street(scene: Phaser.Scene) {
  const g = pavement(scene)
  for (let x = 0; x < 25; x++) {
    floor(g, x, 15.04, 1, .045, '#bdbcaf')
    floor(g, x, 17.89, 1, .045, '#c4c2b4')
    if (x % 2 === 0 && x !== 16 && x !== 20) floor(g, x + .12, 16.49, .66, .065, '#ead5aa')
  }
  for (let y = 5; y < 15; y++) {
    floor(g, 19.05, y, .052, 1, '#c4c2b4')
    floor(g, 21.9, y, .055, 1, '#c4c2b4')
    if (y % 2 === 0) floor(g, 20.49, y + .18, .065, .62, '#e7d4a8')
  }
  for (let index = 0; index < 7; index++) {
    floor(g, 16.1, 15.15 + index * .39, 1.25, .21, '#e6dfcc')
    floor(g, 19.14 + index * .39, 13.25, .21, 1.22, '#e6dfcc')
  }
  const paint = '#ebc36e'
  const letters = ['111101110101111', '101101101101111', '111100111001111']
  letters.forEach((letter, index) => [...letter].forEach((bit, cell) => {
    if (bit === '1') floor(g, 9.60 + (index * 4 + cell % 3) * .12, 15.56 + Math.floor(cell / 3) * .12, .13, .13, paint)
  }))
  for (const y of [15.39, 16.23]) floor(g, 9.37, y, 2.49, .07, paint)
  floor(g, 9.37, 15.39, .06, .87, paint)
  for (let x = 8; x < 15; x++) floor(g, x, 14.86, 1, .07, '#e3cfaa')
  floor(g, 15.99, 14.73, 1.44, .23, '#e5b38b')
  floor(g, 15.99, 18.05, 1.44, .23, '#e5b38b')
  floor(g, 2.23, 10.51, 4.9, .24, '#daba8f')
  floor(g, 13.01, 9.16, .44, .37, '#e5bd84')
  floor(g, 22.05, 9.91, 2.63, .44, '#d7c7a9')
  floor(g, 22.00, 9.93, .40, .91, '#d7c7a9')
  for (let i = 0; i < 8; i++) floor(g, 13.05 + .048 * i, 9.28, .018, .18, '#a37567')
}

function playArea(g: Phaser.GameObjects.Graphics, p: MapProp) {
  floor(g, p.x, p.y, p.w, p.d, '#b2bcb1')
  floor(g, p.x + .1, p.y + .1, p.w - .2, p.d - .2, '#bdc396')
  floor(g, p.x + .59, p.y + .36, 2.2, 1.39, '#d5c08d')
  for (const i of [0, .72]) {
    box(g, p.x + 1.12 + i, p.y + .45, .11, .10, 43, ['#f2c088', '#987c81', '#666b84'])
    box(g, p.x + 1.12 + i, p.y + .98, .11, .10, 43, ['#f2c088', '#987c81', '#666b84'])
  }
  box(g, p.x + 1.12, p.y + .45, .82, .62, 4, ['#e0a087', '#a56f70', '#816b7a'], 29)
  box(g, p.x + 1.02, p.y + .35, 1.02, .82, 4, ['#eec38b', '#c79477', '#a77b78'], 43)
  poly(g, '#77a4ab', [[p.x + 1.32,p.y + 1,29], [p.x + 1.75,p.y + 1,29], [p.x + 1.75,p.y + 1.8,4], [p.x + 1.32,p.y + 1.8,4]])
  poly(g, '#507d8b', [[p.x + 1.75,p.y + 1,29], [p.x + 1.75,p.y + 1.8,4], [p.x + 1.75,p.y + 1.8,1], [p.x + 1.75,p.y + 1,25]])
}

function bicycles(g: Phaser.GameObjects.Graphics, p: MapProp) {
  for (let i = 0; i < 3; i++) {
    const y = p.y + i * .49
    const tint = ['#b36f6f', '#719e89', '#8c87a7'][i]
    for (const offset of [.08, .45]) {
      front(g, p.x + offset, y, .14, 1, 8, '#535263')
      front(g, p.x + offset + .03, y, .08, 3, 4, '#bcb5a2')
    }
    front(g, p.x + .16, y, .34, 5, 2, tint)
    front(g, p.x + .32, y, .055, 5, 7, tint)
    front(g, p.x + .25, y, .16, 11, 2, '#665466')
    front(g, p.x + .49, y, .045, 5, 9, tint)
  }
}

function renderProp(scene: Phaser.Scene, p: MapProp) {
  const { kind, x, y, w, d, properties } = p
  if (!['block', 'shop', 'kopi', 'tree', 'planter', 'bench', 'lamp', 'shelter', 'bus', 'play', 'bikes', 'house'].includes(kind)) return
  prop(scene, p, g => {
    switch (kind) {
      case 'block': block(g, x, y, w, d, String(properties.number), String(properties.accent), Number(properties.floors)); break
      case 'shop': minimartFront(g, p); break
      case 'kopi': shop(g, x, y, w, d, false); break
      case 'tree': tree(g, x, y, Boolean(properties.large), Number(properties.hue)); break
      case 'planter': planter(g, x, y, w); break
      case 'bench': bench(g, x, y); break
      case 'lamp': lamp(g, x, y); break
      case 'shelter': case 'bus': shelter(g, x, y, w, d, kind === 'bus'); break
      case 'play': playArea(g, p); break
      case 'bikes': bicycles(g, p); break
      case 'house': houseExterior(g, p); break
    }
  })
}

export function createWorld(scene: Phaser.Scene): WorldLayout {
  street(scene)
  const map = neighbourhood
  map.props.forEach(p => renderProp(scene, p))
  const streetCollisions = streetFurniture(scene)
  prop(scene, linkway, g => shelter(g, linkway.x, linkway.y, linkway.w, linkway.d))
  for (const x of [linkway.x, linkway.x + linkway.w - .12]) {
    for (const y of [linkway.y, linkway.y + linkway.d - .12]) streetCollisions.push({ x, y, w: .12, d: .12 })
  }
  const storefront = map.props.find(p => p.kind === 'shop')
  const setEvening = storefront && eveningLights(scene, storefront, linkway)
  const hotspots: Hotspot[] = map.props.filter(p => Object.hasOwn(labels, p.kind)).map(({ x, y, kind }) => {
    const id = kind as keyof typeof labels
    return { id, label: labels[id], at: { x, y }, radius: .95 }
  })
  const collisions = map.props.filter(p => p.w > 0 && p.d > 0 && p.kind !== 'shelter' && p.kind !== 'bus')
  for (const p of map.props.filter(p => p.kind === 'shelter' || p.kind === 'bus')) {
    for (const x of [p.x, p.x + p.w - .13]) {
      for (const y of [p.y, p.y + p.d - .13]) collisions.push({ ...p, x, y, w: .13, d: .13 })
    }
  }
  for (const { id, at } of hotspots) {
    if (isResident(id)) collisions.push({ kind: 'npc', name: id, x: at.x - .13, y: at.y - .13, w: .26, d: .26, properties: {} })
  }
  const uncle = { x: 10.99, y: 10.07 }
  streetCollisions.push({ x: uncle.x - .10, y: uncle.y - .10, w: .20, d: .20 })
  hotspots.push(
    { id: 'uncle', label: 'Talk to Uncle', at: uncle, radius: .73 },
    { id: 'bus-card', label: 'Pick up the EZ-Link card', at: { x: 11.40, y: 10.34 }, radius: .62 },
  )
  hotspots.push({ id: 'enter', label: 'Enter Sunshine Minimart', at: SHOP_DOOR, radius: .82 })
  hotspots.push({ id: 'house-entrance', label: 'Visit The Mysterious House', at: HOUSE_DOOR, radius: .93 })
  return { hotspots, collisions: [...collisions, ...streetCollisions], size: map.size, setEvening }
}
