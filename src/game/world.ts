import type Phaser from 'phaser'
import type { Hotspot } from './events'
import type { Point } from '../state/saveGame'
import { HOUSE_DOOR, HOUSE_H_DOOR, HOUSE_I_DOOR, SHOP_DOOR } from './locations'
import { type Footprint } from './isometric'
import { neighbourhood, type MapProp } from './maps'
import { groundTiles, spriteProp } from './pixellabArt'
import { isResident } from './residentData'
import {
  bench, block, bougainvillea, box, communityGarden, floor, front, kopitiamTable, lamp,
  letterSign, linkway, planter, poly, prop, rubbishBin, shelter, shop, streetSign,
  trafficLight, tree
} from './worldArt'
import { houseExterior, houseHExterior, houseIExterior } from './houseArt'

const labels = {
  may: 'Talk to Auntie May', amir: 'Talk to Amir',
} as const

/** routes: residents walking back and forth along a polyline, drawn from a walking sheet. */
export type WorldLayout = { hotspots: Hotspot[]; collisions: Footprint[]; size: Point; routes?: MapProp[] }

function pavement(scene: Phaser.Scene) {
  const map = neighbourhood
  const g = scene.add.graphics().setDepth(-2000)
  groundTiles(scene, map.tiles, map.size.x)
  return g
}

// Road markings from the map's `road` and `crossing` rectangles: kerbs, Singapore double yellow lines and lane
// dashes, all broken where another road or a crossing passes; zebra crossings with their white stop lines.
function street(scene: Phaser.Scene) {
  const g = pavement(scene)
  const roads = neighbourhood.props.filter(p => p.kind === 'road')
  const crossings = neighbourhood.props.filter(p => p.kind === 'crossing')
  const covered = (self: MapProp, x: number, y: number) => [...roads, ...crossings]
    .some(o => o !== self && x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.d)
  const yellow = '#e2b93b'
  for (const r of roads) {
    const alongX = r.w >= r.d, length = alongX ? r.w : r.d, width = alongX ? r.d : r.w
    // t runs along the road, u across it.
    const point = (t: number, u: number) => alongX ? [r.x + t, r.y + u] as const : [r.x + u, r.y + t] as const
    const mark = (t: number, u: number, l: number, w: number, colour: string) => {
      const [x, y] = point(t, u)
      floor(g, x, y, alongX ? l : w, alongX ? w : l, colour)
    }
    for (let t = 0; t < length; t++) {
      const free = (u: number) => !covered(r, ...point(t + .5, u))
      if (free(.04)) mark(t, .04, 1, .045, '#bdbcaf')
      if (free(width - .09)) mark(t, width - .09, 1, .045, '#c4c2b4')
      for (const u of [.16, .26, width - .3, width - .2]) if (free(u)) mark(t, u, 1, .035, yellow)
      if (t % 2 === 0 && free(width / 2)) mark(t + .12, width / 2 - .03, .66, .065, '#ead5aa')
    }
  }
  for (const c of crossings) {
    const acrossY = c.d >= c.w, span = acrossY ? c.d : c.w
    for (let i = 0; i * .39 + .3 < span; i++) {
      if (acrossY) floor(g, c.x, c.y + .1 + i * .39, c.w, .21, '#e6dfcc')
      else floor(g, c.x + .1 + i * .39, c.y, .21, c.d, '#e6dfcc')
    }
    if (acrossY) for (const x of [c.x - .35, c.x + c.w + .15]) floor(g, x, c.y + .05, .16, c.d - .1, '#ffffff')
    else for (const y of [c.y - .35, c.y + c.d + .15]) floor(g, c.x + .05, y, c.w - .1, .16, '#ffffff')
  }
  // Door mats at the shop and the two SHIELD houses.
  floor(g, 13.01, 9.16, .44, .37, '#e5bd84')
  for (let i = 0; i < 8; i++) floor(g, 13.05 + .048 * i, 9.28, .018, .18, '#a37567')
  floor(g, 28.0, 8.4, 1.1, .35, '#e5bd84')
  floor(g, 14.0, 26.4, 1.1, .35, '#e5bd84')
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
  if (spriteProp(scene, p)) return
  if (!['block', 'shop', 'kopi', 'tree', 'planter', 'bench', 'lamp', 'shelter', 'bus', 'play', 'bikes', 'house', 'bin', 'sign', 'linkway', 'kopitiam', 'trafficLight', 'garden', 'bougainvillea'].includes(kind)) return
  prop(scene, p, g => {
    switch (kind) {
      case 'block': block(g, x, y, w, d, String(properties.number), String(properties.accent), Number(properties.floors)); break
      case 'shop': case 'kopi': shop(g, x, y, w, d, kind === 'shop'); break
      case 'tree': tree(g, x, y, Boolean(properties.large), Number(properties.hue)); break
      case 'planter': planter(g, x, y, w); break
      case 'bench': bench(g, x, y); break
      case 'lamp': lamp(g, x, y); break
      case 'shelter': case 'bus': shelter(g, x, y, w, d, kind === 'bus'); break
      case 'play': playArea(g, p); break
      case 'bikes': bicycles(g, p); break
      case 'bin': rubbishBin(g, x, y); break
      case 'sign': streetSign(g, x, y, String(properties.text || 'SUNSHINE AVE')); break
      case 'linkway': linkway(g, x, y, w, d); break
      case 'kopitiam': kopitiamTable(g, x, y); break
      case 'trafficLight': trafficLight(g, x, y); break
      case 'garden': communityGarden(g, x, y, w, d); break
      case 'bougainvillea': bougainvillea(g, x, y); break
      case 'house':
        if (p.name.includes('Freeze Frame') || p.name.includes('House H')) houseHExterior(g, p)
        else if (p.name.includes('Whisper Network') || p.name.includes('House I')) houseIExterior(g, p)
        else houseExterior(g, p)
        break
    }
  })
}

