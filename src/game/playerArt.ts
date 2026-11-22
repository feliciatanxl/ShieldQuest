import { categories, type Avatar, type Facing } from '../state/avatar'

/** PixelLab base bodies (one per hairstyle) recoloured and dressed at runtime. See docs/pixellab-assets.md. */
export const CELL = 80
export const WALK_FRAMES = 6
/** Sheet columns: 0 standing, 1..6 walking, 7..12 running. */
export const RUN_START = 1 + WALK_FRAMES
/** Feet sit on this row of every 80×80 cell. */
export const FEET_Y = 72

// Every base wears the same outfit so one classifier fits them all:
// white tee, navy shorts, red sneakers, black hair (teal for the tudung).
const OUTLINE = 1, SKIN = 2, HAIR = 3, TOP = 4, BOTTOM = 5, SHOE = 6, SCARF = 7
type Region = typeof OUTLINE | typeof SKIN | typeof HAIR | typeof TOP | typeof BOTTOM | typeof SHOE | typeof SCARF

// Option indices from state/avatar.ts.
const TUDUNG = 7
const POLO = 1, BLOUSE = 2, SINGLET = 3, LONG_SLEEVES = 4
const SHORTS = 1, JEANS = 2
const SLIPPERS = 1, SANDALS = 2
const SPECS = 1, ROUND = 2, SHADES = 3
const SATCHEL = 1, LANYARD = 2, CLIP = 3, CAP = 4, BUCKET = 5

const urls = import.meta.glob('./assets/characters/base-*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const sheets = new Map<number, ImageData>()
let loading: Promise<void> | undefined

/** Loads every base sheet once; resolves even if one fails, so the game still starts. */
export function loadPlayerArt(): Promise<void> {
  return loading ??= Promise.all(Object.entries(urls).map(([path, url]) => new Promise<void>(resolve => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (context) {
        context.drawImage(image, 0, 0)
        sheets.set(Number(path.match(/base-(\d+)/)![1]), context.getImageData(0, 0, image.width, image.height))
      }
      resolve()
    }
    image.onerror = () => resolve()
    image.src = url
  }))).then(() => undefined)
}

export const playerArtReady = () => sheets.size > 0

type HSL = [number, number, number]
function toHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min, s = l > .5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}
function fromHsl([h, s, l]: HSL): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l)
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))))
  return [f(0), f(8), f(4)]
}
const hexHsl = (hex: string) => toHsl(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16))
const lighten = (hex: string, amount: number): HSL => { const [h, s, l] = hexHsl(hex); return [h, s, l + (1 - l) * amount] }

/** Labels each pixel by what it depicts, from its colour and height on the figure.
 *  Thresholds come from the palettes of all eight bases: whites are judged by RGB chroma because HSL saturation
 *  is unstable near white, and red sneakers are more saturated and darker than the reddest skin shadows. */
function classify(data: Uint8ClampedArray, top: number, height: number, tudung: boolean) {
  const regions = new Uint8Array(CELL * CELL)
  for (let i = 0; i < regions.length; i++) {
    if (data[i * 4 + 3] < 128) continue
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]
    const [h, s, l] = toHsl(r, g, b)
    const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255
    const at = (Math.floor(i / CELL) - top) / height
    regions[i] = l < .07 ? OUTLINE
      // Only the tudung base has a teal scarf; elsewhere teal-ish pixels are highlights on black hair.
      : tudung && h >= 160 && h <= 200 && s > .2 ? SCARF
      : h >= 200 && h <= 260 && s >= .12 && l < .5 && at > .5 ? BOTTOM
      : (h >= 338 || h <= 2) && s >= .42 && l < .6 && at > .7 ? SHOE
      : (h >= 350 || h <= 40) && s >= .15 && l >= .28 && l <= .93 && chroma >= .1 ? SKIN
      : chroma < .1 && l >= .38 && at > .3 && at < .78 ? TOP
      : s < .25 && l < .4 && at < .62 ? HAIR
      : 0
  }
  for (let i = CELL; i < regions.length - CELL; i++) {
    if ((Math.floor(i / CELL) - top) / height >= .62) continue
    const around = [i - 1, i + 1, i - CELL, i + CELL, i - CELL - 1, i - CELL + 1, i + CELL - 1, i + CELL + 1]
    // Some bases fill hair with near-black; a dark pixel inside the hair (touching hair, no skin or edge) is hair, not outline.
    if (regions[i] === OUTLINE && around.some(j => regions[j] === HAIR) && around.every(j => data[j * 4 + 3] >= 128 && regions[j] !== SKIN)) regions[i] = HAIR
    // A grey sheen on a ponytail hanging over the shirt reads as shirt; mostly surrounded by hair, it is hair.
    else if (regions[i] === TOP && around.filter(j => regions[j] === HAIR || regions[j] === OUTLINE).length >= 4) regions[i] = HAIR
  }
  return regions
}

