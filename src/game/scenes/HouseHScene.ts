import { pixelZoom } from '../isometric'
import { HOUSE_H_BACKGROUND, HOUSE_H_SPAWN } from '../locations'
import { createHouseH } from '../houseHArt'
import { Actor } from '../entities/Actor'
import { residents } from '../residentData'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class HouseHScene extends ExplorationScene {
  private facilitatorActor?: Actor

  constructor(launch: Launch) {
    super(launch, 'HouseH', HOUSE_H_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(HOUSE_H_BACKGROUND)
    return createHouseH(this)
  }

  create(data?: { position?: { x: number; y: number } }) {
    super.create(data)

    // Facilitator on duty at the surveillance station
    this.facilitatorActor = new Actor(this, 'house-h-facilitator', residents.cashier, { x: 2.4, y: 2.0 })
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const zoom = pixelZoom(Math.min(height / 420, width / 410, 2))
    const viewWidth = width / zoom
    const viewHeight = height / zoom
    const boundsWidth = Math.max(760, viewWidth)
    const boundsHeight = Math.max(520, viewHeight)
    this.cameras.main.setBounds(32 - boundsWidth / 2, 120 - boundsHeight / 2, boundsWidth, boundsHeight)
    this.focusCamera(zoom)
  }
}
