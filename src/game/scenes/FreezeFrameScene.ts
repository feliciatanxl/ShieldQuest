import { pixelZoom } from '../isometric'
import Phaser from 'phaser'
import { FREEZE_FRAME_BACKGROUND, FREEZE_FRAME_SPAWN } from '../locations'
import { createMinimart } from '../minimart'
import { Actor } from '../entities/Actor'
import { residents } from '../residentData'
import { ExplorationScene, type Launch } from './ExplorationScene'
import { freezeFrameObjects } from '../freezeFrameLayout'
import { project } from '../isometric'
import { sound } from '../audio'
import type { Point } from '../../state/saveGame'

const CUTAWAY_WIDTH = 594
const CUTAWAY_HEIGHT = 392
const CUTAWAY_CENTER = { x: 35, y: 104 }

interface JunStageTarget {
  pos: Point
  facing: 'front' | 'back' | 'left' | 'right'
  dialogue: string
}

const JUN_ROUTINE: Record<number, JunStageTarget> = {
  1: { pos: { x: 7.2, y: 5.8 }, facing: 'left', dialogue: '“Hey! You’re here! Perfect timing, I need your help right now!”' },
  2: { pos: { x: 3.3, y: 3.2 }, facing: 'back', dialogue: '“Eh bro, help me watch the entrance for two minutes! We’re friends right?”' },
  3: { pos: { x: 3.1, y: 3.4 }, facing: 'right', dialogue: '“Keep eyes on the door! Don’t look over here, whistle if someone comes!”' },
  4: { pos: { x: 4.8, y: 4.2 }, facing: 'front', dialogue: '“Almost done! Make sure no one walks past that door!”' },
  5: { pos: { x: 5.4, y: 5.0 }, facing: 'front', dialogue: '“Someone’s coming! Quick, block the door! Tell them shop is closed!”' },
}

export class FreezeFrameScene extends ExplorationScene {
  private junActor?: Actor
  private cashierActor?: Actor
  private isFrozen = false
  private freezeGraphics?: Phaser.GameObjects.Graphics
  private statusText?: Phaser.GameObjects.Text
  private junBubble?: Phaser.GameObjects.Text
  private cashierBubble?: Phaser.GameObjects.Text
  private scenarioStage = 1
  private stageTimer?: number
  private walkingTarget: Point = { x: 7.2, y: 5.8 }
  private branchResolved = false

