import Phaser from 'phaser'
import { Painter, rasterise } from './pixelIso'

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
export function bakeGraphics(scene: Phaser.Scene, key: string, render: (g: Phaser.GameObjects.Graphics) => void, depth: number, outline = true) {
  return bake(scene, key, p => render(new GraphicsShim(p) as unknown as Phaser.GameObjects.Graphics), depth, outline)
}

/** Bakes a painter into a nearest-filtered texture (once per key) and places it; returns the image. */
export function bake(scene: Phaser.Scene, key: string, draw: (p: Painter) => void, depth: number, outline = true) {
  let at = scene.textures.exists(key) ? (scene.textures.get(key).customData as { x: number; y: number }) : undefined
  if (!at) {
    const painter = new Painter()
    draw(painter)
    const { rgba, W, H, x, y } = rasterise(painter, outline)
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    canvas.getContext('2d')!.putImageData(new ImageData(rgba, W, H), 0, 0)
    const texture = scene.textures.addCanvas(key, canvas)!
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    texture.customData = at = { x, y }
  }
  return scene.add.image(at.x, at.y, key).setOrigin(0).setDepth(depth)
}
