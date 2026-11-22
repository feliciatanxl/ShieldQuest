import Phaser from 'phaser'
import type { Point } from '../state/saveGame'
import { depthAt, project, TILE_HEIGHT, TILE_WIDTH, type Footprint } from './isometric'
import type { MapProp } from './maps'
import { PILLAR, voidDeckLayout, type VoidDeck } from './hdbLayout'
import { BAY, BLOCK_DEPTH, blockPlan, coversCharacter, MODULE, ROOF, upperOutline, type BlockPlan } from './hdbModules'
import { box, floor, front, letterSign, side } from './worldArt'

// A walkable modular HDB block (voidDeck: true in the map), built in layers:
//   ground floor  void-deck paving just above the precinct ground
//   interior      pillars and the lift-lobby core, each depth-sorted against characters
//   upper floors  typical-floor bays, end walls and roof modules stacked from the plan in hdbModules.ts, held in one
//                 container that draws as a single opaque mass
// Characters under or behind the block sort into a narrow depth band just beneath its upper floors, in isometric
// order, so pillars overlap them naturally. Where the upper floors cover part of a character, a navy silhouette of
// that part is drawn over the building: the mask is the building itself, so only the hidden pixels show it.
// Module art here is temporary geometry drawn in code; each module is baked once into a texture shared by every block,
// and recolourable panels are a separate white layer tinted per block (the same layering the PixelLab art will use).

type Graphics = Phaser.GameObjects.Graphics
type Deck = { p: MapProp; plan: BlockPlan; top: number; outline: Point[]; silhouette: Phaser.Display.Masks.BitmapMask }
const decks = new WeakMap<Phaser.Scene, Deck[]>()
const sunlit = { pillar: ['#f3ecd8', '#efe5c9', '#cdbf9e'], core: ['#ebe3cd', '#e6d9bb', '#c4b692'] } as const

/** Depth inside the block's band: under its upper floors, in isometric order among things under or behind it. */
function interior(deck: { p: Footprint; top: number }, x: number, y: number) {
  const { p } = deck
  return deck.top - .95 + Phaser.Math.Clamp((x + y - p.x - p.y) / (p.w + p.d), 0, 1) * .9
}
const inFront = (p: Footprint, at: Point) => at.x >= p.x + p.w || at.y >= p.y + p.d
const under = (p: Footprint, at: Point) => at.x >= p.x && at.y >= p.y && !inFront(p, at)

export type Cover = { depth: number; silhouette?: { mask: Phaser.Display.Masks.BitmapMask; depth: number } }
/** Where a character at this point draws, and the silhouette to show if a block's upper floors cover part of it. */
export function coverFor(scene: Phaser.Scene, at: Point): Cover {
  const natural = depthAt(at.x, at.y)
  for (const deck of decks.get(scene) ?? []) {
    if (inFront(deck.p, at)) continue
    const covered = coversCharacter(deck.p, deck.outline, at)
    // Only ever lowered: a character under or behind a block draws beneath its upper floors.
    if (covered || under(deck.p, at)) {
      return { depth: Math.min(natural, interior(deck, at.x, at.y)), silhouette: covered ? { mask: deck.silhouette, depth: deck.top + .01 } : undefined }
    }
  }
  return { depth: natural }
}
export const depthFor = (scene: Phaser.Scene, at: Point) => coverFor(scene, at).depth

/** Draws a part once into a texture (shared by key) and places it as one image with its back corner at the footprint's
 *  origin, raised by lift pixels. */
function baked(scene: Phaser.Scene, key: string, r: Footprint, height: number, depth: number, draw: (g: Graphics, local: Footprint) => void, lift = 0) {
  const left = -r.d * TILE_WIDTH / 2 - 2, right = r.w * TILE_WIDTH / 2 + 2, top = -height - 4, bottom = (r.w + r.d) * TILE_HEIGHT / 2 + 2
  const w = Math.ceil(right - left), h = Math.ceil(bottom - top)
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({}, false)
    draw(g, { x: 0, y: 0, w: r.w, d: r.d })
    scene.textures.addDynamicTexture(key, w, h)?.draw(g, -left, -top)
    g.destroy()
  }
  const at = project(r.x, r.y)
  return scene.add.image(Math.round(at.x), Math.round(at.y - lift), key).setOrigin(-left / w, -top / h).setDepth(depth)
}

