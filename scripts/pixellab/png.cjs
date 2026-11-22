// Minimal RGBA PNG decode/encode (8-bit, non-interlaced; colour types 6, 2 and 3).
const zlib = require('zlib'), fs = require('fs')
function decode(file) {
  const b = fs.readFileSync(file); let o = 8, w, h, ct, idat = [], plte, trns
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len)
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error('unsupported ' + file) }
    else if (type === 'PLTE') plte = d; else if (type === 'tRNS') trns = d; else if (type === 'IDAT') idat.push(d)
    o += 12 + len
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : ct === 2 ? 3 : 1, stride = w * bpp
  const px = Buffer.alloc(w * h * bpp)
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, up = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0
      let v = line[x]
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1
      else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c }
      px[y * stride + x] = v & 255
    }
  }
  const out = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    if (ct === 6) px.copy(out, i * 4, i * 4, i * 4 + 4)
    else if (ct === 2) { px.copy(out, i * 4, i * 3, i * 3 + 3); out[i * 4 + 3] = 255 }
    else { const k = px[i]; plte.copy(out, i * 4, k * 3, k * 3 + 3); out[i * 4 + 3] = trns && k < trns.length ? trns[k] : 255 }
  }
  return { w, h, data: out }
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = b => { let c = ~0; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (~c) >>> 0 }
function chunk(type, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(type), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]) }
function encode(file, { w, h, data }) {
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6
  const raw = Buffer.alloc(h * (w * 4 + 1)); for (let y = 0; y < h; y++) data.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]))
}
module.exports = { decode, encode }