/** Maps a shade onto a new base colour, keeping how much lighter or darker it was than the region's main shade.
 *  Shadows scale in RGB, which keeps their hue instead of oversaturating like an HSL lightness shift.
 *  Highlights above a near-white main shade are damped, or a white tee's sheen would turn the new colour white.
 *  Shadows bottom out at 40%: some bases draw hair mass in near-black, which would hide a light hair colour. */
function ramp(l: number, reference: number, target: number[]) {
  return target.map(c => Math.round(l <= reference ? c * Math.max(.4, l / reference) : c + (255 - c) * Math.min(1, (l - reference) / Math.max(.15, 1 - reference))))
}

function bounds(regions: Uint8Array, region: Region) {
  let minX = CELL, maxX = -1, minY = CELL, maxY = -1
  for (let i = 0; i < regions.length; i++) if (regions[i] === region) {
    const x = i % CELL, y = Math.floor(i / CELL)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  return maxX < 0 ? null : { minX, maxX, minY, maxY }
}

/** Reshapes garments by relabelling pixels: long pants, sleeves, singlets and open footwear. */
function restyle(regions: Uint8Array, avatar: Avatar, side: boolean) {
  const at = (x: number, y: number) => y * CELL + x
  const top = bounds(regions, TOP)
  if (avatar.bottomStyle !== SHORTS) {
    for (let x = 0; x < CELL; x++) {
      let hem = -1
      for (let y = 0; y < CELL; y++) if (regions[at(x, y)] === BOTTOM) hem = y
      if (hem >= 0) for (let y = hem + 1; y < CELL; y++) if (regions[at(x, y)] === SKIN) regions[at(x, y)] = BOTTOM
    }
  }
  if (top) {
    // At the waist the shirt covers only the torso, so anything wider above it is a sleeve or an arm.
    // The hem row can be only a pixel or two wide, so take the widest of the last few rows.
    // Stray light pixels (a highlight on a hand) are ignored by only counting rows that are at least 4 pixels of shirt.
    let waistMin = CELL, waistMax = -1, rows = 0
    for (let y = top.maxY; y >= top.minY && rows < 4; y--) {
      let min = CELL, max = -1, count = 0
      for (let x = 0; x < CELL; x++) if (regions[at(x, y)] === TOP) { min = Math.min(min, x); max = Math.max(max, x); count++ }
      if (count < 4) continue
      rows++
      if (max - min > waistMax - waistMin) { waistMin = min; waistMax = max }
    }
    const arm = (x: number) => side || x < waistMin || x > waistMax
    if (avatar.topStyle === SINGLET && !side) {
      for (let i = 0; i < regions.length; i++) if (regions[i] === TOP && arm(i % CELL)) regions[i] = SKIN
    }
    if (avatar.topStyle === LONG_SLEEVES) {
      for (let x = 0; x < CELL; x++) {
        if (!arm(x)) continue
        let hand = -1
        for (let y = top.minY; y < CELL; y++) if (regions[at(x, y)] === SKIN && y < top.maxY + 8) hand = y
        for (let y = top.minY + 1; y < Math.min(hand - 2, top.maxY + 3); y++) if (regions[at(x, y)] === SKIN) regions[at(x, y)] = TOP
      }
    }
  }
  if (avatar.shoeStyle === SLIPPERS || avatar.shoeStyle === SANDALS) {
    const shoe = bounds(regions, SHOE)
    if (shoe) {
      const strap = shoe.maxY - 2
      for (let y = shoe.minY; y < shoe.maxY - 1; y++) for (let x = shoe.minX; x <= shoe.maxX; x++) {
        if (regions[at(x, y)] === SHOE && !(avatar.shoeStyle === SANDALS && y === strap)) regions[at(x, y)] = SKIN
      }
    }
  }
}

/** Centres of the short dark gaps in the skin along one row: eyes, brows or a mouth.
 *  Lashes read as hair, so a gap counts when it holds at least one non-hair pixel (iris or outline):
 *  that keeps fringe strands over the forehead from passing as eyes. */
function skinGaps(data: Uint8ClampedArray, regions: Uint8Array, y: number) {
  const opaque = (i: number) => data[i * 4 + 3] > 128
  const gaps: number[] = []
  let x = 1
  while (x < CELL) {
    const i = y * CELL + x
    if (regions[i - 1] === SKIN && regions[i] !== SKIN && opaque(i)) {
      let end = x, iris = false, darkest = 1
      while (end < CELL && regions[y * CELL + end] !== SKIN && opaque(y * CELL + end)) {
        const j = (y * CELL + end) * 4
        iris ||= regions[y * CELL + end] !== HAIR && regions[y * CELL + end] !== SCARF
        darkest = Math.min(darkest, toHsl(data[j], data[j + 1], data[j + 2])[2])
        end++
      }
      if (end - x <= 4 && iris && darkest < .5 && regions[y * CELL + end] === SKIN) gaps.push((x + end - 1) / 2)
      x = end
    } else x++
  }
  return gaps
}

// Sheet rows: south, north, east, west, south-east, south-west, north-east, north-west.
const rows: Record<Facing, number> = { front: 0, back: 1, right: 2, left: 3, 'front-right': 4, 'front-left': 5, 'back-right': 6, 'back-left': 7 }
/** The row for a facing; sheets without diagonals use the nearest front or back view, and without west, mirrored east. */
function sheetRow(sheet: ImageData, facing: Facing) {
  const row = rows[facing], available = sheet.height / CELL
  if (row < available) return row
  if (row >= 4) return row < 6 ? 0 : 1
  return 2
}

function mirror(data: Uint8ClampedArray) {
  const out = new Uint8ClampedArray(data.length)
  for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) out.set(data.subarray((y * CELL + x) * 4, (y * CELL + x) * 4 + 4), (y * CELL + CELL - 1 - x) * 4)
  return out
}

