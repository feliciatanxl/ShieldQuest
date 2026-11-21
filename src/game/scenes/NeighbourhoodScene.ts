import { START } from '../../state/saveGame'
import { createWorld } from '../world'
import { ExplorationScene, type Launch } from './ExplorationScene'

export class NeighbourhoodScene extends ExplorationScene {
  constructor(launch: Launch) {
    super(launch, 'Neighbourhood', START)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor('#9caf7c')
    return createWorld(this)
  }
}
