import { pixelZoom } from '../isometric'
import { createHouse } from '../houseArt'
import { HOUSE_SPAWN } from '../locations'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class HouseScene extends ExplorationScene {
  constructor(launch: Launch) {
    super(launch, 'House', HOUSE_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor('#19141f')
    return createHouse(this)
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const zoom = pixelZoom(Math.min(height / 425, width / 410, 2))
    const viewWidth = width / zoom
    const viewHeight = height / zoom
    const boundsWidth = Math.max(778, viewWidth)
    const boundsHeight = Math.max(526, viewHeight)
    this.cameras.main.setBounds(32 - boundsWidth / 2, 127 - boundsHeight / 2, boundsWidth, boundsHeight)
    this.focusCamera(zoom)
  }
}