// ---- Ground floor -------------------------------------------------------------------------------------------

function groundFloor(scene: Phaser.Scene, p: MapProp, layout: VoidDeck) {
  baked(scene, `deck-floor-${p.x},${p.y},${p.w},${p.d}`, p, 0, -1999.3, (g, o) => {
    floor(g, 0, 0, o.w, o.d, '#c7c0b1')
    for (let t = .5; t < o.w; t += .5) floor(g, t, 0, .02, o.d, '#9f9888', 0, .45)
    for (let t = .5; t < o.d; t += .5) floor(g, 0, t, o.w, .02, '#9f9888', 0, .45)
    floor(g, .25, .25, o.w - .5, o.d - .5, '#3a3530', 0, .1)
    for (const r of [...layout.pillars, ...layout.cores, ...layout.walls]) floor(g, r.x - p.x - .06, r.y - p.y - .06, r.w + .2, r.d + .2, '#2b2620', 0, .18)
  })
}

function pillar(scene: Phaser.Scene, deck: { p: Footprint; top: number }, r: Footprint, deckHeight: number) {
  const spec = { w: MODULE.pillar.w, h: deckHeight + 8, anchor: { x: MODULE.pillar.anchor.x, y: deckHeight - 5 } }
  const key = moduleTexture(scene, `hdb-pillar-${deckHeight}`, spec, g => {
    const h = deckHeight - 7, w = PILLAR
    box(g, 0, 0, w, w, h, sunlit.pillar)
    front(g, 0, w, w, 0, 26, '#4f8f88')
    side(g, w, 0, w, 0, 26, '#3f746e')
    front(g, 0, w, w, 26, 2, '#2f6560')
  })
  placeModule(scene, key, spec, r, 0, false).setDepth(interior(deck, r.x + r.w, r.y + r.d))
}

function wall(scene: Phaser.Scene, deck: { p: Footprint; top: number }, r: Footprint, height: number) {
  baked(scene, `deck-wall-${r.w}-${r.d}-${height}`, r, height, interior(deck, r.x + r.w, r.y + r.d), (g, o) => box(g, 0, 0, o.w, o.d, height, sunlit.core))
}

/** The lift lobby: a solid core with lift doors and a floor indicator on its open face, letterboxes on the other. */
function core(scene: Phaser.Scene, deck: { p: Footprint; top: number }, r: Footprint, height: number, alongX: boolean, number: string) {
  baked(scene, `deck-core-${r.w}-${r.d}-${height}-${alongX}-${number}`, r, height, interior(deck, r.x + r.w, r.y + r.d), (g, c) => {
    box(g, 0, 0, c.w, c.d, height, sunlit.core)
    for (const i of [0, 1]) {
      const at = .2 + i * .72
      if (alongX) {
        front(g, at, c.d, .52, 0, 70, '#9aa3ab'); front(g, at + .25, c.d, .02, 0, 70, '#6d757e')
        front(g, at + .16, c.d, .2, 76, 5, '#2b2f36'); front(g, at + .2, c.d, .1, 77, 3, '#f2a33a')
      } else {
        side(g, c.w, at, .52, 0, 70, '#8a939b'); side(g, c.w, at + .25, .02, 0, 70, '#5f676f')
        side(g, c.w, at + .16, .2, 76, 5, '#2b2f36'); side(g, c.w, at + .2, .1, 77, 3, '#f2a33a')
      }
    }
    const span = alongX ? c.d : c.w
    for (let row = 0; row < 4; row++) for (let k = 0; k < Math.floor((span - .2) / .14); k++) {
      const colour = (row + k) % 2 ? '#c4a14a' : '#b38f3c'
      if (alongX) side(g, c.w, .1 + k * .14, .12, 14 + row * 12, 10, colour)
      else front(g, .1 + k * .14, c.d, .12, 14 + row * 12, 10, colour)
    }
    if (alongX && number) letterSign(g, number, c.w - .2 - number.length * .375, c.d, height - 24, 3, '#2f3a48')
  })
}

