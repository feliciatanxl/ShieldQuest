import { pixelZoom } from '../isometric'
import { ExplorationScene } from './ExplorationScene'
import type { Launch } from './ExplorationScene'
import { BUILDING_SIZE, BUILDING_SPAWN, buildingCollisions } from '../buildingEntrances'
import { box, floor, front, letterSign, prop } from '../worldArt'
import { project } from '../isometric'
import type { WorldLayout } from '../world'

/** Shared cutaway interiors for ordinary mapped buildings; mission buildings retain their own scenes. */
export class BuildingScene extends ExplorationScene {
  constructor(launch: Launch) { super(launch, 'Building', BUILDING_SPAWN) }
  protected layout() {
    const { width, height } = this.scale.gameSize
    const zoom = pixelZoom(Math.min((width - 24) / 760, (height - 190) / 480, 2))
    this.cameras.main.stopFollow().setZoom(zoom).centerOn(32, 140 - 20 / zoom)
  }
  protected createWorld(): WorldLayout {
    const kind = this.launch.building?.kind ?? 'home', shop = kind === 'shop'
    this.cameras.main.setBackgroundColor('#191f29')
    const g = this.add.graphics().setDepth(-1000)
    for (let x = 0; x < 12; x++) for (let y = 0; y < 10; y++) {
      floor(g, x, y, 1, 1, (x + y) % 2 ? '#d9cdb4' : '#e6dbc4')
      floor(g, x, y, 1, .025, '#bcae96')
    }
    box(g, 0, 0, 12, .2, 80, ['#fff2d4', '#e8d8b9', '#bba989'])
    box(g, 0, .2, .2, 9.8, 80, ['#fff2d4', '#d8c7aa', '#bba989'])
    front(g, .3, .21, 11.4, 12, 5, '#32968e')
    letterSign(g, shop ? 'LOCAL SHOP' : kind === 'station' ? 'STATION' : 'WELCOME HOME', 2, .21, 49, 1.5, '#285752')
    for (const r of buildingCollisions.slice(2)) prop(this, r, draw => {
      box(draw, r.x, r.y, r.w, r.d, shop ? 34 : 22, ['#c8b48c', '#9a8061', '#705f50'])
      if (shop) for (let row = 0; row < 3; row++) for (let n = 0; n < 4; n++) {
        box(draw, r.x + .12 + n * (r.w - .2) / 4, r.y + .15, .18, .18, 7, [row % 2 ? '#e5b659' : '#7fa897', '#b77755', '#536e60'], 9 + row * 9)
      }
    })
    floor(g, 7.6, 8.1, 1.6, 1.2, '#32968e')
    const at = project(8.4, 8.5)
    this.add.text(at.x, at.y + 12, 'EXIT · E', { fontFamily: 'Outfit', fontSize: '12px', color: '#fff3d7', backgroundColor: '#285752', padding: { x: 6, y: 3 } }).setOrigin(.5).setDepth(9999)
    const title = project(6, 0, 100)
    this.add.text(title.x, title.y, this.launch.building?.name ?? 'Neighbourhood building', { fontFamily: 'Outfit', fontSize: '17px', color: '#fff3d7', backgroundColor: '#285752', padding: { x: 8, y: 5 } }).setOrigin(.5).setName('building-title').setDepth(9999)
    return { size: BUILDING_SIZE, collisions: buildingCollisions, hotspots: [{ id: 'building-exit', label: `Leave ${this.launch.building?.name ?? 'building'}`, at: { x: 8.4, y: 9 }, radius: 1 }] }
  }
}
