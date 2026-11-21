import { HOUSE_H_BACKGROUND, HOUSE_H_SPAWN } from '../locations'
import { createHouseH } from '../houseHArt'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class HouseHScene extends ExplorationScene {
  constructor(launch: Launch) {
    super(launch, 'HouseH', HOUSE_H_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(HOUSE_H_BACKGROUND)
    return createHouseH(this)
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const zoom = Math.min(height / 420, width / 410, 1.25)
    const viewWidth = width / zoom
    const viewHeight = height / zoom
    const boundsWidth = Math.max(760, viewWidth)
    const boundsHeight = Math.max(520, viewHeight)
    this.cameras.main.setBounds(32 - boundsWidth / 2, 120 - boundsHeight / 2, boundsWidth, boundsHeight)
    this.focusCamera(zoom)
  }
}
