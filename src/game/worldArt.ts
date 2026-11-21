import Phaser from 'phaser'
import { depthAt, project, type Footprint } from './isometric'

type Colors = readonly [string, string, string]
type Vertex = [number, number, number?]
type Graphics = Phaser.GameObjects.Graphics
const ink = '#39394a'
const pixel = (color: string) => Number.parseInt(color.slice(1), 16)

export function poly(g: Graphics, color: string, vertices: Vertex[], alpha = 1) {
  g.fillStyle(pixel(color), alpha)
  g.fillPoints(vertices.map(([x, y, h]) => {
    const p = project(x, y, h)
    return new Phaser.Math.Vector2(Math.round(p.x), Math.round(p.y))
  }), true)
}

export function floor(g: Graphics, x: number, y: number, w: number, d: number, color: string, h = 0, alpha = 1) {
  poly(g, color, [[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], alpha)
}

export function front(g: Graphics, x: number, y: number, w: number, z: number, h: number, color: string) {
  poly(g, color, [[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]])
}

export function side(g: Graphics, x: number, y: number, d: number, z: number, h: number, color: string) {
  poly(g, color, [[x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h]])
}

export function box(g: Graphics, x: number, y: number, w: number, d: number, h: number, colors: Colors, z = 0) {
  side(g, x + w, y, d, z, h, colors[2])
  front(g, x, y + d, w, z, h, colors[1])
  floor(g, x, y, w, d, colors[0], z + h)
}

const glyphs: Record<string, string> = {
  A:'010101111101101', B:'110101110101110', C:'011100100100011', D:'110101101101110',
  E:'111100110100111', F:'111100110100100', G:'011100101101011', H:'101101111101101',
  I:'111010010010111', J:'001001001101010', K:'101101110101101', L:'100100100100111',
  M:'101111111101101', N:'101111111111101', O:'010101101101010', P:'110101110100100',
  Q:'010101101111011', R:'110101110101101', S:'011100010001110', T:'111010010010010',
  U:'101101101101111', V:'101101101101010', W:'101101111111101', X:'101101010101101',
  Y:'101101010010010', Z:'111001010100111', '0':'111101101101111', '1':'110010010010111',
  '2':'110001010100111', '3':'110001010001110', '4':'101101111001001', '5':'111100110001110',
}

export function letterSign(g: Graphics, text: string, x: number, y: number, z: number, size: number, color: string) {
  const unit = size / 32
  Array.from(text).forEach((letter, index) => {
    Array.from(glyphs[letter] ?? '').forEach((bit, cell) => {
      if (bit === '1') front(g, x + (index * 4 + cell % 3) * unit, y, unit, z + (4 - Math.floor(cell / 3)) * size, size, color)
    })
  })
}

export function prop(scene: Phaser.Scene, rect: Footprint, render: (g: Graphics) => void, offset = 0) {
  const g = scene.add.graphics().setDepth(depthAt(rect.x + rect.w, rect.y + rect.d) + offset)
  render(g)
  return g
}

export function tree(g: Graphics, x: number, y: number, large = false, hue = 0) {
  const p = project(x + .34, y + .34)
  const colors = hue ? ['#4a7763', '#648e69', '#83a66a', '#a9bd78'] : ['#4b7a67', '#659a77', '#86ad78', '#afc68a']
  const size = large ? 1.25 : 1
  function pixelShape(color: string, vertices: number[][]) {
    g.fillStyle(pixel(color))
    g.fillPoints(vertices.map(([px, py]) => new Phaser.Math.Vector2(Math.round(p.x + px * size), Math.round(p.y + py * size))), true)
  }
  floor(g, x - .25, y - .13, 1.22, .93, '#354d50', 0, .19)
  box(g, x + .15, y + .15, .28, .28, 31 * size, ['#aa8364', '#8a6452', '#664c48'])
  pixelShape(colors[0], [[-32,-44],[-32,-63],[-23,-67],[-23,-77],[-11,-77],[-11,-83],[10,-83],[10,-78],[23,-78],[23,-68],[31,-68],[31,-47],[24,-47],[24,-39],[13,-39],[13,-34],[-13,-34],[-13,-38],[-24,-38],[-24,-44]])
  pixelShape(colors[1], [[-30,-49],[-30,-63],[-21,-63],[-21,-74],[-9,-74],[-9,-80],[10,-80],[10,-74],[23,-74],[23,-64],[29,-64],[29,-53],[19,-53],[19,-47],[4,-47],[4,-42],[-14,-42],[-14,-46]])
  pixelShape(colors[2], [[-24,-63],[-17,-63],[-17,-73],[-7,-73],[-7,-78],[8,-78],[8,-72],[18,-72],[18,-63],[12,-63],[12,-57],[-4,-57],[-4,-52],[-17,-52],[-17,-57],[-24,-57]])
  pixelShape(colors[3], [[-14,-70],[-6,-70],[-6,-74],[6,-74],[6,-69],[12,-69],[12,-64],[3,-64],[3,-61],[-9,-61],[-9,-65],[-14,-65]])
  g.fillStyle(pixel(colors[3]), .7).fillRect(Math.round(p.x - 18 * size), Math.round(p.y - 57 * size), 4, 3)
  g.fillStyle(pixel(colors[2]), .9).fillRect(Math.round(p.x + 18 * size), Math.round(p.y - 54 * size), 4, 2)
}

export function planter(g: Graphics, x: number, y: number, w = 1) {
  box(g, x, y, w, .58, 10, ['#f3c3a1', '#a76960', '#855b56'])
  floor(g, x + .08, y + .08, w - .16, .42, '#665857', 10)
  for (let i = .18; i < w; i += .26) {
    box(g, x + i - .08, y + .19, .18, .19, 5 + (i % .4) * 10, ['#a8bb73', '#69875e', '#536e5a'], 10)
    const p = project(x + i + .01, y + .31, 18)
    g.fillStyle(pixel(i % .4 < .2 ? '#efaa85' : '#f5d581')).fillRect(Math.round(p.x), Math.round(p.y), 3, 3)
  }
}

export function bench(g: Graphics, x: number, y: number) {
  for (const leg of [0, 1.02]) box(g, x + leg, y + .17, .10, .27, 10, ['#5b5b64', ink, '#555161'])
  box(g, x - .05, y, 1.22, .49, 3, ['#d5a16c', '#9a684f', '#75514d'], 9)
  box(g, x - .05, y, 1.22, .09, 5, ['#e2ad74', '#b57a54', '#79554d'], 16)
}

export function lamp(g: Graphics, x: number, y: number) {
  box(g, x, y, .11, .11, 46, ['#a6ada2', '#53676b', '#3e5259'])
  box(g, x, y, .45, .15, 3, ['#aab8a3', '#fff0bb', '#667574'], 43)
}

export function shelter(g: Graphics, x: number, y: number, w: number, d: number, bus = false) {
  floor(g, x, y, w, d, '#55556c', 0, .17)
  for (const [px, py] of [[x, y], [x + w - .1, y], [x, y + d - .12], [x + w - .1, y + d - .12]]) {
    box(g, px, py, .11, .11, 45, ['#abcbc2', '#648b88', '#496779'])
  }
  bench(g, x + .31, y + .14)
  if (bus) {
    // Bus stop route display board & timetable
    front(g, x + w - .55, y + .08, .39, 14, 21, '#467d79')
    front(g, x + w - .49, y + .08, .27, 18, 13, '#f4e3b4')
    // Route indicator stripes: 14 · 65 · 111
    front(g, x + w - .48, y + .08, .25, 27, 3, '#1d5a55')
    front(g, x + w - .48, y + .08, .25, 22, 3, '#d97706')
    front(g, x + w - .48, y + .08, .25, 17, 3, '#0284c7')
    // Orange LTA Bus Stop Signpost
    box(g, x - .25, y + d, .08, .08, 48, ['#ea580c', '#c2410c', '#9a3412'])
    box(g, x - .32, y + d, .22, .08, 10, ['#fef08a', '#eab308', '#ca8a04'], 46)
  }
  box(g, x - .12, y - .12, w + .24, d + .24, 5, ['#9cc4b5', '#4d8383', '#547d84'], 43)
  for (let i = .18; i < w; i += .36) floor(g, x + i, y - .08, .035, d + .16, '#c0dbc2', 48)
  if (bus) letterSign(g, 'BUS STOP', x + .14, y + d + .12, 43, 0.9, '#fff0c8')
}

export function block(g: Graphics, x: number, y: number, w: number, d: number, number: string, accent: string, floors: number) {
  const h = 35 + floors * 23
  // Ground drop shadow
  floor(g, x + .05, y + .12, w + .42, d + .7, '#48546a', 0, .24)
  
  // Ground Floor: Authentic Singapore HDB Void Deck
  // Void deck breezeway shadow under the building
  box(g, x + 0.1, y + 0.1, w - 0.2, d - 0.2, 27, ['#887d74', '#5e544c', '#423b36'])
  
  // Sturdy Void Deck Load-Bearing Pillars
  for (let i = 0.15; i < w - 0.2; i += 1.45) {
    box(g, x + i, y + d - 0.25, 0.28, 0.25, 27, ['#f5ece1', '#d9cbbe', '#a89a8d'])
    box(g, x + i, y + 0.05, 0.28, 0.25, 27, ['#e5dcd1', '#c9bbaf', '#988b7e'])
  }
  
  // Stainless Steel HDB Letterbox Bank
  box(g, x + 0.55, y + d - 0.08, 0.85, 0.18, 13, ['#e2e8f0', '#cbd5e1', '#94a3b8'], 3)
  for (let row = 5; row < 15; row += 3) {
    front(g, x + 0.58, y + d + 0.1, 0.79, row, 1, '#64748b')
  }

  // Community Notice Board
  front(g, x + w - 1.45, y + d - 0.05, 0.85, 8, 14, '#1e3a5f')
  front(g, x + w - 1.42, y + d - 0.05, 0.79, 9, 10, '#fef3c7')
  front(g, x + w - 1.38, y + d - 0.05, 0.32, 11, 6, '#ffffff')
  front(g, x + w - 1.02, y + d - 0.05, 0.34, 11, 7, '#e0f2fe')

  // Concrete Void-Deck Chess Table & Cylindrical Stools
  box(g, x + w / 2 - 0.25, y + d / 2 - 0.25, 0.5, 0.5, 9, ['#f8fafc', '#e2e8f0', '#cbd5e1'])
  box(g, x + w / 2 - 0.55, y + d / 2 - 0.15, 0.25, 0.25, 6, ['#e2e8f0', '#cbd5e1', '#94a3b8'])
  box(g, x + w / 2 + 0.3, y + d / 2 - 0.15, 0.25, 0.25, 6, ['#e2e8f0', '#cbd5e1', '#94a3b8'])

  // Residential Upper Floors
  box(g, x, y, w, d, h - 27, ['#fbdfc5', '#f0d5b7', '#b4a3a3'], 27)
  for (let level = 0; level < floors; level++) {
    const z = 34 + level * 23
    // Corridor access ledge & accent facade band
    front(g, x, y + d, w, z - 4, 4, accent)
    side(g, x + w, y, d, z - 4, 4, '#96919d')
    
    for (let i = .23; i < w - .55; i += .86) {
      front(g, x + i, y + d, .58, z, 13, '#535b6d')
      const windowLight = ((level + i) % 3 < 1) ? '#ffe082' : '#88a6ab'
      front(g, x + i + .06, y + d, .22, z + 3, 8, windowLight)
      front(g, x + i + .31, y + d, .19, z + 3, 8, '#adc5bf')
      front(g, x + i - .04, y + d, .65, z - 2, 2, '#f6e3c6')
      
      // Air Conditioner Outdoor Compressor Bracket & Grille
      if ((Math.floor(i * 3) + level) % 3 === 0) {
        box(g, x + i + .42, y + d, .18, .14, 5, ['#f1f5f9', '#cbd5e1', '#94a3b8'], z - 3)
      }
      
      // Singapore Bamboo Laundry Pole with Colorful Clothes
      if ((Math.floor(i * 2) + level) % 4 === 1) {
        box(g, x + i + .12, y + d + .05, .04, .45, 1, ['#e2e8f0', '#cbd5e1', '#94a3b8'], z + 4)
        front(g, x + i + .10, y + d + .22, .18, z + 2, 4, level % 2 === 0 ? '#f43f5e' : '#38bdf8')
        front(g, x + i + .10, y + d + .38, .16, z + 1, 5, level % 2 === 0 ? '#facc15' : '#4ade80')
      }
    }
    for (let j = .22; j < d - .4; j += .65) {
      side(g, x + w, y + j, .36, z, 12, '#707683')
      side(g, x + w, y + j + .04, .26, z + 3, 7, '#9aadb0')
    }
  }

  // Rooftop parapet & Lift Motor Machine Housing
  box(g, x - .09, y - .09, w + .18, d + .18, 7, ['#ead2bb', accent, '#858693'], h)
  box(g, x + .47, y + .33, w - .94, d - .66, 7, ['#c7b5ae', '#b29892', '#9f9096'], h + 7)
  // Rooftop Lift Room with Aircraft Warning Beacon
  for (const i of [x + .63, x + w - 1.3]) {
    box(g, i, y + .63, .68, .55, 13, ['#d9d0c5', '#baaea8', '#87858e'], h + 14)
    box(g, i + .28, y + .85, .12, .12, 3, ['#ef4444', '#dc2626', '#b91c1c'], h + 27)
  }

  // Prominent Block Number Signs (Gable top and Void Deck pillar)
  front(g, x + w - .89, y + d, .84, h - 20, 16, accent)
  letterSign(g, number, x + w - .8, y + d, h - 17, 1.7, '#fff2d7')
  
  // Void deck entrance block marker
  front(g, x + .18, y + d, .52, 18, 7, accent)
  letterSign(g, number, x + .22, y + d, 19, 1.0, '#fff2d7')
}

export function shop(g: Graphics, x: number, y: number, w: number, d: number, mini: boolean) {
  const band = mini ? '#1e6b62' : '#883b32'
  const awning = mini ? '#f97316' : '#dc2626'
  const title = mini ? 'SUNSHINE MINIMART' : 'KOPI CORNER'
  floor(g, x + .14, y + .1, w + .42, d + .7, '#556070', 0, .22)
  box(g, x, y, w, d, 68, ['#e9b78f', '#f4d5ae', '#a99b9f'])
  box(g, x + .15, y + .17, w - .3, d - .34, 8, ['#edc49e', '#c69680', '#ad8d87'], 68)
  box(g, x + .33, y + .37, w - .66, d - .75, 2, ['#d9aa8b', '#c49c88', '#aa8b85'], 76)
  for (let i = .5; i < w - .4; i += .66) floor(g, x + i, y + .44, .04, d - .88, '#f1c6a0', 78)
  const door = mini ? 1.25 : .43
  front(g, x + .17, y + d, w - .34, 2, 30, '#765f61')
  front(g, x + door, y + d, .95, 1, 34, '#3d4d56')
  
  // Storefront glass & product window displays
  for (let i = .26; i < w - .47; i += .49) {
    if (i > door - .48 && i < door + 1) continue
    front(g, x + i, y + d, .44, 6, 21, mini ? '#8eaca3' : '#cca97d')
    front(g, x + i + .06, y + d, .10, 11, 13, '#e9d5a4')
    front(g, x + i, y + d, .44, 6, 3, '#4e6666')
  }
  
  if (mini) {
    // Sunshine Minimart: Outdoor Fruit Crates & Ice Cream Freezer
    // Crates of bananas and apples
    box(g, x + w - 1.15, y + d + .08, .45, .32, 6, ['#fde047', '#ca8a04', '#a16207'])
    box(g, x + w - .65, y + d + .08, .45, .32, 6, ['#f87171', '#dc2626', '#b91c1c'])
    // Wall's / Paddle Pop Ice Cream Freezer Box
    box(g, x + door - .55, y + d + .08, .48, .35, 12, ['#38bdf8', '#0284c7', '#0369a1'])
    front(g, x + door - .52, y + d + .43, .42, 6, 4, '#ffffff')
    // Open Sign
    front(g, x + door + .48, y + d, .05, 1, 27, '#80a29d')
    front(g, x + door + .58, y + d, .13, 13, 3, '#4ade80')
  } else {
    // Kopi Corner: Outdoor Kopitiam Marble Tables & Stools
    kopitiamTable(g, x + w + .4, y + d - .6)
    kopitiamTable(g, x + w + .4, y + d + .4)
  }

  for (let j = .24; j < d - .2; j += .68) {
    side(g, x + w, y + j, .44, 14, 18, '#666b78')
    side(g, x + w, y + j + .07, .30, 17, 12, '#8c9f9f')
  }
  box(g, x - .05, y + d - .05, w + .1, .14, 25, [band, band, '#566b70'], 39)
  const fontSize = mini ? 2 : 2.35
  letterSign(g, title, x + (w - (title.length * 4 - 1) * fontSize / 32) / 2, y + d + .09, 46, fontSize, '#fff3cd')
  
  // Traditional striped canvas awning
  for (let i = 0; i < w; i += .32) {
    const color = Math.round(i / .32) % 2 === 0 ? awning : '#fff0cb'
    const width = Math.min(.32, w - i)
    poly(g, color, [[x + i, y + d + .07, 40], [x + i + width, y + d + .07, 40], [x + i + width, y + d + .52, 33], [x + i, y + d + .52, 33]])
    front(g, x + i, y + d + .52, width, 29, 4, color)
  }
  floor(g, x + door - .10, y + d, 1.14, .39, '#cead9b', 2)
}

// Singapore Kopitiam Marble Round Table & Stools
export function kopitiamTable(g: Graphics, x: number, y: number) {
  // Center pedestal & green-rimmed white marble table top
  box(g, x + .38, y + .38, .14, .14, 16, ['#475569', '#334155', '#1e293b'])
  box(g, x + .15, y + .15, .6, .6, 3, ['#f8fafc', '#15803d', '#166534'], 16)
  // Two traditional kopitiam round stools
  box(g, x - .1, y + .3, .25, .25, 10, ['#ef4444', '#b91c1c', '#7f1d1d'])
  box(g, x + .75, y + .3, .25, .25, 10, ['#ef4444', '#b91c1c', '#7f1d1d'])
}

// Singapore Covered Sheltered Walkway (Linkway)
export function linkway(g: Graphics, x: number, y: number, w: number, d: number) {
  // Paved path
  floor(g, x, y, w, d, '#e2d7c5', 0, 0.4)
  // White support stanchions
  for (const px of [x + 0.05, x + w - 0.15]) {
    for (const py of [y + 0.05, y + d - 0.15]) {
      box(g, px, py, 0.09, 0.09, 38, ['#ffffff', '#cbd5e1', '#94a3b8'])
    }
  }
  // Signature curved emerald-green roof
  box(g, x - 0.08, y - 0.08, w + 0.16, d + 0.16, 4, ['#15803d', '#166534', '#14532d'], 38)
}

// Singapore Dark Green NParks / NEA Dual Public Litter & Recycling Bin
export function rubbishBin(g: Graphics, x: number, y: number) {
  floor(g, x - 0.05, y - 0.05, 0.35, 0.35, '#334155', 0, 0.25)
  box(g, x, y, 0.26, 0.26, 14, ['#15803d', '#166534', '#14532d'])
  box(g, x + 0.02, y + 0.02, 0.22, 0.22, 2, ['#facc15', '#eab308', '#ca8a04'], 14)
}

// Singapore Green Street Nameboard on Black Post
export function streetSign(g: Graphics, x: number, y: number, text: string) {
  box(g, x + 0.12, y + 0.12, 0.08, 0.08, 42, ['#1e293b', '#0f172a', '#020617'])
  box(g, x - 0.1, y + 0.1, 0.85, 0.1, 6, ['#15803d', '#166534', '#14532d'], 36)
  letterSign(g, text.slice(0, 8), x - 0.06, y + 0.22, 37, 0.85, '#ffffff')
}

// Singapore Pedestrian Crossing Signal Post with Yellow Audio Buzzer Box
export function trafficLight(g: Graphics, x: number, y: number) {
  box(g, x + 0.1, y + 0.1, 0.09, 0.09, 44, ['#334155', '#1e293b', '#0f172a'])
  // Yellow push button buzzer box
  box(g, x + 0.05, y + 0.18, 0.18, 0.14, 8, ['#fde047', '#eab308', '#ca8a04'], 18)
  // Signal head
  box(g, x + 0.04, y + 0.06, 0.22, 0.18, 14, ['#1e293b', '#0f172a', '#020617'], 34)
  front(g, x + 0.06, y + 0.24, 0.16, 42, 4, '#22c55e')
  front(g, x + 0.06, y + 0.24, 0.16, 36, 4, '#ef4444')
}

// Vibrant Tropical Bougainvillea Shrub (Pink/Magenta Blooms)
export function bougainvillea(g: Graphics, x: number, y: number) {
  floor(g, x - 0.1, y - 0.1, 0.8, 0.8, '#334155', 0, 0.2)
  box(g, x, y, 0.65, 0.65, 12, ['#15803d', '#166534', '#14532d'])
  box(g, x + 0.08, y + 0.08, 0.48, 0.48, 8, ['#db2777', '#be185d', '#9d174d'], 12)
  // Scattered magenta flower petals
  for (const [fx, fy] of [[0.12, 0.15], [0.42, 0.38], [0.25, 0.45], [0.48, 0.18]]) {
    const p = project(x + fx, y + fy, 21)
    g.fillStyle(pixel('#f472b6')).fillRect(Math.round(p.x), Math.round(p.y), 4, 4)
  }
}

// Singapore Community Herb Garden Raised Planter
export function communityGarden(g: Graphics, x: number, y: number, w = 2, d = 1) {
  // Rich timber border
  box(g, x, y, w, d, 8, ['#78350f', '#92400e', '#451a03'])
  floor(g, x + 0.1, y + 0.1, w - 0.2, d - 0.2, '#3f2e1e', 8)
  // Rows of lush green pandan & chili herbs
  for (let ix = 0.3; ix < w - 0.3; ix += 0.45) {
    for (let iy = 0.25; iy < d - 0.2; iy += 0.35) {
      box(g, x + ix, y + iy, 0.22, 0.22, 5, ['#4ade80', '#16a34a', '#14532d'], 8)
    }
  }
}

