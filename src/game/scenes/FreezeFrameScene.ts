import Phaser from 'phaser'
import { FREEZE_FRAME_BACKGROUND, FREEZE_FRAME_SPAWN } from '../locations'
import { createMinimart } from '../minimart'
import { Actor } from '../entities/Actor'
import { residents } from '../residentData'
import { ExplorationScene, type Launch } from './ExplorationScene'
import { freezeFrameObjects } from '../freezeFrameLayout'
import { project } from '../isometric'

const CUTAWAY_WIDTH = 594
const CUTAWAY_HEIGHT = 392
const CUTAWAY_CENTER = { x: 35, y: 104 }

export class FreezeFrameScene extends ExplorationScene {
  private junActor?: Actor
  private cashierActor?: Actor
  private isFrozen = false
  private freezeGraphics?: Phaser.GameObjects.Graphics
  private statusText?: Phaser.GameObjects.Text
  private junBubble?: Phaser.GameObjects.Text
  private scenarioStage = 1
  private stageTimer?: number

  constructor(launch: Launch) {
    super(launch, 'FreezeFrame', FREEZE_FRAME_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(FREEZE_FRAME_BACKGROUND)
    const baseLayout = createMinimart(this)
    // Replace default minimart exploration hotspots with Freeze Frame investigation hotspots
    return {
      size: baseLayout.size,
      hotspots: freezeFrameObjects,
      collisions: baseLayout.collisions,
    }
  }

  create(data?: { position?: { x: number; y: number } }) {
    super.create(data)

    // Spawn Jun actor and Cashier actor
    this.junActor = new Actor(this, 'ff-actor-jun', residents.jun, { x: 4.83, y: 3.31 })
    this.cashierActor = new Actor(this, 'ff-actor-cashier', residents.cashier, { x: 8.77, y: 4.32 })

    // Speech bubble above Jun
    const junPos = project(4.83, 3.31)
    this.junBubble = this.add.text(junPos.x, junPos.y - 72, '“We’re friends right? Help me watch the door!”', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#1a1824',
      backgroundColor: '#fff7e8',
      padding: { x: 8, y: 4 },
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(2000)

    // Time freeze visual layer
    this.freezeGraphics = this.add.graphics().setDepth(1500).setScrollFactor(0)
    
    // Status banner
    this.statusText = this.add.text(0, 18, '▶ SCENARIO RUNNING · Press SPACE to Freeze Time', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#fff7e8',
      backgroundColor: 'rgba(20, 24, 34, 0.85)',
      padding: { x: 14, y: 6 },
    }).setOrigin(0.5, 0).setDepth(2500).setScrollFactor(0)

    // Space key listener for toggling freeze
    const keys = this.input.keyboard
    if (keys) {
      keys.addKey('SPACE').on('down', (_key: Phaser.Input.Keyboard.Key, event: KeyboardEvent) => {
        if (!event.repeat) {
          this.toggleFreeze()
        }
      })
    }

    // Bridge listeners
    const cleanups = [
      this.launch.bridge.on('action', () => {
        // Can also trigger action or freeze toggle
      }),
    ]

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      cleanups.forEach(c => c())
      if (this.stageTimer) clearInterval(this.stageTimer)
    })

    this.updateStatusBanner()
    this.startScenarioTicker()
  }

  private startScenarioTicker() {
    const dialogues = [
      '“Hey! Perfect timing, I need your help right now!”',
      '“Eh bro, watch the entrance for 2 minutes! We’re friends right?”',
      '“Keep eyes on the door! Don’t look over here, whistle if someone comes!”',
      '“Almost done! Make sure no one walks past that door!”',
      '“Someone’s coming! Quick, block the door! Tell them shop is closed!”',
    ]

    this.stageTimer = window.setInterval(() => {
      if (this.isFrozen) return
      this.scenarioStage = (this.scenarioStage % 5) + 1
      if (this.junBubble) {
        this.junBubble.setText(dialogues[this.scenarioStage - 1])
      }
    }, 4500)
  }

  toggleFreeze() {
    this.isFrozen = !this.isFrozen
    this.updateFreezeVisuals()
    this.updateStatusBanner()
  }

  private updateFreezeVisuals() {
    if (!this.freezeGraphics) return
    this.freezeGraphics.clear()

    const { width, height } = this.scale.gameSize
    if (this.isFrozen) {
      // Ice-blue vignette overlay
      this.freezeGraphics.fillStyle(0x0a2540, 0.28)
      this.freezeGraphics.fillRect(0, 0, width, height)

      // Cold frost border
      this.freezeGraphics.lineStyle(5, 0x67e8f9, 0.85)
      this.freezeGraphics.strokeRect(4, 4, width - 8, height - 8)

      this.freezeGraphics.lineStyle(1.5, 0xe0f2fe, 0.7)
      this.freezeGraphics.strokeRect(8, 8, width - 16, height - 16)
    }
  }

  private updateStatusBanner() {
    if (!this.statusText) return
    const { width } = this.scale.gameSize
    this.statusText.setX(width / 2)

    if (this.isFrozen) {
      this.statusText.setText('⏸ TIME FROZEN — Walk around to inspect evidence & characters (Space to Resume)')
      this.statusText.setStyle({ color: '#7dd3fc', backgroundColor: 'rgba(8, 28, 48, 0.92)' })
    } else {
      this.statusText.setText('▶ SCENARIO RUNNING · Press SPACE to Freeze Time')
      this.statusText.setStyle({ color: '#fef08a', backgroundColor: 'rgba(20, 24, 34, 0.88)' })
    }
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const compact = width < 750 || height < 560
    const touch = window.matchMedia('(any-pointer: coarse), (max-width: 580px)').matches
    const shortLandscape = touch && width > height && height <= 500
    const top = shortLandscape ? 76 : compact ? (width < 520 ? 122 : 105) : 151
    const bottom = shortLandscape ? 73 : touch ? 132 : compact ? 80 : 65
    const zoom = Math.max(.18, Math.min((width - 24) / CUTAWAY_WIDTH, (height - top - bottom) / CUTAWAY_HEIGHT, 1.50))
    const camera = this.cameras.main
    const x = CUTAWAY_CENTER.x
    const y = CUTAWAY_CENTER.y - (top - bottom) / (2 * zoom)
    const visibleWidth = width / zoom
    const visibleHeight = height / zoom
    camera.setZoom(zoom)
      .setBounds(x - visibleWidth / 2, y - visibleHeight / 2, visibleWidth, visibleHeight)
      .centerOn(x, y)

    this.updateStatusBanner()
    this.updateFreezeVisuals()
  }
}
