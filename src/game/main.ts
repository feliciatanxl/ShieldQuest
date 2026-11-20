import Phaser from 'phaser'
import { NeighbourhoodScene } from './scenes/NeighbourhoodScene'
import { MinimartScene } from './scenes/MinimartScene'
import type { Launch } from './scenes/ExplorationScene'

export function mountGame(parent: HTMLElement, launch: Launch) {
  const neighbourhood = new NeighbourhoodScene(launch)
  const minimart = new MinimartScene(launch)
  let viewportObserver: ResizeObserver | undefined
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#9caf7c',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    banner: false,
    input: { mouse: false, touch: false, keyboard: !launch.preview },
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
    scene: launch.scene === 'Minimart' ? [minimart, neighbourhood] : [neighbourhood, minimart],
    callbacks: {
      postBoot: booted => {
        booted.canvas.setAttribute('aria-hidden', 'true')
        viewportObserver = new ResizeObserver(() => {
          const { clientWidth: width, clientHeight: height } = parent
          const size = booted.scale.gameSize
          if (width > 0 && height > 0 && (width !== size.width || height !== size.height)) {
            booted.scale.setParentSize(width, height)
          }
        })
        viewportObserver.observe(parent)
      },
    },
  })
  return () => {
    viewportObserver?.disconnect()
    neighbourhood.detach()
    minimart.detach()
    game.destroy(true)
  }
}
