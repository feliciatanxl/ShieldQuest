import Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import { depthAt, project, type Footprint } from './isometric'
import type { MapProp } from './maps'
import { treeImages } from './pixellabArt'
import { box, floor, front, side } from './worldArt'

// Neighbourhood life for detail areas: buses on their routes and trees stirring in the breeze. Both stop when the
// player prefers reduced motion. Buses are box-built and drawn in code, like the article's vehicle sprites, so they
// share the map's projection and sun.

type Graphics = Phaser.GameObjects.Graphics
type Heading = 'east' | 'west' | 'south' | 'north'
const SPEED = 3.4, LENGTH = 3.2, WIDTH = .84, DWELL = 3200
const liveries: Record<string, [string, string, string]> = {
  green: ['#e8ece4', '#5fa043', '#4b8636'], red: ['#e8ece4', '#c9544a', '#a84238'],
}
const GLASS = '#2b3a49'

function drawBus(g: Graphics, heading: Heading, livery: [string, string, string]) {
  const alongX = heading === 'east' || heading === 'west'
  const w = alongX ? LENGTH : WIDTH, d = alongX ? WIDTH : LENGTH, x = -w / 2, y = -d / 2
  // The end facing the camera is the front when driving east or south, the rear otherwise.
  const frontVisible = heading === 'east' || heading === 'south'
  floor(g, x + .1, y + .1, w, d, '#1d2430', 0, .28)
  const wheel = ['#2a2b30', '#1c1d21', '#1c1d21'] as const
  for (const t of [.18, .78]) {
    if (alongX) box(g, x + w * t, y + d - .06, .32, .06, 7, wheel)
    else box(g, x + w - .06, y + d * t, .06, .32, 7, wheel)
  }
  box(g, x, y, w, d, 30, [livery[0], livery[1], livery[2]], 5)
  box(g, x + w * .3, y + d * .3, w * .4, d * .4, 4, ['#c9cdc6', '#a7aba4', '#959991'], 35)
  if (alongX) {
    for (let t = .06; t < w - .5; t += .5) front(g, x + t + (frontVisible ? 0 : .4), y + d, .42, 19, 10, GLASS)
    front(g, x, y + d, w, 12, 2, '#f4f1e6')
    front(g, frontVisible ? x + w - .55 : x + .15, y + d, .32, 5, 14, '#1f2a35')
    side(g, x + w, y + .08, d - .16, frontVisible ? 13 : 20, frontVisible ? 17 : 9, GLASS)
    if (frontVisible) side(g, x + w, y + .12, d - .24, 30, 3, '#f2a33a')
    else for (const t of [.06, d - .2]) side(g, x + w, y + t, .14, 9, 4, '#d8322c')
  } else {
    for (let t = .06; t < d - .5; t += .5) side(g, x + w, y + t + (frontVisible ? 0 : .4), .42, 19, 10, GLASS)
    side(g, x + w, y, d, 12, 2, '#f4f1e6')
    side(g, x + w, frontVisible ? y + d - .55 : y + .15, .32, 5, 14, '#1f2a35')
    front(g, x + .08, y + d, w - .16, frontVisible ? 13 : 20, frontVisible ? 17 : 9, GLASS)
    if (frontVisible) front(g, x + .12, y + d, w - .24, 30, 3, '#f2a33a')
    else for (const t of [.06, w - .2]) front(g, x + t, y + d, .14, 9, 4, '#d8322c')
  }
}

/** Each heading and livery is drawn once into a texture, so a moving bus is one image rather than redrawn shapes. */
const BUS_BOX = { w: 160, h: 120, ox: 80, oy: 70 }
function busTexture(scene: Phaser.Scene, heading: Heading, name: string, livery: [string, string, string]) {
  const key = `bus-${name}-${heading}`
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({}, false)
    drawBus(g, heading, livery)
    scene.textures.addDynamicTexture(key, BUS_BOX.w, BUS_BOX.h)?.draw(g, BUS_BOX.ox, BUS_BOX.oy)
    g.destroy()
  }
  return key
}

class Bus {
  private sprites: Record<Heading, Phaser.GameObjects.Image>
  private lengths: number[]
  private total: number
  private distance = 0
  private wait: number
  private stops: number[]
  private served = new Set<number>()
  position: Point
  heading: Heading = 'east'
  /** On the road and drawn: only an active bus blocks the player. */
  active = false