// ---- Upper-floor modules (temporary art, on the exact canvases PixelLab art will use) ----------------------------

type Spec = { w: number; h: number; anchor: { x: number; y: number } }
/** Bakes a module once onto its exact canvas: draw() works in grid units with the module's anchor at the origin. */
function moduleTexture(scene: Phaser.Scene, key: string, spec: Spec, draw: (g: Graphics) => void) {
  // Approved PixelLab art can replace geometry without changing anchors, collisions or stacking.
  const candidates = [`pl-modules-${key}`, `pl-modules-${key.replace(/^hdb-bay-(\d+)-[0-3]$/, 'hdb-bay-$1')}`]
  for (const candidate of candidates) {
    if (!scene.textures.exists(candidate)) continue
    const frame = scene.textures.getFrame(candidate)
    if (frame.width === spec.w && frame.height === spec.h) return candidate
  }
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({}, false)
    draw(g)
    scene.textures.addDynamicTexture(key, spec.w, spec.h)?.draw(g, spec.anchor.x, spec.anchor.y)
    g.destroy()
  }
  return key
}
/** Places a module so its anchor pixel lands on a grid point, z pixels up. Mirrored modules flip about that anchor. */
function placeModule(scene: Phaser.Scene, key: string, spec: Spec, at: Point, z: number, mirror: boolean) {
  const s = project(at.x, at.y)
  return scene.add.image(Math.round(s.x), Math.round(s.y - z), key).setFlipX(mirror)
    .setOrigin((mirror ? spec.w - spec.anchor.x : spec.anchor.x) / spec.w, spec.anchor.y / spec.h)
}
// A face turned to the lower right is in shade: mirrored modules are darkened by this much.
const SHADE = .82
const shaded = (colour: number, mirror: boolean) => {
  if (!mirror) return colour
  const c = Phaser.Display.Color.IntegerToColor(colour)
  return Phaser.Display.Color.GetColor(c.red * SHADE, c.green * SHADE, c.blue * SHADE)
}
const LIT = { wall: '#efe6cf', glass: '#3b4a5c', frame: '#cbbfa3', slab: '#a39882', ledge: '#b4b6b3' }

/** One storey of one bay, as a lit face from its anchor: two framed windows with mullions, an air-con ledge and a
 *  slab line. panel draws only the recolourable parts (edge pilaster, spandrel band) in white. */
function bayArt(g: Graphics, storey: number, panel: boolean, variant = 0, narrowBand = false) {
  const face = (t: number, len: number, z: number, h: number, c: string) => front(g, t, 0, len, z, h, c)
  const z = (k: number) => Math.round(storey * k)
  if (panel) { face(0, .14, 0, storey, '#ffffff'); face(.14, BAY - .14, 2, narrowBand ? 4 : z(.2), '#ffffff'); return }
  face(0, BAY, 0, storey, LIT.wall)
  face(0, BAY, 0, 2, LIT.slab)
  for (const t of [.3, 1.12]) {
    face(t, .58, z(.26), z(.52), LIT.frame)
    face(t + .05, .48, z(.26) + 2, z(.52) - 4, LIT.glass)
    face(t + .28, .02, z(.26) + 2, z(.52) - 4, LIT.frame)
    face(t + .06, .46, z(.54), 1, '#a5b4b4')
    // Casement reflections and occasional curtains break the perfect window repetition.
    face(t + .07, .12, z(.29), z(.42), variant === 1 ? '#c0b7a2' : '#64797f')
    if (variant === 2) face(t + .3, .21, z(.28), z(.4), '#b2afa0')
  }
  // Air-con condenser on its concrete ledge, with small grille slits and a drain pipe.
  face(.3, .49, z(.18), 3, LIT.ledge)
  face(.37, .34, z(.18) + 3, 9, '#c6c7bc')
  for (let i = 0; i < 3; i++) face(.4, .27, z(.18) + 5 + i * 2, 1, '#828e88')
  face(BAY - .12, .025, 3, storey - 5, '#c4baa4')
  // Quiet plaster wear, confined to the module so shared textures remain seamless.
  for (let i = 0; i < 10; i++) face(.22 + ((i * 17 + variant * 7) % 160) / 100, .025, 5 + (i * 13 % (storey - 10)), 2, '#d8cfbc')
}

