import type Phaser from 'phaser'
import type { Footprint } from './isometric'
import type { WorldLayout } from './world'
import { box, floor, front, letterSign, planter, poly, prop, side } from './worldArt'
import { HOUSE_H_SIZE } from './locations'
import { houseHCollisions, houseHFurniture, houseHObjects } from './houseHLayout'

type Graphics = Phaser.GameObjects.Graphics

export function createHouseH(scene: Phaser.Scene): WorldLayout {
  const g = scene.add.graphics().setDepth(-1000)
  const { x: w, y: d } = HOUSE_H_SIZE

  // Foundation & floor drop shadow
  floor(g, -0.05, 0.2, w + 0.5, d + 0.2, '#0c141c', -8)
  box(g, -0.08, -0.08, w + 0.16, d + 0.16, 12, ['#2d4a48', '#1a3130', '#122221'], -12)

  // Teal acoustic carpet tile floor
  const floorTiles = ['#224340', '#1c3936', '#254a47', '#1f3e3b']
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < d; y++) {
      floor(g, x, y, 1, 1, floorTiles[(x + y) % 4])
      floor(g, x, y, 1, 0.03, '#142a28', 0, 0.4)
      floor(g, x, y, 0.03, 1, '#142a28', 0, 0.4)
    }
  }

  // Back wall (North) & Left wall (West)
  box(g, -0.08, -0.12, w + 0.14, 0.26, 84, ['#e5eae6', '#c6d4cc', '#94aca0'])
  box(g, -0.08, 0.14, 0.24, d - 0.10, 84, ['#dce3de', '#b0c2b7', '#7d968a'])

  // Wall wainscoting
  front(g, 0.14, 0.14, w - 0.28, 5, 8, '#264845')
  side(g, 0.14, 0.14, d - 0.28, 5, 8, '#1d3936')
  front(g, 0.14, 0.14, w - 0.28, 58, 4, '#eaf2ee')
  side(g, 0.14, 0.14, d - 0.28, 58, 4, '#d8e5df')

  // Top Wall Sign: "HOLD BEFORE ACTING"
  front(g, 2.6, 0.14, 4.8, 44, 15, '#173633')
  letterSign(g, 'HOLD BEFORE ACTING', 2.8, 0.14, 48, 1.4, '#ffd875')

  // Surveillance monitor & bulletin on back wall
  front(g, 7.6, 0.14, 1.8, 28, 20, '#102422')
  front(g, 7.7, 0.14, 1.6, 30, 16, '#286b64')
  letterSign(g, 'CCTV CAM 01', 7.8, 0.14, 38, 0.7, '#c2f0e8')

  // Freeze Frame floor observation station marker
  floor(g, 4.0, 2.2, 2.0, 2.0, '#3fa89b', 0, 0.35)
  floor(g, 4.3, 2.5, 1.4, 1.4, '#ffd875', 0, 0.45)
  floor(g, 4.7, 2.9, 0.6, 0.6, '#fff8ed', 0, 0.8)

  // Exit doorway & mat
  floor(g, 4.2, 6.7, 1.6, 1.0, '#162e2c')
  floor(g, 4.4, 6.85, 1.2, 0.7, '#2f5b57')
  for (let i = 0; i < 6; i++) {
    floor(g, 4.5 + i * 0.18, 6.95, 0.06, 0.5, '#78c7ad')
  }

  // Draw Furniture
  for (const f of houseHFurniture) {
    if (f.kind === 'plant') {
      planter(g, f.x, f.y, f.w)
    } else if (f.kind === 'desk') {
      box(g, f.x, f.y, f.w, f.d, 22, ['#543d2c', '#3d2b1f', '#2c1e16'])
      // Computer monitor
      box(g, f.x + 0.4, f.y + 0.2, 0.8, 0.3, 14, ['#8291a0', '#556573', '#394652'], 22)
      box(g, f.x + 0.5, f.y + 0.22, 0.6, 0.08, 10, ['#299c91', '#1f7069', '#154e49'], 24)
      // Keyboard
      box(g, f.x + 0.45, f.y + 0.65, 0.7, 0.25, 2, ['#98a6b5', '#6b7987', '#4b5561'], 22)
    } else if (f.kind === 'chair') {
      box(g, f.x, f.y, f.w, f.d, 12, ['#385a57', '#253e3c', '#1b2d2b'])
      box(g, f.x, f.y + f.d - 0.1, f.w, 0.1, 16, ['#436c69', '#2d4947', '#203432'], 12)
    } else if (f.kind === 'books') {
      box(g, f.x, f.y, f.w, f.d, 48, ['#4a3424', '#342419', '#241912'])
      for (let lvl = 8; lvl < 42; lvl += 10) {
        box(g, f.x + 0.05, f.y + 0.05, f.w - 0.1, f.d - 0.1, 2, ['#614530', '#473223', '#312318'], lvl)
        box(g, f.x + 0.15, f.y + 0.1, 0.8, 0.3, 7, ['#299c91', '#8a4b38', '#d4a24e'], lvl + 2)
      }
    } else if (f.kind === 'table') {
      box(g, f.x, f.y, f.w, f.d, 20, ['#453830', '#302621', '#211a16'])
      box(g, f.x + 0.2, f.y + 0.2, 0.6, 0.5, 3, ['#e2d9c8', '#baaf9e', '#948a7b'], 20)
    } else if (f.kind === 'bench') {
      box(g, f.x, f.y, f.w, f.d, 14, ['#576657', '#3c473c', '#293029'])
    }
  }

  return {
    hotspots: houseHObjects,
    collisions: houseHCollisions,
    size: HOUSE_H_SIZE,
  }
}
