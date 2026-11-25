import Phaser from 'phaser'
import { createPrecinct, PRECINCT_SPAWN } from '../precinct'
import { ExplorationScene, type Launch } from './ExplorationScene'

/** The Habbo-style vertical-slice precinct (docs/isometric-art-spec.md). */
export class PrecinctScene extends ExplorationScene {
  protected cameraInset = 3

  constructor(launch: Launch) {
    super(launch, 'Precinct', PRECINCT_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor('#1b2330')
    return createPrecinct(this)
  }

  // Whole-number zoom only, so every baked pixel stays square and outlines keep one weight.
  protected layout() {
    const { width, height } = this.scale.gameSize
    if (this.launch.preview) return super.layout()
    this.focusCamera(Phaser.Math.Clamp(Math.round(Math.min(width / 620, height / 390)), 1, 4))
  }
}