/** One storey of the end wall, as a lit face: plain wall, small ventilation slots; panel draws the recolourable band. */
function endArt(g: Graphics, storey: number, panel: boolean) {
  const face = (u: number, len: number, z: number, h: number, c: string) => front(g, u, 0, len, z, h, c)
  if (panel) { face(BLOCK_DEPTH / 2 - .22, .44, 0, storey, '#ffffff'); return }
  face(0, BLOCK_DEPTH, 0, storey, LIT.wall)
  face(0, BLOCK_DEPTH, 0, 2, LIT.slab)
  face(.25, .16, Math.round(storey * .55), 4, LIT.glass)
  face(BLOCK_DEPTH - .41, .16, Math.round(storey * .55), 4, LIT.glass)
}

/** The roof over one bay from its back vertex: roof slab, parapet along the long side; tank adds a water tank. */
function roofArt(g: Graphics, tank: boolean) {
  floor(g, 0, 0, BAY, BLOCK_DEPTH, '#b8b9ad')
  floor(g, .1, .1, BAY - .2, BLOCK_DEPTH - .2, '#989f98')
  floor(g, .15, .15, .025, BLOCK_DEPTH - .3, '#7d8581')
  floor(g, .15, .15, BAY - .3, .025, '#c5c7bc')
  front(g, 0, BLOCK_DEPTH, BAY, 0, ROOF - 4, LIT.wall)
  front(g, 0, BLOCK_DEPTH, BAY, ROOF - 4, 2, LIT.slab)
  if (tank) box(g, BAY * .3, BLOCK_DEPTH * .25, .7, .7, 22, ['#d9dcd8', '#b9bdb8', '#9da19c'])
}

/** The block number, painted on a panel near the top of the end wall, sheared to lie on that wall. */
function numberPanel(scene: Phaser.Scene, number: string, alongX: boolean) {
  const key = `hdb-number-${number}-${alongX}`
  if (!scene.textures.exists(key)) {
    const canvas = scene.textures.createCanvas(key, 64, 64)
    if (!canvas) return key
    const ctx = canvas.context
    ctx.setTransform(1, alongX ? -.5 : .5, 0, 1, 32, 32)
    ctx.fillStyle = '#26364b'
    ctx.font = '800 13px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('BLK', 0, -9)
    ctx.font = '800 17px Outfit, sans-serif'
    ctx.fillText(number, 0, 7)
    canvas.refresh()
  }
  return key
}

