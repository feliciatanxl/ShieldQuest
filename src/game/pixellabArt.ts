import Phaser from 'phaser'
import { depthAt, project, TILE_WIDTH } from './isometric'
import type { MapProp } from './maps'
import { buildHdbBlock } from './hdbBlock'

// PixelLab-generated art, shared with the Unity project (see docs/pixellab-assets.md).
const urls = import.meta.glob('./assets/pixellab/**/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const key = (path: string) => 'pl-' + path.split('/').slice(-2).join('-').replace('.png', '')

// Walking residents: sheets laid out like the player base sheets (see docs/pixellab-assets.md).
const walkerUrls = import.meta.glob('./assets/characters/npc-*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const walkerKey = (sheet: string) => 'pl-walker-' + sheet

export function preloadPixelLab(scene: Phaser.Scene) {
  for (const [path, url] of Object.entries(urls)) if (!scene.textures.exists(key(path))) scene.load.image(key(path), url)
  for (const [path, url] of Object.entries(walkerUrls)) {
    const name = walkerKey(path.split('/').pop()!.replace(/^npc-|.png$/g, ''))
    if (!scene.textures.exists(name)) scene.load.spritesheet(name, url, { frameWidth: 80, frameHeight: 80 })
  }
}

const object = (name: string) => `pl-objects-${name}`

// Ground gids 1-16 map 1:1 onto ground/tile_0..15 (grass, pavement, road, plaza; 4 variants each).
// A border of MARGIN cells hides the void past the playable edge: each edge cell carries on outwards, so roads and
// pavements run off the map instead of stopping at a grass field (plaza continues as plain pavement). Baked in chunks of CHUNK cells so no
// render texture outgrows what a phone GPU allows.
const MARGIN = 14, CHUNK = 24
export function groundTiles(scene: Phaser.Scene, tiles: number[], width: number) {
  const height = tiles.length / width
  for (let cy = -MARGIN; cy < height + MARGIN; cy += CHUNK) {
    for (let cx = -MARGIN; cx < width + MARGIN; cx += CHUNK) {
      const x1 = Math.min(cx + CHUNK, width + MARGIN), y1 = Math.min(cy + CHUNK, height + MARGIN)
      const left = project(cx, y1).x - TILE_WIDTH / 2, right = project(x1, cy).x + TILE_WIDTH / 2
      const top = project(cx, cy).y - TILE_WIDTH, bottom = project(x1, y1).y + TILE_WIDTH
      const rt = scene.add.renderTexture(left, top, right - left, bottom - top).setOrigin(0).setDepth(-2001)
      rt.beginDraw()
      for (let y = cy; y < y1; y++) {
        for (let x = cx; x < x1; x++) {
          const inside = x >= 0 && y >= 0 && x < width && y < height
          const kindAt = (ex: number, ey: number) => {
            const t = tiles[Phaser.Math.Clamp(ey, 0, height - 1) * width + Phaser.Math.Clamp(ex, 0, width - 1)]
            return t ? (t - 1) >> 2 : -1
          }
          let tile = inside ? tiles[y * width + x] : 0
          if (!inside) {
            // 0 grass, 1 pavement, 2 road: a road keeps going with a pavement kerb either side, everything else is verge.
            const road = (ex: number, ey: number) => kindAt(ex, ey) === 2
            const along = x < 0 || x >= width ? [[x, y - 1], [x, y + 1]] : [[x - 1, y], [x + 1, y]]
            const kind = road(x, y) ? 2 : along.some(([ex, ey]) => road(ex, ey)) ? 1 : 0
            tile = 1 + kind * 4 + ((x * 7 + y * 13) & 3)
          }
          if (!tile) continue
          const centre = project(x + .5, y + .5)
          rt.batchDraw(`pl-ground-tile_${tile - 1}`, centre.x - left - TILE_WIDTH / 2, centre.y - top - TILE_WIDTH / 2)
        }
      }
      rt.endDraw()
    }
  }
}

// Sprites sized to the Tiled footprint so collisions and doors keep lining up with what is drawn.
const fitted: Record<string, string | ((p: MapProp) => string)> = {
  block: p => p.properties.sprite ? String(p.properties.sprite) : ['hdb-teal', 'hdb-mondrian', 'hdb-yellow'][Number(String(p.properties.number).slice(-1)) % 3],
  shop: 'minimart', kopi: 'kopi', play: 'playground', garden: 'garden', planter: 'planter',
  shelter: 'linkway', linkway: 'linkway', bus: 'bus-shelter', hawker: 'hawker-centre', fitness: 'fitness-corner', pavilion: 'pavilion', pond: 'pond',
  // Any other building: its sprite and (optionally) sign text come from the map.
  building: p => String(p.properties.sprite),
  house: p => p.name.includes('Freeze Frame') || p.name.includes('House H') ? 'house-h'
    : p.name.includes('Whisper Network') || p.name.includes('House I') ? 'house-i' : 'house-mysterious',
}
const alongY = new Set(['hdb-teal', 'hdb-mondrian'])
// Small props keep one pixel scale so street furniture reads consistently.
const fixed: Record<string, [string | ((p: MapProp) => string), number]> = {
  tree: [p => (p.properties.palm ? 'rain-tree' : Math.round(p.x * 7 + p.y * 3) % 5 === 0 ? 'frangipani' : 'angsana'), .9],
  npc: [p => String(p.properties.sprite), 1],
  lamp: ['lamp', .9], trafficLight: ['traffic-light', .85], sign: ['street-sign', 1.05], bench: ['bench', .95],
  bin: ['bin', .8], kopitiam: ['kopitiam-table', 1.15], bougainvillea: ['planter', 1], chess: ['chess-table', 1], recycle: ['recycling-bins', 1],
  bikes: ['bikes', 1.1],
}

// Names painted onto the generated (blank) signboards and HDB end walls. Positions are in source sprite pixels;
// slope shears the text along an isometric wall (+.5 runs down-right, -.5 up-right); size is in world pixels.
type Sign = { x: number; y: number; slope: number; w: number; h: number; size: number; colour: string; plate?: string; lines: (p: MapProp) => string[] }
const blk = (p: MapProp) => ['BLK', String(p.properties.number)]
const signs: Record<string, Sign> = {
  'hdb-teal': { x: 33, y: 128, slope: .5, w: 48, h: 40, size: 13, colour: '#24474f', lines: blk },
  'hdb-mondrian': { x: 60, y: 222, slope: .5, w: 36, h: 40, size: 13, colour: '#b9482a', lines: blk },
  'hdb-yellow': { x: 278, y: 190, slope: -.5, w: 56, h: 44, size: 13, colour: '#2f6b2a', lines: blk },
  kopi: { x: 211, y: 58, slope: .5, w: 112, h: 44, size: 10, colour: '#7c2a22', lines: () => ['KOPI CORNER', '咖啡店'] },
  minimart: { x: 137, y: 49, slope: .5, w: 86, h: 44, size: 10, colour: '#fff6d8', lines: () => ['SUNSHINE', 'MINIMART'] },
  'house-h': { x: 140, y: 160, slope: -.5, w: 66, h: 11, size: 6, colour: '#ffe7a8', plate: '#2e2f36', lines: () => ['FREEZE FRAME'] },
  'house-i': { x: 55, y: 135, slope: .5, w: 58, h: 24, size: 7, colour: '#ffe7a8', plate: '#2b2238', lines: () => ['WHISPER', 'NETWORK'] },
  'hawker-centre': { x: 96, y: 130, slope: .5, w: 120, h: 20, size: 9, colour: '#fff2c4', plate: '#1f5a3a', lines: () => ['SUNSHINE FOOD CENTRE'] },
  'hdb-point': { x: 125, y: 112, slope: -.5, w: 30, h: 34, size: 13, colour: '#c0582b', lines: blk },
  'mrt-station': { x: 295, y: 32, slope: .5, w: 58, h: 30, size: 10, colour: '#ffffff', plate: '#1d3b6e', lines: () => ['SUNSHINE', 'MRT'] },
  'town-mall': { x: 128, y: 55, slope: .5, w: 90, h: 46, size: 15, colour: '#1f6f8b', lines: () => ['SUNSHINE', 'POINT'] },
  'community-club': { x: 89, y: 130, slope: .5, w: 34, h: 26, size: 8, colour: '#a8323a', lines: () => ['SUNSHINE', 'CC'] },
  'neighbourhood-centre': { x: 130, y: 92, slope: .5, w: 88, h: 14, size: 8, colour: '#fff2c4', plate: '#2f5d50', lines: () => ['SUNSHINE CENTRE'] },
  library: { x: 205, y: 118, slope: -.5, w: 70, h: 18, size: 9, colour: '#fff3dc', lines: () => ['LIBRARY'] },
  'bus-interchange': { x: 115, y: 100, slope: .5, w: 120, h: 16, size: 9, colour: '#ffffff', plate: '#2b4a6f', lines: () => ['SUNSHINE BUS INTERCHANGE'] },
  school: { x: 246, y: 165, slope: -.4, w: 30, h: 16, size: 6, colour: '#1e3a8a', lines: () => ['SUNSHINE', 'PRI SCH'] },
  'house-mysterious': { x: 157, y: 178, slope: -.5, w: 44, h: 26, size: 6, colour: '#f1e6c8', plate: '#2a2a2e', lines: () => ['MYSTERY', 'HOUSE'] },
}

/** The sprite with its name painted on, mirrored first when flip is set. Smoothly filtered, since buildings are
 *  drawn at roughly their native size and nearest-neighbour scaling made them look blocky. */
function signedTexture(scene: Phaser.Scene, name: string, p: MapProp, flip: boolean, scale: number) {
  // A shophouse can carry its own sign text (lines split by |) on a shared sprite.
  const sign = signs[name], lines = p.properties.sign ? String(p.properties.sign).split('|') : sign?.lines(p) ?? []
  const key = `${object(name)}~${flip ? 'f' : ''}~${lines.join('/')}`
  if (scene.textures.exists(key)) return key
  const src = scene.textures.get(object(name)).getSourceImage() as HTMLImageElement
  const canvas = scene.textures.createCanvas(key, src.width, src.height)
  if (!canvas) return object(name)
  const ctx = canvas.context
  ctx.save()
  if (flip) ctx.setTransform(-1, 0, 0, 1, src.width, 0)
  ctx.drawImage(src, 0, 0)
  ctx.restore()
  if (sign) {
    const slope = flip ? -sign.slope : sign.slope
    ctx.setTransform(1, slope, 0, 1, flip ? src.width - sign.x : sign.x, sign.y)
    if (sign.plate) { ctx.fillStyle = sign.plate; ctx.fillRect(-sign.w / 2, -sign.h / 2, sign.w, sign.h) }
    // Shrink to fit the board when the name is long or the sprite is drawn small.
    let size = Math.min(sign.size / scale, sign.h / lines.length * .9)
    ctx.font = `800 ${size}px Outfit, sans-serif`
    const widest = Math.max(...lines.map(line => ctx.measureText(line).width))
    if (widest > sign.w * .92) size *= sign.w * .92 / widest
    ctx.font = `800 ${size}px Outfit, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = sign.colour
    lines.forEach((line, i) => ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * size * 1.05))
  }
  canvas.setFilter(Phaser.Textures.FilterMode.LINEAR)
  canvas.refresh()
  return key
}

// Walkable covered walkways and shelters would hide a player standing beneath them, so only these roofs,
// and only while the player is under them or just behind them (the roof art overhangs its footprint by about
// a tile and a half towards the back), turn see-through. Trees and buildings never fade.
const OVERHANG = 1.5
const roofKinds = new Set(['shelter', 'linkway', 'bus'])
const roofs = new WeakMap<Phaser.Scene, { image: Phaser.GameObjects.Image; p: MapProp }[]>()
export function updateRoofs(scene: Phaser.Scene, at: { x: number; y: number }) {
  for (const { image, p } of roofs.get(scene) ?? []) {
    image.setAlpha(at.x >= p.x - OVERHANG && at.x <= p.x + p.w && at.y >= p.y - OVERHANG && at.y <= p.y + p.d ? .45 : 1)
  }
}

// Trees per scene, so detail areas can make their crowns stir (ambient.ts).
const trees = new WeakMap<Phaser.Scene, { image: Phaser.GameObjects.Image; p: MapProp }[]>()
export const treeImages = (scene: Phaser.Scene) => trees.get(scene) ?? []

// Buildings per scene, with the opaque pixels of their sprite, so nobody can walk where a building would hide them.
type Solid = { image: Phaser.GameObjects.Image; p: MapProp; mask: Uint8Array; w: number }
const solids = new WeakMap<Phaser.Scene, Solid[]>()
const perScene = <T>(map: WeakMap<Phaser.Scene, T[]>, scene: Phaser.Scene) => {
  if (!map.has(scene)) {
    map.set(scene, [])
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => map.delete(scene))
  }
  return map.get(scene)!
}
const masks = new Map<string, Uint8Array>()
function alphaMask(scene: Phaser.Scene, key: string) {
  if (!masks.has(key)) {
    const source = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement
    const canvas = document.createElement('canvas')
    canvas.width = source.width; canvas.height = source.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(source, 0, 0)
    const data = ctx.getImageData(0, 0, source.width, source.height).data
    const mask = new Uint8Array(source.width * source.height)
    for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 96 ? 1 : 0
    masks.set(key, mask)
  }
  return masks.get(key)!
}

// Close behind a building counts as walking under it; further back a tall building may still cover the player.
const NEAR = 2.5
/** Whether a character standing here is covered by a building: 'near' (right behind it, kept out), 'far' (further
 *  behind a tall one: walkable, the player shows as a ghost), or false. */
export function hiddenByBuilding(scene: Phaser.Scene, at: { x: number; y: number }): 'near' | 'far' | false {
  const feet = project(at.x, at.y)
  let hidden: 'near' | 'far' | false = false
  for (const { image, p, mask, w } of solids.get(scene) ?? []) {
    // In front of either visible wall: drawn over the building, so never hidden.
    if (at.x >= p.x + p.w || at.y >= p.y + p.d) continue
    const u = Math.floor((feet.x - image.x) / image.scaleX + image.width / 2)
    if (u < 0 || u >= w) continue
    for (const lift of [6, 24, 44]) {
      const v = Math.floor((feet.y - lift - image.y) / image.scaleY + image.height)
      if (v < 0 || v >= image.height || !mask[v * w + u]) continue
      if (Math.max(p.x - at.x, p.y - at.y) < NEAR) return 'near'
      hidden = 'far'
    }
  }
  return hidden
}

/** Draws the prop as a PixelLab sprite; returns false when no sprite covers this kind. */
export function spriteProp(scene: Phaser.Scene, p: MapProp) {
  const depth = depthAt(p.x + p.w, p.y + p.d)
  const pick = (name: string | ((p: MapProp) => string)) => object(typeof name === 'function' ? name(p) : name)
  // A block with a void deck is a modular, walkable HDB block rather than one flat sprite.
  if (p.kind === 'block' && p.properties.voidDeck) {
    const override = import.meta.env.DEV ? (window as { __hdbOverride?: Record<string, Record<string, unknown>> }).__hdbOverride?.[p.name] : undefined
    // Dev-only visual checks: override properties, or a footprint (drawing only; collisions still come from the map).
    const { footprint, ...props } = (override ?? {}) as { footprint?: Partial<MapProp> }
    buildHdbBlock(scene, override ? { ...p, ...footprint, properties: { ...p.properties, ...props } } : p)
    return true
  }
  if (fitted[p.kind]) {
    const name = typeof fitted[p.kind] === 'function' ? (fitted[p.kind] as (p: MapProp) => string)(p) : fitted[p.kind] as string
    const image = scene.add.image(0, 0, object(name))
    const footprintWidth = (p.w + p.d) * TILE_WIDTH / 2
    const scale = footprintWidth / image.width
    // Elongated walkways and slab blocks run along whichever grid axis is longer; these sprites are drawn along y.
    const flip = (alongY.has(name) || roofKinds.has(p.kind)) && p.w > p.d
    if (roofKinds.has(p.kind)) image.setFlipX(flip)
    else image.setTexture(signedTexture(scene, name, p, flip, scale))
    const base = project(p.x + p.w / 2, p.y + p.d / 2)
    const bottom = project(p.x + p.w, p.y + p.d).y
    image.setScale(scale).setOrigin(.5, 1).setPosition(base.x, bottom + 2).setDepth(depth)
    if (roofKinds.has(p.kind)) perScene(roofs, scene).push({ image, p })
    else {
      // A long building's front corner is far forward, so sorting by it hides anyone standing along its front walls.
      // Everything in front of either visible wall is at least this deep; anything behind is kept out (hiddenByBuilding).
      image.setDepth(depthAt(p.x, p.y + Math.min(p.w, p.d)) - .5)
      // A block with a void deck is walkable underneath: it reveals the player through its upper floors instead.
      perScene(solids, scene).push({ image, p, mask: alphaMask(scene, image.texture.key), w: image.width })
    }
    return true
  }
  if (fixed[p.kind]) {
    const [name, scale] = fixed[p.kind]
    const size = p.properties.large ? 1.2 : 1
    const at = project(p.x + p.w / 2, p.y + p.d / 2)
    const image = scene.add.image(at.x, at.y + 4, pick(name)).setOrigin(.5, 1).setScale(scale * size).setDepth(depth)
    if (p.kind === 'npc') image.setName('character')
    if (p.kind === 'tree') perScene(trees, scene).push({ image, p })
    return true
  }
  return false
}
