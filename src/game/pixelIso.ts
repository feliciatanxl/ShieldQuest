import { project } from './isometric'
import { glyphs as GLYPHS } from './glyphs'

/**
 * Habbo-style sprite baker (docs/isometric-art-spec.md). Shapes are rasterised at 1 px = 1 screen pixel at zoom 1
 * with hard edges (no anti-aliasing), then every sprite gets the same treatment: a dark silhouette outline and a
 * darker seam wherever two faces meet. The camera then scales by whole numbers, so every object in the scene
 * shares one pixel grid and one outline weight.
 */
type V = [number, number, number?]
type Face = { pts: { x: number; y: number }[]; rgb: number; alpha: number; seam: boolean }

const hex = (c: string) => Number.parseInt(c.slice(1), 16)
const scale = (rgb: number, f: number) => {
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((rgb >> s) & 255) * f)))
  return (ch(16) << 16) | (ch(8) << 8) | ch(0)
}
/** Three tones from one base colour, lit from the upper left: [top, left (y) face, right (x) face]. */
export const tones = (base: string): [string, string, string] => {
  const c = hex(base), s = (f: number) => '#' + scale(c, f).toString(16).padStart(6, '0')
  return [s(1.14), base, s(.76)]
}

export class Painter {
  readonly faces: Face[] = []
  /** Any polygon in world space: tile x, tile y, height in pixels. */
  poly(color: string, vertices: V[], alpha = 1, seam = true) {
    this.faces.push({ pts: vertices.map(([x, y, h = 0]) => { const p = project(x, y, h); return { x: Math.round(p.x), y: Math.round(p.y) } }), rgb: hex(color), alpha, seam })
    return this
  }
  floor(x: number, y: number, w: number, d: number, color: string, z = 0, alpha = 1) {
    return this.poly(color, [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], alpha, alpha === 1)
  }
  /** The face looking down the y axis (lower left on screen). */
  front(x: number, y: number, w: number, z: number, h: number, color: string) {
    return this.poly(color, [[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]])
  }
  /** The face looking down the x axis (lower right on screen). */
  side(x: number, y: number, d: number, z: number, h: number, color: string) {
    return this.poly(color, [[x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h]])
  }
  box(x: number, y: number, w: number, d: number, h: number, colors: string | readonly [string, string, string], z = 0) {
    const [top, left, right] = typeof colors === 'string' ? tones(colors) : colors
    this.side(x + w, y, d, z, h, right)
    this.front(x, y + d, w, z, h, left)
    return this.floor(x, y, w, d, top, z + h)
  }
  /** Soft ground shadow (no seams, blended). */
  shadow(x: number, y: number, w: number, d: number, alpha = .22) {
    return this.floor(x, y, w, d, '#1c2430', 0, alpha)
  }
  /** Screen-aligned pixel rectangle anchored at a world point: lamps, fruit, leaves. */
  dot(x: number, y: number, z: number, dx: number, dy: number, w: number, h: number, color: string) {
    const p = project(x, y, z), l = Math.round(p.x + dx), t = Math.round(p.y + dy)
    this.faces.push({ pts: [{ x: l, y: t }, { x: l + w, y: t }, { x: l + w, y: t + h }, { x: l, y: t + h }], rgb: hex(color), alpha: 1, seam: false })
    return this
  }
  /** Screen-space ellipse anchored at a world point: canopies, shrubs, shadows. */
  blob(x: number, y: number, z: number, dx: number, dy: number, rx: number, ry: number, color: string, alpha = 1) {
    const p = project(x, y, z), pts = []
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * Math.PI * 2
      pts.push({ x: Math.round(p.x + dx + Math.cos(a) * rx), y: Math.round(p.y + dy + Math.sin(a) * ry) })
    }
    this.faces.push({ pts, rgb: hex(color), alpha, seam: alpha >= 1 })
    return this
  }
  /** Pixel-font sign text (textBitmap) on a front face, or a side face with onSide; each font pixel is unit tiles
   *  along and px pixels up, z is the bottom of the text. Returns false (and draws nothing) before the font loads. */
  sign(text: string, x: number, y: number, z: number, unit: number, px: number, color: string, onSide = false) {
    const bm = textBitmap(text)
    if (!bm) return false
    const width = bm.w * unit
    bm.rows.forEach((runs, row) => runs.forEach(([start, n]) => {
      const up = z + (8 - row) * px
      if (onSide) this.side(x, y + width - (start + n) * unit, n * unit, up, px, color)
      else this.front(x + start * unit, y, n * unit, up, px, color)
    }))
    return true
  }
  /** 3x5 pixel lettering on a front (y) face or, with onSide, a side (x) face; unit is one letter pixel in tiles. */
  letters(text: string, x: number, y: number, z: number, unit: number, px: number, color: string, onSide = false) {
    // A side face reads left to right towards -y on screen, so its text runs back from the far end of [y, y + width].
    const width = (text.length * 4 - 1) * unit
    Array.from(text).forEach((letter, index) => Array.from(GLYPHS[letter] ?? '').forEach((bit, cell) => {
      if (bit !== '1') return
      const along = (index * 4 + cell % 3) * unit, up = z + (4 - Math.floor(cell / 3)) * px
      if (onSide) this.side(x, y + width - along - unit, unit, up, px, color)
      else this.front(x + along, y, unit, up, px, color)
    }))
    return this
  }
}

