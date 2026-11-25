import type Phaser from 'phaser'
import type { Footprint } from './isometric'
import type { WorldLayout } from './world'
import { box, floor, front, letterSign, planter, poly, prop, side } from './worldArt'
import { HOUSE_I_SIZE } from './locations'
import { recordGraphics } from './pixelBake'
import { houseICollisions, houseIFurniture, houseIObjects } from './houseILayout'

type Graphics = Phaser.GameObjects.Graphics

export function createHouseI(scene: Phaser.Scene): WorldLayout {
  const g = recordGraphics(scene, -1000)
  const { x: w, y: d } = HOUSE_I_SIZE

  // Foundation & floor drop shadow
  floor(g, -0.05, 0.2, w + 0.5, d + 0.2, '#0c1014', -8)
  box(g, -0.08, -0.08, w + 0.16, d + 0.16, 12, ['#453224', '#2c1f16', '#1c130d'], -12)

  // Warm amber / golden parquet wood tile floor
  const parquetTiles = ['#d8a876', '#cca06e', '#dfb07e', '#c49767']
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < d; y++) {
      floor(g, x, y, 1, 1, parquetTiles[(x + y) % 4])
      floor(g, x, y, 1, 0.03, '#8e6943', 0, 0.4)
      floor(g, x, y, 0.03, 1, '#8e6943', 0, 0.4)
    }
  }

  // Back wall (North) & Left wall (West)
  box(g, -0.08, -0.12, w + 0.14, 0.26, 84, ['#ede6d8', '#cfc4b0', '#9c927f'])
  box(g, -0.08, 0.14, 0.24, d - 0.10, 84, ['#e2dac9', '#b8ac97', '#877c68'])

  // Wall wainscoting
  front(g, 0.14, 0.14, w - 0.28, 5, 8, '#593922')
  side(g, 0.14, 0.14, d - 0.28, 5, 8, '#452b19')
  front(g, 0.14, 0.14, w - 0.28, 58, 4, '#f5ede0')
  side(g, 0.14, 0.14, d - 0.28, 58, 4, '#e5dccf')

  // Top Wall Sign: "IDENTIFY THE INFLUENCE"
  front(g, 2.8, 0.14, 5.4, 44, 15, '#472818')
  letterSign(g, 'IDENTIFY THE INFLUENCE', 3.0, 0.14, 48, 1.4, '#ffd875')

  // Large Investigative Corkboard on the wall
  front(g, 1.2, 0.14, 3.2, 28, 22, '#422818')
  front(g, 1.3, 0.14, 3.0, 29, 20, '#b88958')
  // Pinned clue cards & string
  front(g, 1.6, 0.14, 0.6, 32, 6, '#fff8ed')
  front(g, 2.6, 0.14, 0.6, 35, 6, '#fff8ed')
  front(g, 3.4, 0.14, 0.6, 33, 6, '#fae8e6')
  letterSign(g, 'INFLUENCE MAP', 1.8, 0.14, 42, 0.8, '#ffe7ba')

  // Whisper Network floor deduction station marker
  floor(g, 4.5, 2.2, 2.0, 2.0, '#d8892d', 0, 0.35)
  floor(g, 4.8, 2.5, 1.4, 1.4, '#f0c76e', 0, 0.45)
  floor(g, 5.2, 2.9, 0.6, 0.6, '#fff8ed', 0, 0.8)

  // Exit doorway & mat
  floor(g, 4.7, 6.7, 1.6, 1.0, '#301f14')
  floor(g, 4.9, 6.85, 1.2, 0.7, '#63422d')
  for (let i = 0; i < 6; i++) {
    floor(g, 5.0 + i * 0.18, 6.95, 0.06, 0.5, '#e0a96d')
  }

  // Draw Furniture
  for (const f of houseIFurniture) {
    if (f.kind === 'plant') {
      planter(g, f.x, f.y, f.w)
    } else if (f.kind === 'table') {
      box(g, f.x, f.y, f.w, f.d, 22, ['#614532', '#473224', '#312218'])
      // Documents & magnifier on table
      box(g, f.x + 0.3, f.y + 0.2, 0.8, 0.6, 2, ['#fff8ed', '#dac8b2', '#baaa95'], 22)
      box(g, f.x + 1.4, f.y + 0.25, 0.9, 0.5, 3, ['#eedab8', '#c9b391', '#a69272'], 22)
    } else if (f.kind === 'desk') {
      box(g, f.x, f.y, f.w, f.d, 22, ['#573d2b', '#3d2a1d', '#291b12'])
      // Audio transcript terminal
      box(g, f.x + 0.4, f.y + 0.2, 0.9, 0.35, 15, ['#788491', '#4d5761', '#333b42'], 22)
      box(g, f.x + 0.5, f.y + 0.22, 0.7, 0.08, 10, ['#e09c3d', '#a36d24', '#6e4713'], 24)
      // Reel-to-reel tape recorder
      box(g, f.x + 1.5, f.y + 0.3, 0.6, 0.4, 6, ['#3d4752', '#283038', '#1b2126'], 22)
    } else if (f.kind === 'chair') {
      box(g, f.x, f.y, f.w, f.d, 12, ['#66432b', '#472d1c', '#2e1c10'])
      box(g, f.x, f.y + f.d - 0.1, f.w, 0.1, 16, ['#7d5337', '#543723', '#382315'], 12)
    } else if (f.kind === 'files') {
      box(g, f.x, f.y, f.w, f.d, 36, ['#596470', '#3e4752', '#293038'])
      for (let l = 6; l < 32; l += 8) {
        box(g, f.x + 0.05, f.y + f.d - 0.08, f.w - 0.1, 0.08, 6, ['#6f7b87', '#505a63', '#373f47'], l)
      }
    } else if (f.kind === 'sofa') {
      box(g, f.x, f.y, f.w, f.d, 16, ['#824e38', '#5e3625', '#422418'])
      box(g, f.x, f.y, f.w, 0.3, 22, ['#965c43', '#6e402d', '#4d2b1d'], 16)
    } else if (f.kind === 'coffee') {
      box(g, f.x, f.y, f.w, f.d, 12, ['#543b2b', '#3b281c', '#261910'])
    }
  }

  return {
    hotspots: houseIObjects,
    collisions: houseICollisions,
    size: HOUSE_I_SIZE,
  }
}