/** Builds a walkable modular block in place of a flat building sprite. */
export function buildHdbBlock(scene: Phaser.Scene, p: MapProp) {
  const layout = voidDeckLayout(p), plan = blockPlan(p), { alongX, depth } = plan
  const top = depthAt(p.x, p.y + Math.min(p.w, p.d)) - .5
  const accent = Phaser.Display.Color.HexStringToColor(String(p.properties.accent ?? '#e2b85c')).color
  const upper = scene.add.container(0, 0).setDepth(top)
  const s = plan.storey, mirrorLong = !alongX, mirrorEnd = alongX
  const bay = { ...MODULE.bay, h: s + BAY * 16, anchor: { x: 0, y: s } }, end = { ...MODULE.end, h: s + BLOCK_DEPTH * 16, anchor: { x: 0, y: s } }
  const bayKeys = [0, 1, 2, 3].map(v => moduleTexture(scene, `hdb-bay-${s}-${v}`, bay, g => bayArt(g, s, false, v)))
  const generatedBay = bayKeys.every(key => key.startsWith('pl-modules-'))
  const keys = {
    bay: bayKeys,
    // Keep tintable pilasters; a thin band leaves the generated condenser/ledge unobscured.
    bayPanel: moduleTexture(scene, `hdb-bay-panel-${s}${generatedBay ? '-narrow' : ''}`, bay, g => bayArt(g, s, true, 0, generatedBay)),
    end: moduleTexture(scene, `hdb-end-${s}`, end, g => endArt(g, s, false)),
    endPanel: moduleTexture(scene, `hdb-end-panel-${s}`, end, g => endArt(g, s, true)),
    roof: moduleTexture(scene, 'hdb-roof', MODULE.roof, g => roofArt(g, false)),
    tank: moduleTexture(scene, 'hdb-roof-tank', MODULE.roof, g => roofArt(g, true)),
  }
  // Grid points the modules anchor to: the long face lies along the front of the block, the end face across its far end.
  const longAt = (t: number) => alongX ? { x: p.x + t, y: p.y + depth } : { x: p.x + depth, y: p.y + t }
  const endAt = alongX ? { x: p.x + plan.length, y: p.y } : { x: p.x, y: p.y + plan.length }
  const roofAt = (t: number) => alongX ? { x: p.x + t, y: p.y } : { x: p.x, y: p.y + t }
  for (const m of plan.modules) {
    if (m.kind === 'bay') {
      const variant = (m.t / BAY + m.storey * 3 + Number(p.properties.number ?? 0)) % keys.bay.length
      upper.add(placeModule(scene, keys.bay[variant], bay, longAt(m.t), m.z, mirrorLong).setTint(shaded(0xffffff, mirrorLong)))
      upper.add(placeModule(scene, keys.bayPanel, bay, longAt(m.t), m.z, mirrorLong).setTint(shaded(accent, mirrorLong)))
    } else if (m.kind === 'end') {
      upper.add(placeModule(scene, keys.end, end, endAt, m.z, mirrorEnd).setTint(shaded(0xffffff, mirrorEnd)))
      upper.add(placeModule(scene, keys.endPanel, end, endAt, m.z, mirrorEnd).setTint(shaded(accent, mirrorEnd)))
    } else {
      upper.add(placeModule(scene, m.t === 0 ? keys.tank : keys.roof, MODULE.roof, roofAt(m.t), m.z, mirrorLong))
    }
  }
  // Roof parapet along the end.
  const parapet = scene.add.graphics()
  if (alongX) side(parapet, p.x + p.w, p.y, p.d, plan.top - ROOF, ROOF - 4, '#d3c6a4')
  else front(parapet, p.x, p.y + p.d, p.w, plan.top - ROOF, ROOF - 4, LIT.wall)
  upper.add(parapet)
  const slab = scene.add.graphics()
  front(slab, p.x, p.y + p.d, p.w, plan.deck - 7, 7, '#d9cba8')
  side(slab, p.x + p.w, p.y, p.d, plan.deck - 7, 7, '#b7a780')
  front(slab, p.x, p.y + p.d, p.w, plan.deck - 9, 2, '#6f6550')
  upper.add(slab)
  const number = String(p.properties.number ?? '')
  if (number) {
    const panelAt = project(alongX ? p.x + p.w : p.x + p.w / 2, alongX ? p.y + p.d / 2 : p.y + p.d)
    upper.add(scene.add.image(Math.round(panelAt.x), Math.round(panelAt.y - plan.top + s * 1.6), numberPanel(scene, number, alongX)))
  }

  const deck: Deck = { p, plan, top, outline: upperOutline(p, plan), silhouette: new Phaser.Display.Masks.BitmapMask(scene, upper) }
  if (!decks.has(scene)) {
    decks.set(scene, [])
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => decks.delete(scene))
  }
  decks.get(scene)!.push(deck)

  groundFloor(scene, p, layout)
  const clear = plan.deck - 7
  layout.pillars.forEach(r => pillar(scene, deck, r, plan.deck))
  layout.walls.forEach(r => wall(scene, deck, r, clear))
  layout.cores.forEach(c => core(scene, deck, c, clear, alongX, number))
}