const SIGN_FONT = '8px "Press Start 2P"', bitmaps = new Map<string, { w: number; rows: [number, number][][] }>()
/** Mixed-case sign lettering: the text rasterised once in Press Start 2P (an 8 px pixel font, so every glyph pixel is
 *  whole), as runs of ink per row. Null until the font has loaded (callers fall back to the 3×5 capitals). */
export function textBitmap(text: string) {
  if (typeof document === 'undefined' || !document.fonts?.check(SIGN_FONT)) return null
  if (!bitmaps.has(text)) {
    const c = document.createElement('canvas'), x = c.getContext('2d')!
    x.font = SIGN_FONT
    const w = Math.ceil(x.measureText(text).width) + 1
    c.width = w; c.height = 9
    x.font = SIGN_FONT; x.textBaseline = 'top'; x.fillStyle = '#000'; x.fillText(text, 0, 0)
    const d = x.getImageData(0, 0, w, 9).data, rows: [number, number][][] = []
    for (let y = 0; y < 9; y++) {
      const runs: [number, number][] = []
      for (let i = 0, start = -1; i <= w; i++) {
        const ink = i < w && d[(y * w + i) * 4 + 3] > 110
        if (ink && start < 0) start = i
        if (!ink && start >= 0) { runs.push([start, i - start]); start = -1 }
      }
      rows.push(runs)
    }
    bitmaps.set(text, { w, rows })
  }
  return bitmaps.get(text)!
}

/** Rasterises the painter's faces in order (painter's algorithm) and applies outline and seams. */
/** outline: true for silhouette + seams, 'seams' for seams only (ground chunks, whose edges must tile seamlessly).
 *  frame: a fixed pixel rectangle to rasterise into (faces outside it are clipped); by default the faces' bounds. */
export function rasterise(painter: Painter, outline: boolean | 'seams' = true, frame?: { x: number; y: number; W: number; H: number }) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const f of painter.faces) for (const p of f.pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) }
  minX = frame ? frame.x : minX - 1; minY = frame ? frame.y : minY - 1
  const W = frame ? frame.W : maxX - minX + 2, H = frame ? frame.H : maxY - minY + 2
  const rgba = new Uint8ClampedArray(W * H * 4), ids = new Int32Array(W * H).fill(-1)
  painter.faces.forEach((face, id) => {
    const pts = face.pts.map(p => ({ x: p.x - minX, y: p.y - minY }))
    const top = Math.max(0, Math.min(...pts.map(p => p.y))), bottom = Math.min(H, Math.max(...pts.map(p => p.y)))
    const r = (face.rgb >> 16) & 255, g = (face.rgb >> 8) & 255, b = face.rgb & 255
    for (let row = top; row < bottom; row++) {
      const cy = row + .5, xs: number[] = []
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], c = pts[(i + 1) % pts.length]
        if ((a.y <= cy) !== (c.y <= cy)) xs.push(a.x + (cy - a.y) / (c.y - a.y) * (c.x - a.x))
      }
      xs.sort((m, n) => m - n)
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let col = Math.max(0, Math.ceil(xs[k] - .5)); col < Math.min(W, Math.ceil(xs[k + 1] - .5)); col++) {
          const i = row * W + col, o = i * 4
          if (face.alpha >= 1) { rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = 255 }
          else {
            const a = face.alpha
            rgba[o] = rgba[o] * (1 - a) + r * a; rgba[o + 1] = rgba[o + 1] * (1 - a) + g * a; rgba[o + 2] = rgba[o + 2] * (1 - a) + b * a
            rgba[o + 3] = Math.max(rgba[o + 3], a * 255)
          }
          if (face.seam) ids[i] = id
          else if (face.alpha >= 1) ids[i] = -1
        }
      }
    }
  })
  if (outline) {
    const out = new Uint8ClampedArray(rgba)
    const solid = (i: number) => rgba[i * 4 + 3] > 200
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4
      if (!solid(i)) continue
      const edge = outline === true && (x === 0 || y === 0 || x === W - 1 || y === H - 1 || !solid(i - 1) || !solid(i + 1) || !solid(i - W) || !solid(i + W))
      // Silhouette: one dark pixel; seam: a face boundary seen from below or right gets a softer line.
      const f = edge ? .3 : ids[i] >= 0 && ((i >= W && ids[i - W] >= 0 && ids[i - W] !== ids[i]) || (x > 0 && ids[i - 1] >= 0 && ids[i - 1] !== ids[i])) ? .8 : 1
      // Outline: warm near-black #24160c mixed with 30 % of the colour beneath (docs/art-direction.md §3.1), never navy.
      if (f < 1) { out[o] = rgba[o] * f + (edge ? 25 : 0); out[o + 1] = rgba[o + 1] * f + (edge ? 15 : 0); out[o + 2] = rgba[o + 2] * f + (edge ? 8 : 0) }
    }
    rgba.set(out)
  }
  return { rgba, W, H, x: minX, y: minY }
}
