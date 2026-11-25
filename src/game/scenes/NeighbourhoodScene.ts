import { START } from '../../state/saveGame'
import { createWorld } from '../world'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class NeighbourhoodScene extends ExplorationScene {
  protected cameraInset = 5
  // Close enough to read outfits and animation; wheel or +/- zooms out towards an overview.
  protected zoomScale = 1.45
  protected zoomable = true

  constructor(launch: Launch) {
    super(launch, 'Neighbourhood', START)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor('#263b48')
    return createWorld(this)
  }
}
