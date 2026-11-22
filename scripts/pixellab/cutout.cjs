// node scripts/pixellab/cutout.cjs <in.png> <out.png> [tolerance]
// PixelLab objects above 200x200 come on a flat background colour. Flood-fills it away from the edges (so the
// same colour inside the building, behind an outline, stays), then trims the transparent margin.
const { decode, encode } = require('./png.cjs')
const [input, out, tol = 12] = process.argv.slice(2)
const im = decode(input), { w, h, data } = im
// The most common edge colour is the background.
const counts = {}
for (let x = 0; x < w; x++) for (const y of [0, h - 1]) { const i = (y * w + x) * 4; const k = data.readUInt32BE(i); counts[k] = (counts[k] || 0) + 1 }
const bg = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0])
const ref = [bg >>> 24, (bg >>> 16) & 255, (bg >>> 8) & 255]
const isBg = p => data[p * 4 + 3] < 128 || ref.every((c, k) => Math.abs(data[p * 4 + k] - c) <= tol)
const seen = new Uint8Array(w * h), stack = []
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
while (stack.length) {
  const p = stack.pop()
  if (seen[p] || !isBg(p)) continue
  seen[p] = 1; data[p * 4 + 3] = 0
  const x = p % w
  if (x > 0) stack.push(p - 1); if (x < w - 1) stack.push(p + 1); if (p >= w) stack.push(p - w); if (p < w * (h - 1)) stack.push(p + w)
}
let x0 = w, y0 = h, x1 = -1, y1 = -1
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
const tw = x1 - x0 + 1, th = y1 - y0 + 1, trimmed = Buffer.alloc(tw * th * 4)
for (let y = 0; y < th; y++) data.copy(trimmed, y * tw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x1 + 1) * 4)
encode(out, { w: tw, h: th, data: trimmed })
console.log(out, tw + 'x' + th, 'background', ref.join(','))