export function createWorld(scene: Phaser.Scene): WorldLayout {
  street(scene)
  const map = neighbourhood
  map.props.forEach(p => renderProp(scene, p))
  const hotspots: Hotspot[] = map.props.filter(p => Object.hasOwn(labels, p.kind)).map(({ x, y, kind }) => {
    const id = kind as keyof typeof labels
    return { id, label: labels[id], at: { x, y }, radius: .95 }
  })
  const nonSolidKinds = new Set(['shelter', 'bus', 'linkway', 'sign', 'bougainvillea', 'road', 'crossing'])
  const collisions = map.props.filter(p => p.w > 0 && p.d > 0 && !nonSolidKinds.has(p.kind) && p.kind !== 'walker')
  for (const p of map.props.filter(p => p.kind === 'shelter' || p.kind === 'bus')) {
    for (const x of [p.x, p.x + p.w - .13]) {
      for (const y of [p.y, p.y + p.d - .13]) collisions.push({ ...p, x, y, w: .13, d: .13 })
    }
  }
  for (const { id, at } of hotspots) {
    if (isResident(id)) collisions.push({ kind: 'npc', name: id, x: at.x - .13, y: at.y - .13, w: .26, d: .26, properties: {} })
  }
  hotspots.push({ id: 'enter', label: 'Enter Sunshine Minimart', at: SHOP_DOOR, radius: .82 })
  hotspots.push({ id: 'house-entrance', label: 'Visit The Mysterious House', at: HOUSE_DOOR, radius: .93 })
  hotspots.push({ id: 'house-h-entrance', label: 'Enter Freeze Frame House', at: HOUSE_H_DOOR, radius: .95 })
  hotspots.push({ id: 'house-i-entrance', label: 'Enter Whisper Network House', at: HOUSE_I_DOOR, radius: .95 })
  const routes = map.props.filter(p => p.kind === 'walker' && p.path && p.path.length > 1)
  return { hotspots, collisions: collisions as Footprint[], size: map.size, routes }
}