/** One cell's pixels and the rows its figure spans. */
function cellOf(sheet: ImageData, row: number, col: number) {
  const data = new Uint8ClampedArray(CELL * CELL * 4)
  for (let y = 0; y < CELL; y++) {
    const from = ((row * CELL + y) * sheet.width + col * CELL) * 4
    data.set(sheet.data.subarray(from, from + CELL * 4), y * CELL * 4)
  }
  let top = CELL, bottom = 0
  for (let i = 0; i < CELL * CELL; i++) if (data[i * 4 + 3] >= 128) { top = Math.min(top, Math.floor(i / CELL)); bottom = Math.floor(i / CELL) }
  return { data, top, bottom }
}

/** Rows from the top of the head down to the eyes, measured once per base on its standing front view.
 *  Brows also show as two gaps, and sit above the eyes, so the last band of rows with two or more gaps is the eyes. */
const eyeLines = new Map<ImageData, number>()
function eyeLine(sheet: ImageData, tudung: boolean) {
  let line = eyeLines.get(sheet)
  if (line === undefined) {
    const { data, top, bottom } = cellOf(sheet, 0, 0)
    const regions = classify(data, top, bottom - top + 1, tudung)
    let start = -1, end = -1
    for (let y = top + 4; y < top + 24; y++) if (skinGaps(data, regions, y).length >= 2) { if (y !== end + 1) start = y; end = y }
    line = end < 0 ? 13 : Math.round((start + end) / 2) - top
    eyeLines.set(sheet, line)
  }
  return line
}

