// node scripts/pixellab/character-sheet.cjs <out.png> <unzipped character download>...
// Each direction comes from the first download that has it, so a 4-direction character plus its 8-direction
// copy (which adds the diagonals) build one sheet. Rows south, north, east, west, south-east, south-west,
// north-east, north-west. Col 0 = standing rotation, cols 1..6 = the `walk` animation, cols 7..12 = `run`.
// A missing or unusable run leaves its columns empty (the game falls back to walking). A frame drawn facing the wrong way
// is replaced by the opposite-phase frame of the same animation, mirrored.
const { decode, encode } = require('./png.cjs'), fs = require('fs'), path = require('path')
const [out, ...downloads] = process.argv.slice(2), S = 80, FRAMES = 6
const dirs = ['south', 'north', 'east', 'west', 'south-east', 'south-west', 'north-east', 'north-west']
const states = downloads.map(dir => path.join(dir, fs.readdirSync(dir).find(f => fs.statSync(path.join(dir, f)).isDirectory())))
const first = file => states.map(state => path.join(state, file)).find(f => fs.existsSync(f))
// A replacement clip for one direction (e.g. 'run-north') takes precedence over the main clip.
const frames = (name, d) => {
  const folder = first(path.join('animations', name + '-' + d, d)) ?? first(path.join('animations', name, d))
  return folder ? fs.readdirSync(folder).sort().map(f => decode(path.join(folder, f))) : []
}
// Skin pixels on the head (the figure's top 16 rows), where a face shows; arms raised mid-run sit lower.
const skinTop = im => { let top = 0; while (top < S && ![...Array(S).keys()].some(x => im.data[(top * S + x) * 4 + 3] > 128)) top++; let n = 0; for (let y = top; y < top + 16; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, [r, g, b, a] = im.data.subarray(i, i + 4); if (a > 128 && r > 150 && r > g + 15 && g > b + 5) n++ } return n }
const flip = im => { const d = Buffer.alloc(im.data.length); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) im.data.copy(d, (y * S + S - 1 - x) * 4, (y * S + x) * 4, (y * S + x) * 4 + 4); return { ...im, data: d } }
const img = { w: S * (1 + FRAMES * 2), h: S * dirs.length, data: Buffer.alloc(S * (1 + FRAMES * 2) * S * dirs.length * 4) }
// Pixel art is fully opaque or fully clear: drop PixelLab's faint particles and specks detached from the figure
// and motion streaks: detached areas under 10 pixels, or under 80 that are mostly pale grey or white. A detached
// hand or foot is skin, shoe or outline coloured, so it stays.
const clean = im => {
  const opaque = i => im.data[i * 4 + 3] >= 128, seen = new Uint8Array(S * S)
  for (let i = 0; i < S * S; i++) if (!opaque(i)) im.data[i * 4 + 3] = 0
  for (let i = 0; i < S * S; i++) {
    if (seen[i] || !opaque(i)) continue
    const island = [i]; seen[i] = 1
    for (let k = 0; k < island.length; k++) {
      const j = island[k], x = j % S
      for (const n of [x > 0 ? j - 1 : -1, x < S - 1 ? j + 1 : -1, j - S, j + S]) if (n >= 0 && n < S * S && !seen[n] && opaque(n)) { seen[n] = 1; island.push(n) }
    }
    const pale = island.filter(j => { const [r, g, b] = im.data.subarray(j * 4, j * 4 + 3), max = Math.max(r, g, b); return max - Math.min(r, g, b) < 30 && max > 140 }).length
    if (island.length < 10 || (island.length < 80 && pale >= island.length * .7)) for (const j of island) im.data[j * 4 + 3] = 0
  }
  return im
}
const put = (im, r, c) => {
  if (im.w !== S || im.h !== S) throw new Error(`frame is ${im.w}x${im.h}, expected ${S}x${S}`)
  clean(im)
  for (let y = 0; y < S; y++) im.data.copy(img.data, ((r * S + y) * img.w + c * S) * 4, y * S * 4, (y + 1) * S * 4)
}
dirs.forEach((d, r) => {
  const rotation = first(path.join('rotations', d + '.png'))
  if (!rotation) throw new Error('no ' + d + ' rotation in any download')
  const standing = decode(rotation)
  put(standing, r, 0)
  ;['walk', 'run'].forEach((name, a) => {
    const set = frames(name, d)
    if (!set.length) return console.log(`no ${name} ${d}`)
    if (set.length !== FRAMES) throw new Error(`${name} ${d} has ${set.length} frames, expected ${FRAMES}`)
    // Some modes (skeleton-v3) draw on a larger canvas: crop to 80, centred, with one vertical offset for the
    // whole clip so its lowest foot lands where the standing pose's feet are (airborne frames keep their lift).
    if (set[0].w !== S) {
      const lowest = im => { for (let y = im.h - 1; y >= 0; y--) for (let x = 0; x < im.w; x++) if (im.data[(y * im.w + x) * 4 + 3] > 128) return y; return 0 }
      const dx = (set[0].w - S) >> 1, dy = Math.max(...set.map(lowest)) - lowest(standing)
      set.forEach((im, i) => {
        const data = Buffer.alloc(S * S * 4)
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
          const sx = x + dx, sy = y + dy
          if (sx >= 0 && sy >= 0 && sx < im.w && sy < im.h) im.data.copy(data, (y * S + x) * 4, (sy * im.w + sx) * 4, (sy * im.w + sx) * 4 + 4)
        }
        set[i] = { w: S, h: S, data }
      })
    }
    // PixelLab occasionally draws frames facing the wrong way: towards the viewer without a face, or away showing one.
    // Face-pixel counts swing with skin tone and angle, so a frame is judged against its own clip (a turned frame is
    // an outlier), and the clip as a whole against the standing pose (a fully turned clip has no outliers).
    const face = skinTop(standing), counts = set.map(skinTop)
    const median = [...counts].sort((x, y) => x - y)[FRAMES >> 1]
    const south = d.startsWith('south'), north = d.startsWith('north')
    // Most of the clip turned: mirroring can't repair it, so leave these cells empty and the game walks instead.
    // Straight views only: in a 3/4 view from behind, a swinging arm beside the head reads like a face.
    if ((d === 'south' && median < face * .1) || (d === 'north' && median > Math.max(20, face * 3)))
      return console.log(`${name} ${d}: the whole clip faces the wrong way; skipped (regenerate this clip)`)
    const wrong = (_, i) => south ? counts[i] < median * .3 : north && counts[i] > Math.max(15, median * 3 + 5)
    set.forEach((im, i) => {
      if (!wrong(im, i)) return
      const k = (i + FRAMES / 2) % FRAMES
      console.log(`${name} ${d} frame ${i} faces the wrong way; using mirrored ${k}`)
      set[i] = flip(set[k])
    })
    set.forEach((im, i) => put(im, r, 1 + a * FRAMES + i))
  })
})
encode(out, img); console.log(out, img.w + 'x' + img.h)
