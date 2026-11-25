import { pixelZoom } from '../isometric'
import { HOUSE_I_BACKGROUND, HOUSE_I_SPAWN } from '../locations'
import { createHouseI } from '../houseIArt'
import { Actor } from '../entities/Actor'
import { residents } from '../residentData'
import { ExplorationScene, type Launch } from './ExplorationScene'
import { project } from '../isometric'
import { sound } from '../audio'
import type { Point } from '../../state/saveGame'

export class HouseIScene extends ExplorationScene {
  private amirActor?: Actor
  private mayActor?: Actor
  private junActor?: Actor
  private routineTimer?: number
  private caseSolved = false

  private amirTarget: Point = { x: 2.8, y: 3.5 }
  private mayTarget: Point = { x: 8.5, y: 3.5 }
  private junTarget: Point = { x: 8.5, y: 5.8 }

  private speechBubbles: Map<string, Phaser.GameObjects.Text> = new Map()

  constructor(launch: Launch) {
    super(launch, 'HouseI', HOUSE_I_SPAWN)
  }

  protected createWorld() {
    this.cameras.main.setBackgroundColor(HOUSE_I_BACKGROUND)
    return createHouseI(this)
  }

  create(data?: { position?: { x: number; y: number } }) {
    super.create(data)

    // Spawn witness and suspect actors in the investigation room
    this.amirActor = new Actor(this, 'whisper-actor-amir', residents.amir, { x: 2.8, y: 3.5 })
    this.mayActor = new Actor(this, 'whisper-actor-may', residents.may, { x: 8.5, y: 3.5 })
    this.junActor = new Actor(this, 'whisper-actor-jun', residents.jun, { x: 8.5, y: 5.8 })

    this.createSpeechBubble('amir', 2.8, 3.5, '“Check the chat logs on the terminal!”')
    this.createSpeechBubble('may', 8.5, 3.5, '“I heard it all at Kopi Corner...”')
    this.createSpeechBubble('jun', 8.5, 5.8, '“They said I was chicken if I didn’t do it...”')

    // Routine timer for moving witnesses between interview stations
    this.routineTimer = window.setInterval(() => {
      if (this.caseSolved) return
      // Amir paces between desk and evidence board
      if (this.amirTarget.x === 2.8) {
        this.amirTarget = { x: 4.5, y: 2.2 }
      } else {
        this.amirTarget = { x: 2.8, y: 3.5 }
      }

      // May walks between seating and filing cabinet
      if (this.mayTarget.x === 8.5) {
        this.mayTarget = { x: 7.2, y: 2.4 }
      } else {
        this.mayTarget = { x: 8.5, y: 3.5 }
      }
    }, 6000)

    const cleanups = [
      this.launch.bridge.on('scenarioBranch', () => {
        // Handle scenario signals
      }),
    ]

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      cleanups.forEach(c => c())
      if (this.routineTimer) clearInterval(this.routineTimer)
    })
  }

  private createSpeechBubble(key: string, gx: number, gy: number, text: string) {
    const p = project(gx, gy)
    const bubble = this.add.text(p.x, p.y - 72, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#1a1824',
      backgroundColor: '#fff7e8',
      padding: { x: 6, y: 3 },
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(2000)
    this.speechBubbles.set(key, bubble)
  }

  update(time: number, delta: number) {
    super.update(time, delta)

    // Move Amir along routine
    if (this.amirActor) {
      this.amirActor.stepTowards(this.amirTarget, delta * 0.0012)
      const b = this.speechBubbles.get('amir')
      if (b) {
        const p = project(this.amirActor.position.x, this.amirActor.position.y)
        b.setPosition(p.x, p.y - 72)
      }
    }

    // Move Auntie May along routine
    if (this.mayActor) {
      this.mayActor.stepTowards(this.mayTarget, delta * 0.001)
      const b = this.speechBubbles.get('may')
      if (b) {
        const p = project(this.mayActor.position.x, this.mayActor.position.y)
        b.setPosition(p.x, p.y - 72)
      }
    }

    // Jun glances nervously
    if (this.junActor) {
      const b = this.speechBubbles.get('jun')
      if (b) {
        const p = project(this.junActor.position.x, this.junActor.position.y)
        b.setPosition(p.x, p.y - 72)
      }
    }
  }

  onCaseSolved() {
    this.caseSolved = true
    sound.playSuccessFanfare()

    const amirB = this.speechBubbles.get('amir')
    if (amirB) amirB.setText('Amir: “I see it now... my exaggeration caused the dare!”').setStyle({ backgroundColor: '#ecfdf5', color: '#065f46' })

    const mayB = this.speechBubbles.get('may')
    if (mayB) mayB.setText('May: “Oh dear, I twisted Mr. Tan’s words without checking!”').setStyle({ backgroundColor: '#ecfdf5', color: '#065f46' })

    const junB = this.speechBubbles.get('jun')
    if (junB) junB.setText('Jun: “Thank you for proving it was an Ego Dare!”').setStyle({ backgroundColor: '#fef3c7', color: '#92400e' })
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const zoom = pixelZoom(Math.min(height / 420, width / 410, 2))
    const viewWidth = width / zoom
    const viewHeight = height / zoom
    const boundsWidth = Math.max(780, viewWidth)
    const boundsHeight = Math.max(520, viewHeight)
    this.cameras.main.setBounds(32 - boundsWidth / 2, 120 - boundsHeight / 2, boundsWidth, boundsHeight)
    this.focusCamera(zoom)
  }
}