/** Where glasses go on this frame: the eye row and lens centres (one in profile, on the face's front edge). */
function findEyes(data: Uint8ClampedArray, regions: Uint8Array, y: number, side: boolean) {
  let min = CELL, max = -1
  for (let x = 0; x < CELL; x++) if (regions[y * CELL + x] === SKIN) { min = Math.min(min, x); max = Math.max(max, x) }
  if (max < 0) return null
  if (side) return { y, eyes: [max - 3] }
  // The gap nearest the middle of the face on each side; stray gaps (an ear, a hair strand) sit further out.
  const centre = (min + max) / 2, gaps = skinGaps(data, regions, y)
  const left = Math.max(...gaps.filter(x => x < centre)), right = Math.min(...gaps.filter(x => x > centre))
  return { y, eyes: [Number.isFinite(left) ? left : min + (max - min) * .3, Number.isFinite(right) ? right : min + (max - min) * .7] }
}

/** The most common shade of each region is its "main" colour; other shades are highlights or shadows of it.
 *  Measured once per base on its standing front view so every frame maps colours the same way: a run frame
 *  with the shirt mostly in shadow would otherwise treat the true white as a highlight and leave it white. */
const shadeCache = new Map<ImageData, Map<number, number>>()
function mainShades(sheet: ImageData, tudung: boolean) {
  let references = shadeCache.get(sheet)
  if (references) return references
  references = new Map<number, number>()
  const { data, top, bottom } = cellOf(sheet, 0, 0)
  const regions = classify(data, top, bottom - top + 1, tudung)
  for (const region of [SKIN, HAIR, TOP, BOTTOM, SHOE, SCARF]) {
    const counts = new Map<number, number>()
    for (let i = 0; i < regions.length; i++) if (regions[i] === region) {
      const l = Math.round(toHsl(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])[2] * 100)
      counts.set(l, (counts.get(l) ?? 0) + 1)
    }
    let best = 0, reference = .5
    for (const [l, n] of counts) if (n > best) { best = n; reference = l / 100 }
    references.set(region, reference)
  }
  shadeCache.set(sheet, references)
  return references
}

const cache = new Map<string, ImageData>()

