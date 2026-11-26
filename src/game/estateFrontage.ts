import type Phaser from 'phaser'
import type { Footprint } from './isometric'
import { project } from './isometric'
import { box, floor, front, letterSign, poly, prop, side } from './worldArt'

type Graphics = Phaser.GameObjects.Graphics

const ink = '#4a4037'

export function minimartFront(g: Graphics, { x, y, w, d }: Footprint) {
  const face = y + d
  box(g, x, y, w, d, 202, ['#cfc1a3', '#ebd9b5', '#b49e80'])
  front(g, x, face, w, 0, 49, '#948473')
  for (let level = 0; level < 4; level++) {
    const z = 57 + level * 32
    for (let bay = 0; bay < 4; bay++) {
      const width = w / 4 - .15
      const px = x + .08 + bay * w / 4
      const color = (bay + level) % 3 === 0 ? '#bd7956' : '#517c8d'
      front(g, px, face, width, z, 28, ink)
      front(g, px + .04, face, width - .08, z + 1, 25, color)
      front(g, px + .12, face, width - .24, z + 10, 15, '#504c43')
      front(g, px + .17, face, width - .34, z + 11, 13, (bay + level) % 2 ? '#7e9b9e' : '#b5a590')
      front(g, px + width * .5, face, .033, z + 11, 13, '#e8dbc3')
      box(g, px + .04, face, width - .08, .16, 2, ['#e9daba', color, '#987c68'], z + 7)
      if ((bay + level) % 2 === 0) {
        front(g, px + .13, face + .17, width - .26, z + 16, 2, ink)
        front(g, px + .23, face + .18, .20, z + 7, 11, '#e3a07a')
        front(g, px + .49, face + .18, .18, z + 5, 12, '#e7ca9e')
        front(g, px + .72, face + .18, .16, z + 8, 10, '#7d9caa')
      }
    }
    front(g, x, face, w, z - 3, 4, '#e8d5aa')
    side(g, x + w, y, d, z - 3, 4, '#c0a988')
  }
  for (let level = 0; level < 4; level++) {
    const z = 58 + level * 32
    for (let offset = .26; offset < d - .5; offset += .79) {
      side(g, x + w, y + offset, .53, z + 4, 17, '#594e42')
      side(g, x + w, y + offset + .06, .41, z + 6, 13, '#73878a')
      side(g, x + w, y + offset + .23, .043, z + 6, 13, '#b7a991')
    }
  }
  const door = x + 1.25
  front(g, door, face, .95, 0, 34, '#293b3b')
  front(g, door + .07, face, .80, 2, 29, '#547678')
  front(g, door + .43, face, .05, 2, 28, '#d7cbb1')
  front(g, door + .49, face, .15, 13, 2, '#f7d283')
  for (const offset of [.36, 2.32, 2.97, 3.62, 4.27]) {
    const px = x + offset
    front(g, px, face, .56, 4, 29, '#34484b')
    for (let row = 0; row < 4; row++) {
      const z = 6 + row * 6
      front(g, px + .04, face, .48, z, 2, '#c29f72')
      for (let col = 0; col < 3; col++) {
        front(g, px + .07 + col * .14, face, .10, z + 2, 3, ['#c27856', '#e3bb68', '#90ae82'][(row + col) % 3])
      }
    }
    front(g, px + .275, face, .025, 5, 26, '#c0d3b7')
  }
  for (const px of [x, x + w - .22]) {
    box(g, px, face - .14, .22, .27, 53, ['#f0dfba', '#e4cda6', '#a78a6f'])
    for (let z = 2; z < 20; z += 4) front(g, px, face + .13, .22, z, 2, '#809b94')
  }
  box(g, x + .22, face - .07, w - .44, .19, 16, ['#f2d790', '#efd180', '#a97a48'], 35)
  front(g, x + .24, face + .12, w - .48, 36, 1, '#b87148')
  const title = 'SUNSHINE MINIMART'
  const size = 2
  letterSign(g, title, x + (w - (title.length * 4 - 1) * size / 32) / 2, face + .13, 39, size, '#93432c')
  floor(g, door - .10, face, 1.12, .36, '#c2aa86')
}