  constructor(scene: Phaser.Scene, private path: Point[], name: string, busStops: MapProp[], delay: number) {
    const livery = liveries[name] ?? liveries.green
    this.sprites = Object.fromEntries((['east', 'west', 'south', 'north'] as Heading[]).map(h => [h,
      scene.add.image(0, 0, busTexture(scene, h, name, livery)).setOrigin(BUS_BOX.ox / BUS_BOX.w, BUS_BOX.oy / BUS_BOX.h).setVisible(false)])
    ) as Record<Heading, Phaser.GameObjects.Image>
    this.lengths = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y))
    this.total = this.lengths.reduce((a, b) => a + b, 0)
    this.wait = delay
    this.position = { ...path[0] }
    // A stop is served where the route passes within reach of the shelter's kerb, on the shelter's side of the road.
    this.stops = busStops.flatMap(stop => {
      const cx = stop.x + stop.w / 2, cy = stop.y + stop.d / 2
      let along = 0
      for (let i = 0; i < this.lengths.length; i++) {
        const a = path[i], b = path[i + 1], len = this.lengths[i]
        const t = Phaser.Math.Clamp(((cx - a.x) * (b.x - a.x) + (cy - a.y) * (b.y - a.y)) / (len * len), 0, 1)
        const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t
        // Pull up with the doors at the shelter, the bus's nose just past its far end and clear of any crossing.
        if (t > 0 && t < 1 && Math.hypot(px - cx, py - cy) < 1.8) return [along + t * len - .5]
        along += len
      }
      return []
    })
  }

  private at(distance: number) {
    let rest = distance
    for (let i = 0; i < this.lengths.length; i++) {
      const a = this.path[i], b = this.path[i + 1], len = this.lengths[i]
      if (rest <= len || i === this.lengths.length - 1) {
        const t = Math.min(1, rest / len), dx = b.x - a.x, dy = b.y - a.y
        const heading: Heading = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : (dy > 0 ? 'south' : 'north')
        return { x: a.x + dx * t, y: a.y + dy * t, heading }
      }
      rest -= len
    }
    return { ...this.path[0], heading: this.heading }
  }

  /** The bus's footprint on the ground, for keeping the player out of it. */
  footprint(): Footprint {
    const alongX = this.heading === 'east' || this.heading === 'west'
    const w = alongX ? LENGTH : WIDTH, d = alongX ? WIDTH : LENGTH
    return { x: this.position.x - w / 2, y: this.position.y - d / 2, w, d }
  }

  update(delta: number, player: Point | undefined, view: Phaser.Geom.Rectangle, still: boolean) {
    Object.values(this.sprites).forEach(g => g.setVisible(false))
    this.active = false
    if (still) return
    if (this.wait > 0) { this.wait -= delta; if (this.wait > 0 && this.distance === 0) return }
    this.active = true
    if (this.wait <= 0) {
      const ahead = this.at(this.distance + LENGTH / 2 + .9)
      // Give way to a player standing in the lane just ahead.
      const blocked = player && Math.hypot(player.x - ahead.x, player.y - ahead.y) < 1
      if (!blocked) {
        const next = this.distance + SPEED * delta / 1000
        const stop = this.stops.find(s => !this.served.has(s) && this.distance < s && next >= s)
        this.distance = stop ?? next
        if (stop !== undefined) { this.served.add(stop); this.wait = DWELL }
      }
    }
    if (this.distance >= this.total) {
      this.distance = 0
      this.served.clear()
      this.wait = 9000 + Math.random() * 8000
      this.active = false
      return
    }
    const { x, y, heading } = this.at(this.distance)
    this.position = { x, y }
    this.heading = heading
    const screen = project(x, y)
    if (!Phaser.Geom.Rectangle.Contains(view, screen.x, screen.y)) return
    const f = this.footprint()
    this.sprites[heading].setPosition(screen.x, screen.y).setDepth(depthAt(f.x + f.w, f.y + f.d)).setVisible(true)
  }
}

/** Splits each tree in the given areas into trunk and crown, so the crown can shift a pixel or two in the breeze. */
function crowns(scene: Phaser.Scene, areas: Footprint[]) {
  const inArea = (p: MapProp) => areas.some(a => p.x >= a.x && p.y >= a.y && p.x < a.x + a.w && p.y < a.y + a.d)
  return treeImages(scene).filter(({ p }) => inArea(p)).map(({ image }, i) => {
    const split = Math.round(image.height * .55)
    const crown = scene.add.image(image.x, image.y, image.texture.key).setOrigin(image.originX, image.originY)
      .setScale(image.scaleX, image.scaleY).setDepth(image.depth).setCrop(0, 0, image.width, split)
    image.setCrop(0, split, image.width, image.height - split)
    return { crown, x: image.x, phase: i * 1.7 }
  })
}

/** Starts buses on the map's routes and the breeze in detail areas; returns the per-frame tick and a bus check. */
export function neighbourhoodLife(scene: Phaser.Scene, routes: MapProp[], busStops: MapProp[], areas: Footprint[]) {
  const buses = routes.filter(r => r.path && r.path.length > 1)
    .map((r, i) => new Bus(scene, r.path!, String(r.properties.livery), busStops, 1500 + i * 6000))
  const trees = crowns(scene, areas)
  let lastSway = 0
  return {
    tick(time: number, delta: number, player: Point | undefined, still: boolean) {
      const view = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(scene.cameras.main.worldView), 160, 160)
      for (const bus of buses) bus.update(delta, player, view, still)
      if (time - lastSway < 125) return
      lastSway = time
      for (const t of trees) t.crown.x = t.x + (still ? 0 : Math.round(Math.sin(time / 900 + t.phase) + Math.sin(time / 2300 + t.phase * .3) * .6))
    },
    /** Whether a bus stands on this point (a player already caught in one is never trapped). */
    blocks(point: Point, from?: Point) {
      const hit = (p: Point) => buses.some(bus => {
        if (!bus.active) return false
        const f = bus.footprint()
        return p.x > f.x - .15 && p.x < f.x + f.w + .15 && p.y > f.y - .15 && p.y < f.y + f.d + .15
      })
      return hit(point) && !(from && hit(from))
    },
  }
}