/** Renders one 80×80 cell: base = hairstyle, row from facing, frame 0 standing or 1..6 walking. Returns false until art loads. */
export function renderPlayer(avatar: Avatar, facing: Facing, frame: number): ImageData | null {
  const sheet = sheets.get(avatar.style) ?? sheets.get(4) ?? sheets.values().next().value
  if (!sheet) return null
  const row = sheetRow(sheet, facing)
  let col = Math.min(frame, sheet.width / CELL - 1)
  const key = [...Object.values(avatar), facing, col].join(',')
  const hit = cache.get(key)
  if (hit) return hit

  let cell = cellOf(sheet, row, col)
  // A direction without a run cycle falls back to the matching walk frame.
  if (cell.top === CELL && col >= RUN_START) cell = cellOf(sheet, row, col -= WALK_FRAMES)
  // West art is processed as if it faced east so the profile rules (eye, cap brim, bag) apply, then flipped back.
  const data = row === 3 ? mirror(cell.data) : cell.data
  const { top, bottom } = cell
  // Front diagonals show the face like the front view; back diagonals show the back of the head.
  const side = row === 2 || row === 3, back = row === 1 || row >= 6
  const tudung = avatar.style === TUDUNG
  const regions = classify(data, top, bottom - top + 1, tudung)
  const eyes = back ? null : findEyes(data, regions, top + eyeLine(sheet, tudung), side)
  const drawnAs = regions.slice()
  restyle(regions, avatar, side)

  const colour = (category: 'skin' | 'hair' | 'top' | 'bottom' | 'shoes') => hexHsl(categories[category].options[avatar[category]][1])
  const targets: Partial<Record<Region, HSL>> = {
    [SKIN]: colour('skin'), [HAIR]: colour('hair'), [TOP]: colour('top'), [BOTTOM]: colour('bottom'), [SHOE]: colour('shoes'),
    [SCARF]: lighten(categories.top.options[avatar.top][1], .3),
  }
  const references = mainShades(sheet, tudung)
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i] as Region
    const target = targets[region]
    if (!target) continue
    const l = toHsl(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])[2]
    // A relabelled pixel (pants over legs, a singlet's bare arm) is shaded against what it was drawn as.
    const reference = references.get(drawnAs[i]) ?? references.get(region)!
    const [r, g, b] = ramp(l, reference, fromHsl(target))
    data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b
  }

  const shade = [36, 43, 57]
  const put = (x: number, y: number, [r, g, b]: number[], a = 255) => {
    if (x < 0 || y < 0 || x >= CELL || y >= CELL) return
    const i = (y * CELL + x) * 4
    data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a
  }
  const fill = (x: number, y: number, w: number, h: number, c: number[]) => { for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) put(x + k, y + j, c) }
  const box = (x: number, y: number, w: number, h: number, c: number[]) => { fill(x, y, w, h, shade); fill(x + 1, y + 1, w - 2, h - 2, c) }
  const rgb = (hsl: HSL) => fromHsl(hsl)
  const topBox = bounds(regions, TOP)

  // Collars
  if (topBox && !side && (avatar.topStyle === POLO || avatar.topStyle === BLOUSE)) {
    const mid = Math.round((topBox.minX + topBox.maxX) / 2)
    const collar = avatar.topStyle === BLOUSE ? [255, 250, 240] : rgb(lighten(categories.top.options[avatar.top][1], .45))
    fill(mid - 4, topBox.minY, 3, 2, collar)
    fill(mid + 1, topBox.minY, 3, 2, collar)
    if (avatar.topStyle === POLO && !back) fill(mid - 1, topBox.minY + 2, 1, 3, shade)
  }
  if (avatar.bottomStyle === JEANS) {
    for (let i = 0; i < regions.length; i++) if (regions[i] === BOTTOM && i % CELL % 4 === 0 && (Math.floor(i / CELL) & 1)) {
      data[i * 4] = Math.min(255, data[i * 4] + 28); data[i * 4 + 1] = Math.min(255, data[i * 4 + 1] + 28); data[i * 4 + 2] = Math.min(255, data[i * 4 + 2] + 28)
    }
  }
  // Accessories
  if (topBox && avatar.accessory === LANYARD && !back) {
    const mid = Math.round((topBox.minX + topBox.maxX) / 2) + (side ? 2 : 0)
    const blue = [59, 111, 182]
    for (let y = topBox.minY; y < topBox.minY + 7; y++) { put(mid - 3 + (side ? 2 : 0), y, blue); if (!side) put(mid + 2, y, blue) }
    box(mid - 3, topBox.minY + 6, 6, 6, [244, 241, 234])
    fill(mid - 1, topBox.minY + 8, 2, 1, blue)
  }
  if (topBox && avatar.accessory === SATCHEL) {
    const strap = [239, 212, 154], bag = [190, 121, 83]
    const height = topBox.maxY - topBox.minY
    if (!side) for (let k = 0; k <= height; k++) put(back ? topBox.maxX - 2 - Math.round(k * (topBox.maxX - topBox.minX - 4) / height) : topBox.minX + 2 + Math.round(k * (topBox.maxX - topBox.minX - 4) / height), topBox.minY + k, strap)
    // In profile a swinging arm stretches the shirt's box, so anchor the strap to the shoulders and draw it only on the shirt.
    let shoulder = 0, count = 0
    if (side) for (let y = topBox.minY; y < topBox.minY + 3; y++) for (let x = 0; x < CELL; x++) if (regions[y * CELL + x] === TOP) { shoulder += x; count++ }
    const torso = count ? Math.round(shoulder / count) : topBox.minX + 2
    if (side) for (let y = topBox.minY; y <= topBox.maxY; y++) if (regions[y * CELL + torso] === TOP) put(torso, y, strap)
    const bx = side ? torso - 6 : back ? topBox.minX - 3 : topBox.maxX - 2
    box(bx, topBox.maxY - 2, 7, 6, bag)
    put(bx + 3, topBox.maxY, [249, 215, 117])
  }
  // Glasses sit on the detected eye row.
  if (eyes && avatar.glasses) {
    const lenses = eyes.eyes.map(Math.round)
    for (const x of lenses) {
      if (avatar.glasses === SHADES) fill(x - 2, eyes.y - 1, 5, 3, [29, 34, 48])
      else if (avatar.glasses === ROUND) { fill(x - 1, eyes.y - 2, 3, 1, shade); fill(x - 1, eyes.y + 2, 3, 1, shade); fill(x - 2, eyes.y - 1, 1, 3, shade); fill(x + 2, eyes.y - 1, 1, 3, shade) }
      else if (avatar.glasses === SPECS) { fill(x - 2, eyes.y - 2, 5, 1, shade); fill(x - 2, eyes.y + 1, 5, 1, shade); fill(x - 2, eyes.y - 1, 1, 2, shade); fill(x + 2, eyes.y - 1, 1, 2, shade) }
    }
    if (avatar.glasses === SHADES) for (const x of lenses) put(x - 1, eyes.y - 1, [255, 255, 255], 140)
    if (lenses.length > 1) fill(lenses[0] + 3, eyes.y - 1, Math.max(0, lenses[1] - lenses[0] - 5), 1, avatar.glasses === SHADES ? [29, 34, 48] : shade)
    else fill(lenses[0] - 6, eyes.y - 1, 4, 1, shade) // temple arm toward the ear
  }
  // Headwear covers the crown down to the forehead, a few rows above the eyes; a tudung already covers it.
  if (avatar.style !== TUDUNG && (avatar.accessory === CAP || avatar.accessory === BUCKET || avatar.accessory === CLIP)) {
    let minX = CELL, maxX = -1
    for (let y = top; y < top + 8; y++) for (let x = 0; x < CELL; x++) if (data[(y * CELL + x) * 4 + 3] >= 128) { minX = Math.min(minX, x); maxX = Math.max(maxX, x) }
    const brim = top + Math.max(4, eyeLine(sheet, tudung) - 5)
    // A ponytail or bun widens the silhouette; keep hats head-sized, centred on the face where there is one.
    if (maxX - minX > 18) {
      const centre = eyes ? Math.round((eyes.eyes[0] + eyes.eyes[eyes.eyes.length - 1]) / 2) - (side ? 4 : 0) : Math.round((minX + maxX) / 2)
      minX = centre - 9
      maxX = centre + 9
    }
    // A rounded crown: the top rows are inset so the hat follows the head instead of reading as a box.
    const dome = (from: number, inset: number, colour: number[], shine: number[]) => {
      for (let y = from; y < brim; y++) {
        const indent = Math.max(0, inset - (y - from) * 2)
        fill(minX + indent, y, maxX - minX + 1 - indent * 2, 1, y === from || indent ? shade : colour)
        if (y > from) { put(minX + indent, y, shade); put(maxX - indent, y, shade); if (!indent) fill(minX + 1, y, maxX - minX - 1, 1, colour) }
      }
      fill(minX + 3, from + 2, 4, 1, shine)
    }
    if (avatar.accessory === CLIP) { if (!back) box(side ? minX + 2 : maxX - 5, top + 4, 4, 3, [255, 212, 124]) }
    else if (avatar.accessory === CAP) {
      dome(Math.max(top - 1, brim - 8), 3, [201, 84, 74], [226, 135, 126])
      if (!back) box(side ? maxX - 4 : minX + 2, brim - 1, side ? 9 : maxX - minX - 3, 3, [158, 58, 51])
    } else {
      dome(Math.max(top - 2, brim - 9), 3, [214, 196, 150], [232, 220, 186])
      box(minX - 2, brim - 1, maxX - minX + 5, 3, [189, 168, 120])
    }
  }

  const image = new ImageData(facing === 'left' ? mirror(data) : data, CELL, CELL)
  if (cache.size > 400) cache.clear()
  cache.set(key, image)
  return image
}

/** Draws a rendered cell onto a canvas. */
export function drawPlayer(context: CanvasRenderingContext2D, avatar: Avatar, facing: Facing, frame: number, dx = 0, dy = 0) {
  const image = renderPlayer(avatar, facing, frame)
  if (!image) return false
  scratch.width = CELL
  scratch.height = CELL
  scratch.getContext('2d')!.putImageData(image, 0, 0)
  context.drawImage(scratch, dx, dy)
  return true
}
const scratch = typeof document === 'undefined' ? ({} as HTMLCanvasElement) : document.createElement('canvas')
