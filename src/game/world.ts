import type Phaser from 'phaser'
import type { Hotspot } from './events'
import type { Point } from '../state/saveGame'
import { HOUSE_DOOR, HOUSE_H_DOOR, HOUSE_I_DOOR, SHOP_DOOR } from './locations'
import { type Footprint } from './isometric'
import { neighbourhood, type MapProp } from './maps'
import { groundTiles, spriteProp } from './pixellabArt'
import { bakeDetail, detailAreas, noticeboard } from './detail'
import { neighbourhoodLife } from './ambient'
import { sceneryCollisions } from './collisions'
import { depthFor } from './hdbBlock'
import { isResident } from './residentData'
import {
  bench, block, bougainvillea, box, communityGarden, floor, front, groundLetters, kopitiamTable, lamp,
  letterSign, linkway, planter, poly, prop, rubbishBin, shelter, side, shop, streetSign,
  trafficLight, tree
} from './worldArt'
import { houseExterior, houseHExterior, houseIExterior } from './houseArt'

const labels = {
  may: 'Talk to Auntie May', amir: 'Talk to Amir',
} as const

/** routes: residents walking back and forth along a polyline, drawn from a walking sheet.
 *  tick/blocks: moving scenery (buses, breeze) advanced each frame, and whether it stands on a point. */
export type WorldLayout = {
  hotspots: Hotspot[]; collisions: Footprint[]; size: Point; routes?: MapProp[]
  tick?: (time: number, delta: number, player: Point | undefined, still: boolean) => void
  blocks?: (point: Point, from?: Point) => boolean
}

/** The road a bus stop faces (across the kerb on either long side) and its route pole on the kerb past the shelter. */
function busBay(stop: MapProp) {
  const cx = stop.x + stop.w / 2
  const road = neighbourhood.props.find(r => r.kind === 'road' && cx > r.x && cx < r.x + r.w &&
    [stop.y + stop.d + .6, stop.y - .6].some(y => y > r.y && y < r.y + r.d))
  if (!road) return undefined
  const south = road.y > stop.y
  return { road, south, pole: { x: stop.x + stop.w + .3, y: south ? stop.y + stop.d - .12 : stop.y + .05 } }
}

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
  // Bus bays: a dashed yellow box along the kerb in front of each stop, stopping short of any crossing, with BUS
  // painted upright for drivers in that lane (traffic keeps left, so the north lane runs east).
  for (const stop of neighbourhood.props.filter(p => p.kind === 'bus')) {
    const bay = busBay(stop)
    if (!bay) continue
    const y0 = bay.south ? bay.road.y + .14 : bay.road.y + bay.road.d - .99
    let x0 = stop.x - .9, x1 = stop.x + stop.w + .9
    for (const c of crossings.filter(c => c.y < bay.road.y + bay.road.d && c.y + c.d > bay.road.y)) {
      if (c.x + c.w <= x0 || c.x >= x1) continue
      if (c.x > stop.x + stop.w / 2) x1 = Math.min(x1, c.x - .3)
      else x0 = Math.max(x0, c.x + c.w + .3)
    }
    const length = x1 - x0
    for (let t = 0; t < length - .2; t += .5) for (const y of [y0, y0 + .79]) floor(g, x0 + t, y, Math.min(.3, length - t), .06, yellow)
    for (const x of [x0, x1 - .06]) floor(g, x, y0, .06, .85, yellow)
    groundLetters(g, 'BUS', x0 + length / 2, y0 + .425, .065, yellow, bay.south ? 1 : -1)
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
  if (!['block', 'shop', 'kopi', 'tree', 'planter', 'bench', 'lamp', 'shelter', 'bus', 'play', 'bikes', 'house', 'bin', 'sign', 'linkway', 'kopitiam', 'trafficLight', 'garden', 'bougainvillea', 'notice'].includes(kind)) return
  const drawn = prop(scene, p, g => {
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
      case 'notice': noticeboard(g, p); break
      case 'house':
        if (p.name.includes('Freeze Frame') || p.name.includes('House H')) houseHExterior(g, p)
        else if (p.name.includes('Whisper Network') || p.name.includes('House I')) houseIExterior(g, p)
        else houseExterior(g, p)
        break
    }
  })
  // Props under a void deck sort among its pillars rather than over the building above.
  drawn.setDepth(depthFor(scene, { x: p.x + p.w, y: p.y + p.d }))
}

// An SBS-style route pole: a grey post carrying a white plate with service number chips.
function routePole(scene: Phaser.Scene, at: Point) {
  const { x, y } = at
  prop(scene, { x, y, w: .08, d: .08 }, g => {
    box(g, x, y, .07, .07, 52, ['#d3d6db', '#9aa0a8', '#7d838c'])
    box(g, x + .07, y - .22, .03, .5, 20, ['#ffffff', '#d9d4c5', '#f4f1e6'], 32)
    side(g, x + .1, y - .22, .5, 48, 4, '#c8322f')
    ;['#2f6f4f', '#c8322f', '#2b4a6f'].forEach((colour, i) => side(g, x + .1, y - .17 + i * .15, .11, 36, 7, colour))
  })
}

export function createWorld(scene: Phaser.Scene): WorldLayout {
  street(scene)
  detailAreas().forEach(area => bakeDetail(scene, area))
  const map = neighbourhood
  map.props.forEach(p => renderProp(scene, p))
  const poles = map.props.filter(p => p.kind === 'bus').flatMap(p => busBay(p)?.pole ?? [])
  poles.forEach(at => routePole(scene, at))
  const hotspots: Hotspot[] = map.props.filter(p => Object.hasOwn(labels, p.kind)).map(({ x, y, kind }) => {
    const id = kind as keyof typeof labels
    return { id, label: labels[id], at: { x, y }, radius: .95 }
  })
  const collisions = sceneryCollisions(map.props)
  for (const { x, y } of poles) collisions.push({ x, y, w: .08, d: .08 })
  for (const { id, at } of hotspots) {
    if (isResident(id)) collisions.push({ x: at.x - .13, y: at.y - .13, w: .26, d: .26 })
  }
  // Noticeboards are read from just in front of them.
  for (const board of map.props.filter(p => p.kind === 'notice')) {
    hotspots.push({ id: 'notice', label: 'Read the noticeboard', at: { x: board.x + board.w / 2, y: board.y + board.d + .45 }, radius: .8 })
  }
  hotspots.push({ id: 'enter', label: 'Enter Sunshine Minimart', at: SHOP_DOOR, radius: .82 })
  hotspots.push({ id: 'house-entrance', label: 'Visit The Mysterious House', at: HOUSE_DOOR, radius: .93 })
  hotspots.push({ id: 'house-h-entrance', label: 'Enter Freeze Frame House', at: HOUSE_H_DOOR, radius: .95 })
  hotspots.push({ id: 'house-i-entrance', label: 'Enter Whisper Network House', at: HOUSE_I_DOOR, radius: .95 })
  const routes = map.props.filter(p => p.kind === 'walker' && p.path && p.path.length > 1)
  const life = neighbourhoodLife(scene, map.props.filter(p => p.kind === 'busroute'), map.props.filter(p => p.kind === 'bus'), detailAreas())
  return { hotspots, collisions, size: map.size, routes, tick: life.tick, blocks: life.blocks }
}