export function streetFurniture(scene: Phaser.Scene) {
  const table = { x: 10.78, y: 9.44, w: .8, d: .7 }
  const barrier = { x: 8.2, y: 14.78, w: 4.2, d: .09 }
  prop(scene, barrier, g => {
    for (const z of [3, 16]) front(g, barrier.x, barrier.y, barrier.w, z, 2, ink)
    for (let i = 0; i <= barrier.w; i += .15) front(g, barrier.x + i, barrier.y, .04, 0, 18, '#777367')
    front(g, barrier.x, barrier.y, barrier.w, 17, 1, '#c5b89e')
  })
  prop(scene, table, g => {
    function round(cx: number, cy: number, radius: number, z: number, color: string) {
      poly(g, color, Array.from({ length: 16 }, (_, index) => {
        const angle = 2 * Math.PI * index / 16
        return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), z]
      }))
    }
    const { x, y } = table
    round(x + .4, y + .41, .44, 0, '#9a8b72')
    box(g, x + .31, y + .24, .16, .16, 15, ['#c9b99c', '#9e8f75', '#7e725e'])
    round(x + .4, y + .34, .37, 14, ink)
    round(x + .4, y + .34, .35, 16, '#d4c5a8')
    for (const [dx, dy] of [[.04,.47], [.55,.72], [.78,.55]]) {
      round(x + dx, y + dy, .12, 5, ink)
      round(x + dx, y + dy, .11, 7, '#c9ba9c')
    }
    floor(g, x + .48, y + .26, .13, .08, '#3c8780', 16)
  })
  return [table, barrier]
}

export function eveningLights(scene: Phaser.Scene, shop: Footprint, shelter: Footprint) {
  const lights = scene.add.graphics().setDepth(600).setVisible(false)
  const glow = (x: number, y: number, z: number, rx: number, ry: number) => {
    const point = project(x, y, z)
    for (const scale of [1, .82, .64, .45, .28]) {
      lights.fillStyle(0xffc372, .052).fillEllipse(point.x, point.y, rx * scale, ry * scale)
    }
  }
  glow(shop.x + 1.7, shop.y + shop.d + .6, 1, 112, 48)
  glow(shop.x + 2.5, shop.y + shop.d, 36, 142, 43)
  for (const [x, y] of [[10.67, 9.92], [9.5, 14.1], [15.5, 11.25]]) {
    glow(x, y, 0, 98, 55)
    glow(x, y, 43, 38, 42)
  }
  const edge = shelter.y + shelter.d
  glow(shelter.x + 1.15, edge + .15, 20, 146, 95)
  for (let i = .13; i < shelter.w; i += .23) {
    const point = project(shelter.x + i, edge + .08, 43)
    glow(shelter.x + i, edge + .08, 43, 24, 20)
    lights.fillStyle(0xffe8a2, 1).fillCircle(point.x, point.y, 1.6)
  }
  for (let column = 0; column < 4; column++) {
    for (let level = 0; level < 4; level++) {
      if ((column + level) % 2 === 0) {
        const x = shop.x + .61 + column * shop.w / 4
        const y = shop.y + shop.d
        const px = shop.x + .08 + column * shop.w / 4
        const width = shop.w / 4 - .15
        const z = 57 + level * 32
        glow(x, y, z + 18, 57, 38)
        // Split the lit pane at the mullion so the facade keeps its depth.
        front(lights, px + .17, y, width * .5 - .20, z + 12, 10, '#ffc66b')
        front(lights, px + width * .5 + .04, y, width * .5 - .20, z + 12, 10, '#ffd991')
      }
    }
  }
  return (visible: boolean) => { lights.setVisible(visible) }
}
