import { pixelZoom } from '../isometric'
import { SHOP_BACKGROUND, SHOP_SPAWN } from '../locations'
import { createMinimart } from '../minimart'
import { ExplorationScene, type Launch } from './ExplorationScene'

const CUTAWAY_WIDTH = 594
const CUTAWAY_HEIGHT = 392
const CUTAWAY_CENTER = { x: 35, y: 104 }

export class MinimartScene extends ExplorationScene {
  constructor(launch: Launch) {
    super(launch, 'Minimart', SHOP_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(SHOP_BACKGROUND)
    return createMinimart(this)
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const compact = width < 750 || height < 560
    const touch = window.matchMedia('(any-pointer: coarse), (max-width: 580px)').matches
    const shortLandscape = touch && width > height && height <= 500
    const top = shortLandscape ? 76 : compact ? (width < 520 ? 122 : 105) : 151
    const bottom = shortLandscape ? 73 : touch ? 132 : compact ? 80 : 65
    const zoom = pixelZoom(Math.min((width - 24) / CUTAWAY_WIDTH, (height - top - bottom) / CUTAWAY_HEIGHT, 2))
    const camera = this.cameras.main
    // Fit the cutaway and reserve space for the HUD above it and the prompt below.
    const x = CUTAWAY_CENTER.x
    const y = CUTAWAY_CENTER.y - (top - bottom) / (2 * zoom)
    const visibleWidth = width / zoom
    const visibleHeight = height / zoom
    camera.setZoom(zoom)
      .setBounds(x - visibleWidth / 2, y - visibleHeight / 2, visibleWidth, visibleHeight)
      .centerOn(x, y)
  }
}
