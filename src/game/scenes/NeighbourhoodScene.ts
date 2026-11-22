import { START } from '../../state/saveGame'
import { createWorld } from '../world'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class NeighbourhoodScene extends ExplorationScene {
  protected cameraInset = 5

  constructor(launch: Launch) {
    super(launch, 'Neighbourhood', START)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor('#263b48')
    return createWorld(this)
  }
}