  constructor(launch: Launch) {
    super(launch, 'FreezeFrame', FREEZE_FRAME_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(FREEZE_FRAME_BACKGROUND)
    const baseLayout = createMinimart(this)
    return {
      size: baseLayout.size,
      hotspots: freezeFrameObjects,
      collisions: baseLayout.collisions,
    }
  }

  create(data?: { position?: { x: number; y: number } }) {
    super.create(data)

    // Spawn Jun actor and Cashier actor
    this.junActor = new Actor(this, 'ff-actor-jun', residents.jun, { x: 7.2, y: 6.8 })
    this.cashierActor = new Actor(this, 'ff-actor-cashier', residents.cashier, { x: 8.77, y: 4.32 })

    // Speech bubble above Jun
    const junPos = project(7.2, 6.8)
    this.junBubble = this.add.text(junPos.x, junPos.y - 74, JUN_ROUTINE[1].dialogue, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#1a1824',
      backgroundColor: '#fff7e8',
      padding: { x: 8, y: 4 },
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(2000)

    // Speech bubble above Cashier Mr. Tan
    const cashierPos = project(8.77, 4.32)
    this.cashierBubble = this.add.text(cashierPos.x, cashierPos.y - 74, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0f172a',
      backgroundColor: '#e0f2fe',
      padding: { x: 8, y: 4 },
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(2000).setVisible(false)

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

    // Bridge listeners for React controls
    const cleanups = [
      this.launch.bridge.on('freezeToggle', (forceState?: boolean) => {
        if (typeof forceState === 'boolean') {
          if (this.isFrozen !== forceState) this.toggleFreeze()
        } else {
          this.toggleFreeze()
        }
      }),
      this.launch.bridge.on('scenarioBranch', branch => {
        if (branch) this.executeBranchOutcome(branch)
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
    this.stageTimer = window.setInterval(() => {
      if (this.isFrozen || this.branchResolved) return
      this.scenarioStage = (this.scenarioStage % 5) + 1
      const routine = JUN_ROUTINE[this.scenarioStage]
      if (routine) {
        this.walkingTarget = routine.pos
        if (this.junBubble) {
          this.junBubble.setText(routine.dialogue)
        }
      }
      // Alternate cashier routine
      if (this.cashierActor) {
        if (this.scenarioStage % 2 === 0) {
          this.cashierActor.setFacing('left')
        } else {
          this.cashierActor.setFacing('front')
        }
      }
      this.launch.bridge.emit('stageChanged', this.scenarioStage)
    }, 4500)
  }

  update(time: number, delta: number) {
    super.update(time, delta)

    // Dynamic movement for Jun when scenario is unfrozen
    if (!this.isFrozen && !this.branchResolved && this.junActor) {
      const arrived = this.junActor.stepTowards(this.walkingTarget, delta * 0.0018)
      if (arrived) {
        const routine = JUN_ROUTINE[this.scenarioStage]
        if (routine) this.junActor.setFacing(routine.facing)
      }
      // Keep Jun speech bubble positioned above him
      if (this.junBubble) {
        const p = project(this.junActor.position.x, this.junActor.position.y)
        this.junBubble.setPosition(p.x, p.y - 74)
      }
    }
  }

  toggleFreeze() {
    this.isFrozen = !this.isFrozen
    if (this.isFrozen) {
      sound.playFreeze()
    } else {
      sound.playUnfreeze()
    }
    this.updateFreezeVisuals()
    this.updateStatusBanner()
    this.launch.bridge.emit('freezeToggle', this.isFrozen)
  }

  executeBranchOutcome(branch: 'calm-refusal' | 'comply-lookout' | 'public-accusation' | 'staff-inquiry') {
    this.branchResolved = true
    if (this.isFrozen) this.toggleFreeze()

    if (branch === 'calm-refusal') {
      sound.playSuccessFanfare()
      // Jun de-escalates peacefully, puts item back on shelf, turns to counter
      this.walkingTarget = { x: 3.3, y: 3.2 }
      if (this.junBubble) {
        this.junBubble.setText('“You’re right... I was being pressured by the chat. I’ll pay for my snacks honestly.”')
      }
      this.time.delayedCall(1600, () => {
        this.walkingTarget = { x: 7.8, y: 5.2 }
        if (this.cashierBubble) {
          this.cashierBubble.setVisible(true).setText('Mr. Tan: “Thanks for being honest, boys. That’s $4.50!”')
        }
      })
    } else if (branch === 'comply-lookout') {
      sound.playAlarm()
      // Flash red screen, cashier rushes out
      if (this.freezeGraphics) {
        this.freezeGraphics.fillStyle(0xdc2626, 0.4)
        this.freezeGraphics.fillRect(0, 0, this.scale.gameSize.width, this.scale.gameSize.height)
        this.time.delayedCall(400, () => this.freezeGraphics?.clear())
      }
      if (this.cashierBubble) {
        this.cashierBubble.setVisible(true).setStyle({ backgroundColor: '#fee2e2', color: '#991b1b' })
          .setText('Mr. Tan: “HEY! Why are you blocking the entrance? What’s in that bag?!”')
      }
      if (this.junBubble) {
        this.junBubble.setText('“Oh no... the alarm went off! We’re in huge trouble!”')
      }
    } else if (branch === 'public-accusation') {
      sound.playAlarm()
      if (this.junBubble) {
        this.junBubble.setText('“Why did you yell that?! I didn’t even take it yet!”')
      }
      // Jun flees towards entrance
      this.walkingTarget = { x: 8.53, y: 7.66 }
      if (this.cashierBubble) {
        this.cashierBubble.setVisible(true).setText('Mr. Tan: “Stop! Everyone calm down, do not run!”')
      }
    } else if (branch === 'staff-inquiry') {
      sound.playClueDiscovered()
      if (this.cashierBubble) {
        this.cashierBubble.setVisible(true).setText('Mr. Tan: “Can I help you boys find the reserved items?”')
      }
      if (this.junBubble) {
        this.junBubble.setText('“Uh... yes Mr. Tan, just checking the battery prices!”')
      }
    }
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
      this.statusText.setText('⏸ TIME FROZEN — Walk around to inspect evidence & CCTV (Space to Resume)')
      this.statusText.setStyle({ color: '#7dd3fc', backgroundColor: 'rgba(8, 28, 48, 0.92)' })
    } else {
      this.statusText.setText('▶ SCENARIO RUNNING · Press SPACE or tap button to Freeze Time')
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
    const zoom = pixelZoom(Math.min((width - 24) / CUTAWAY_WIDTH, (height - top - bottom) / CUTAWAY_HEIGHT, 2))
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
