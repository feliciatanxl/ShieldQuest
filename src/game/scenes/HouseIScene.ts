import { HOUSE_I_BACKGROUND, HOUSE_I_SPAWN } from '../locations'
import { createHouseI } from '../houseIArt'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class HouseIScene extends ExplorationScene {
  constructor(launch: Launch) {
    super(launch, 'HouseI', HOUSE_I_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(HOUSE_I_BACKGROUND)
    return createHouseI(this)
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const zoom = Math.min(height / 420, width / 410, 1.25)
    const viewWidth = width / zoom
    const viewHeight = height / zoom
    const boundsWidth = Math.max(780, viewWidth)
    const boundsHeight = Math.max(520, viewHeight)
    this.cameras.main.setBounds(32 - boundsWidth / 2, 120 - boundsHeight / 2, boundsWidth, boundsHeight)
    this.focusCamera(zoom)
  }
}
