import Phaser from 'phaser'
import { BuildingScene } from './scenes/BuildingScene'
import { NeighbourhoodScene } from './scenes/NeighbourhoodScene'
import { MinimartScene } from './scenes/MinimartScene'
import { HouseScene } from './scenes/HouseScene'
import { HouseHScene } from './scenes/HouseHScene'
import { HouseIScene } from './scenes/HouseIScene'
import { FreezeFrameScene } from './scenes/FreezeFrameScene'
import type { Launch } from './scenes/ExplorationScene'

export function mountGame(parent: HTMLElement, launch: Launch) {
  const neighbourhood = new NeighbourhoodScene(launch)
  const minimart = new MinimartScene(launch)
  const house = new HouseScene(launch)
  const houseH = new HouseHScene(launch)
  const houseI = new HouseIScene(launch)
  const freezeFrame = new FreezeFrameScene(launch)
  const scenes = { Building: new BuildingScene(launch), Neighbourhood: neighbourhood, Minimart: minimart, House: house, HouseH: houseH, HouseI: houseI, FreezeFrame: freezeFrame }
  const first = scenes[launch.scene ?? 'Neighbourhood']
  let viewportObserver: ResizeObserver | undefined
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#263b48',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    banner: false,
    input: { mouse: false, touch: false, keyboard: !launch.preview },
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
    scene: [first, ...Object.values(scenes).filter(scene => scene !== first)],
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
  // Dev-only handle for visual checks (scripts drive the camera through it); stripped from production builds.
  if (import.meta.env.DEV) Object.assign(window, { __shieldGame: game })
  return () => {
    viewportObserver?.disconnect()
    neighbourhood.detach()
    minimart.detach()
    house.detach()
    houseH.detach()
    houseI.detach()
    freezeFrame.detach()
    game.destroy(true)
  }
}
