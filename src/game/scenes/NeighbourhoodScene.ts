import Phaser from 'phaser'
import { estate } from '../estate'
import { createEstateWorld, estatePreviewSpots } from '../estateWorld'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class NeighbourhoodScene extends ExplorationScene {
  protected cameraInset = 6
  protected zoomable = true

  constructor(launch: Launch) {
    // A save or door that lands somewhere now blocked falls back to the validated estate start.
    super(launch, 'Neighbourhood', estate.start)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor('#1b2330')
    return createEstateWorld(this)
  }

  protected previewSpots() {
    return estatePreviewSpots()
  }

  // Whole-number zoom keeps baked pixels square (docs/isometric-art-spec.md); wheel and +/- step between levels.
  protected layout() {
    const { width, height } = this.scale.gameSize
    if (this.launch.preview) return super.layout()
    this.focusCamera(Phaser.Math.Clamp(Math.round(Math.min(width / 620, height / 390) * this.userZoom), 1, 4))
  }
}
