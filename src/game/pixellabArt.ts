import type Phaser from 'phaser'
import { depthAt, project, TILE_WIDTH } from './isometric'
import type { MapProp } from './maps'

// PixelLab-generated art, shared with the Unity project (see docs/pixellab-assets.md).
const urls = import.meta.glob('./assets/pixellab/**/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const key = (path: string) => 'pl-' + path.split('/').slice(-2).join('-').replace('.png', '')

export function preloadPixelLab(scene: Phaser.Scene) {
  for (const [path, url] of Object.entries(urls)) if (!scene.textures.exists(key(path))) scene.load.image(key(path), url)
}

const object = (name: string) => `pl-objects-${name}`

// Ground gids 1-16 map 1:1 onto ground/tile_0..15 (grass, pavement, road, plaza; 4 variants each).
// A grass border of MARGIN cells hides the void past the playable edge.
const MARGIN = 14
export function groundTiles(scene: Phaser.Scene, tiles: number[], width: number) {
  const height = tiles.length / width
  const left = project(-MARGIN, height + MARGIN).x - TILE_WIDTH / 2, right = project(width + MARGIN, -MARGIN).x + TILE_WIDTH / 2
  const top = project(-MARGIN, -MARGIN).y - TILE_WIDTH, bottom = project(width + MARGIN, height + MARGIN).y + TILE_WIDTH
  const rt = scene.add.renderTexture(left, top, right - left, bottom - top).setOrigin(0).setDepth(-2001)
  rt.beginDraw()
  for (let y = -MARGIN; y < height + MARGIN; y++) {
    for (let x = -MARGIN; x < width + MARGIN; x++) {
      const inside = x >= 0 && y >= 0 && x < width && y < height
      const tile = inside ? tiles[y * width + x] : 1 + ((x * 7 + y * 13) & 3)
      if (!tile) continue
      const centre = project(x + .5, y + .5)
      rt.batchDraw(`pl-ground-tile_${tile - 1}`, centre.x - left - TILE_WIDTH / 2, centre.y - top - TILE_WIDTH / 2)
    }
  }
  rt.endDraw()
}

// Sprites sized to the Tiled footprint so collisions and doors keep lining up with what is drawn.
const fitted: Record<string, string | ((p: MapProp) => string)> = {
  block: p => ['hdb-teal', 'hdb-mondrian', 'hdb-yellow'][Number(String(p.properties.number).slice(-1)) % 3],
  shop: 'minimart', kopi: 'kopi', play: 'playground', garden: 'garden', bikes: 'bikes', planter: 'planter',
  shelter: 'linkway', linkway: 'linkway', bus: 'bus-shelter',
  house: p => p.name.includes('Freeze Frame') || p.name.includes('House H') ? 'house-h'
    : p.name.includes('Whisper Network') || p.name.includes('House I') ? 'house-i' : 'house-mysterious',
}
// Small props keep one pixel scale so street furniture reads consistently.
const fixed: Record<string, [string | ((p: MapProp) => string), number]> = {
  tree: [p => (Math.round(p.x * 7 + p.y * 3) % 4 === 0 ? 'frangipani' : 'rain-tree'), 1.1],
  lamp: ['lamp', 1.05], trafficLight: ['traffic-light', .95], sign: ['street-sign', 1.05], bench: ['bench', 1.25],
  bin: ['bin', 1.1], kopitiam: ['kopitiam-table', 1.15], bougainvillea: ['planter', 1.2],
}

// [text, height fraction from sprite top, plate colour, text colour] — the generated signboards are blank.
const signs: Record<string, (p: MapProp) => [string, number, string, string]> = {
  block: p => [`BLK ${p.properties.number}`, .16, '#1f3b4d', '#f4efe2'],
  shop: () => ['SUNSHINE MINIMART', .3, '#1d6b45', '#fff6d8'],
  kopi: () => ['KOPI CORNER', .38, '#7c2a22', '#fff6d8'],
  house: p => [p.name.includes('Freeze') ? 'FREEZE FRAME' : p.name.includes('Whisper') ? 'WHISPER NETWORK' : 'MYSTERY HOUSE', .12, '#2b2238', '#ffe7a8'],
}

/** Draws the prop as a PixelLab sprite; returns false when no sprite covers this kind. */
export function spriteProp(scene: Phaser.Scene, p: MapProp) {
  const depth = depthAt(p.x + p.w, p.y + p.d)
  const pick = (name: string | ((p: MapProp) => string)) => object(typeof name === 'function' ? name(p) : name)
  if (fitted[p.kind]) {
    const texture = pick(fitted[p.kind])
    const image = scene.add.image(0, 0, texture)
    const footprintWidth = (p.w + p.d) * TILE_WIDTH / 2
    const scale = footprintWidth / image.width
    // Elongated walkways run along whichever grid axis is longer; the sprites are drawn along y.
    image.setFlipX(['shelter', 'linkway', 'bus'].includes(p.kind) && p.w > p.d)
    const base = project(p.x + p.w / 2, p.y + p.d / 2)
    const bottom = project(p.x + p.w, p.y + p.d).y
    image.setScale(scale).setOrigin(.5, 1).setPosition(base.x, bottom + 2).setDepth(depth)
    const sign = signs[p.kind]?.(p)
    if (sign) {
      const [text, at, fill, colour] = sign
      scene.add.text(base.x, bottom - image.displayHeight * (1 - at), text, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: colour, backgroundColor: fill, padding: { x: 4, y: 3 },
      }).setOrigin(.5).setDepth(depth + .5).setResolution(2)
    }
    return true
  }
  if (fixed[p.kind]) {
    const [name, scale] = fixed[p.kind]
    const size = p.properties.large ? 1.2 : 1
    const at = project(p.x + p.w / 2, p.y + p.d / 2)
    scene.add.image(at.x, at.y + 4, pick(name)).setOrigin(.5, 1).setScale(scale * size).setDepth(depth)
    return true
  }
  return false
}
