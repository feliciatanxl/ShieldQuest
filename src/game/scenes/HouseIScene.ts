import { HOUSE_I_BACKGROUND, HOUSE_I_SPAWN } from '../locations'
import { createHouseI } from '../houseIArt'
import { Actor } from '../entities/Actor'
import { residents } from '../residentData'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class HouseIScene extends ExplorationScene {
  private amirActor?: Actor
  private mayActor?: Actor
  private junActor?: Actor

  constructor(launch: Launch) {
    super(launch, 'HouseI', HOUSE_I_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(HOUSE_I_BACKGROUND)
    return createHouseI(this)
  }

  create(data?: { position?: { x: number; y: number } }) {
    super.create(data)

    // Spawn witness and suspect actors in the investigation room
    this.amirActor = new Actor(this, 'whisper-actor-amir', residents.amir, { x: 2.8, y: 3.5 })
    this.mayActor = new Actor(this, 'whisper-actor-may', residents.may, { x: 8.5, y: 3.5 })
    this.junActor = new Actor(this, 'whisper-actor-jun', residents.jun, { x: 8.5, y: 5.8 })
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
