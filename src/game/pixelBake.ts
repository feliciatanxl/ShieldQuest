import Phaser from 'phaser'
import { Painter, rasterise } from './pixelIso'
import { project } from './isometric'

/** The slice of Phaser.Graphics that worldArt.ts draws with, recorded into a Painter instead of the GPU. */
class GraphicsShim {
  private rgb = 0
  private alpha = 1
  constructor(private painter: Painter) {}
  fillStyle(rgb: number, alpha = 1) { this.rgb = rgb; this.alpha = alpha; return this }
  fillPoints(points: { x: number; y: number }[]) {
    this.painter.faces.push({ pts: points.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })), rgb: this.rgb, alpha: this.alpha, seam: this.alpha >= 1 })
    return this
  }
  fillRect(x: number, y: number, w: number, h: number) { return this.fillPoints([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }]) }
}

/** Bakes existing worldArt drawing code (box, floor, front, side, …) into an outlined pixel sprite. */
export function bakeGraphics(scene: Phaser.Scene, key: string, render: (g: Phaser.GameObjects.Graphics) => void, depth: number, outline: boolean | 'seams' = true) {
  return bake(scene, key, p => render(new GraphicsShim(p) as unknown as Phaser.GameObjects.Graphics), depth, outline)
}

type Baked = { x: number; y: number; W: number; H: number; mask?: Uint8Array }
/** Rasterises once per key into a nearest-filtered texture; keepMask stores a half-resolution opacity mask. */
export function bakeTexture(scene: Phaser.Scene, key: string, draw: (p: Painter) => void, outline: boolean | 'seams' = true, frame?: { x: number; y: number; W: number; H: number }, keepMask = false): Baked {
  if (scene.textures.exists(key)) return scene.textures.get(key).customData as Baked
  const painter = new Painter()
  draw(painter)
  const { rgba, W, H, x, y } = rasterise(painter, outline, frame)
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  canvas.getContext('2d')!.putImageData(new ImageData(rgba, W, H), 0, 0)
  const texture = scene.textures.addCanvas(key, canvas)!
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
  let mask: Uint8Array | undefined
  if (keepMask) {
    mask = new Uint8Array(Math.ceil(W / 2) * Math.ceil(H / 2))
    for (let j = 0; j < H; j += 2) for (let i = 0; i < W; i += 2) mask[(j >> 1) * Math.ceil(W / 2) + (i >> 1)] = rgba[(j * W + i) * 4 + 3] > 128 ? 1 : 0
  }
  return texture.customData = { x, y, W, H, mask }
}
/** Whether a world pixel falls on an opaque pixel of a baked texture. */
export const opaqueAt = (b: Baked, px: number, py: number) => {
  const i = Math.floor(px - b.x), j = Math.floor(py - b.y)
  return !!b.mask && i >= 0 && j >= 0 && i < b.W && j < b.H && b.mask[(j >> 1) * Math.ceil(b.W / 2) + (i >> 1)] === 1
}

/** Bakes a painter into a nearest-filtered texture (once per key) and places it; returns the image. */
export function bake(scene: Phaser.Scene, key: string, draw: (p: Painter) => void, depth: number, outline: boolean | 'seams' = true) {
  const at = bakeTexture(scene, key, draw, outline)
  return scene.add.image(at.x, at.y, key).setOrigin(0).setDepth(depth)
}

/** Bakes a prop drawn at the tile origin once, and places a copy with its origin at a world tile point. */
export function bakeAt(scene: Phaser.Scene, key: string, draw: (p: Painter) => void, x: number, y: number, depth: number) {
  const at = bakeTexture(scene, key, draw), p = project(x, y)
  return scene.add.image(Math.round(p.x) + at.x, Math.round(p.y) + at.y, key).setOrigin(0).setDepth(depth)
}

// Interiors are rebuilt on every visit, so their baked textures are per visit and freed when the scene shuts down.
let serial = 0
const freeOnShutdown = (scene: Phaser.Scene, key: string) => scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.textures.exists(key) && scene.textures.remove(key))
/** Bakes worldArt drawing code (box, floor, …) into an outlined sprite now; the texture lives until the scene shuts down. */
export function bakeProp(scene: Phaser.Scene, render: (g: Phaser.GameObjects.Graphics) => void, depth: number) {
  const key = `prop-${++serial}`
  freeOnShutdown(scene, key)
  return bakeGraphics(scene, key, render, depth)
}
/** A Graphics stand-in for room shells drawn piecemeal: records every shape, then bakes once just before the first render. */
export function recordGraphics(scene: Phaser.Scene, depth: number) {
  const painter = new Painter(), key = `room-${++serial}`
  freeOnShutdown(scene, key)
  scene.events.once(Phaser.Scenes.Events.PRE_RENDER, () => {
    if (!painter.faces.length) return
    bake(scene, key, p => p.faces.push(...painter.faces), depth)
  })
  return new GraphicsShim(painter) as unknown as Phaser.GameObjects.Graphics
}
