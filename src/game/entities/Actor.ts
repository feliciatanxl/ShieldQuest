import Phaser from 'phaser'
import type { Avatar, Facing } from '../../state/avatar'
import type { Point } from '../../state/saveGame'
import { CELL, FEET_Y, RUN_START, WALK_FRAMES, drawPlayer } from '../playerArt'
import { depthAt, project } from '../isometric'

// Eight 45° sectors of on-screen movement, clockwise from right (screen y points down, towards the viewer).
const sectors: Facing[] = ['right', 'front-right', 'front', 'front-left', 'left', 'back-left', 'back', 'back-right']
const facingFor = ({ x, y }: Point): Facing => sectors[Math.round(Math.atan2(y, x) / (Math.PI / 4)) & 7]
// A grid step as seen on screen: isometric tiles run right-down for x and left-down for y.
const onScreen = (dx: number, dy: number): Point => ({ x: dx - dy, y: (dx + dy) / 2 })

export class Actor {
  readonly sprite: Phaser.GameObjects.Image
  private shadow: Phaser.GameObjects.Ellipse
  private marker?: Phaser.GameObjects.Text
  private texture?: Phaser.Textures.CanvasTexture
  private facing: Facing = 'front'
  private frame = 0
  private walked = 0

  /** staticTexture: a pre-drawn standing sprite (PixelLab NPC) used instead of the animated avatar when loaded.
   *  label: the name tag shown under the player. */
  constructor(scene: Phaser.Scene, key: string, private avatar: Avatar, public position: Point, staticTexture?: string, label?: string) {
    this.shadow = scene.add.ellipse(0, 0, 24, 10, 0x343246, .28)
    if (staticTexture && scene.textures.exists(staticTexture)) {
      this.sprite = scene.add.image(0, 0, staticTexture).setOrigin(.5, .97)
    } else {
      const texture = scene.textures.createCanvas(key, CELL, CELL)
      if (!texture) throw new Error('Could not create an avatar texture')
      this.texture = texture
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
      this.sprite = scene.add.image(0, 0, texture).setOrigin(.5, FEET_Y / CELL)
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.textures.remove(texture.key))
    }
    this.sprite.setName('character').setData('player', key === 'player')
    if (key === 'player') {
      this.marker = scene.add.text(0, 0, label || 'YOU', {
        fontFamily: 'Outfit, sans-serif', fontSize: '9px', fontStyle: 'bold',
        color: '#fff7e8', backgroundColor: '#236d69', padding: { x: 4, y: 1 },
      }).setOrigin(.5, 0)
    }
    this.repaint()
    this.place()
  }

  setAvatar(avatar: Avatar) {
    this.avatar = avatar
    this.repaint()
  }

  setLabel(text: string) {
    this.marker?.setText(text)
  }

  setFacing(facing: Facing) {
    if (this.facing !== facing) {
      this.facing = facing
      this.repaint()
    }
  }

  stepTowards(target: Point, stepSize: number): boolean {
    const dx = target.x - this.position.x
    const dy = target.y - this.position.y
    const dist = Math.hypot(dx, dy)
    if (dist <= stepSize || dist === 0) {
      this.move(target, dist, onScreen(dx, dy))
      return true
    }
    const ratio = stepSize / dist
    const newPos = { x: this.position.x + dx * ratio, y: this.position.y + dy * ratio }
    this.move(newPos, stepSize, onScreen(dx, dy))
    return false
  }

  move(position: Point, distance: number, screenDirection: Point, running = false) {
    this.position = position
    this.place()
    if (!distance) this.walked = 0
    else this.walked += distance
    // Running strides cover more ground per frame than walking ones.
    const frame = !distance ? 0 : running ? RUN_START + Math.floor(this.walked * 4.5) % WALK_FRAMES : 1 + Math.floor(this.walked * 7) % WALK_FRAMES
    const facing: Facing = !distance ? this.facing : facingFor(screenDirection)
    if (frame !== this.frame || facing !== this.facing) {
      this.frame = frame
      this.facing = facing
      this.repaint()
    }
  }

  private place() {
    const { x, y } = project(this.position.x, this.position.y)
    const depth = depthAt(this.position.x, this.position.y)
    this.shadow.setPosition(x, y - 1).setDepth(depth - .01)
    this.sprite.setPosition(Math.round(x), Math.round(y)).setDepth(depth)
    // The name tag stays readable above roofs and trees in front of the player.
    this.marker?.setPosition(Math.round(x), Math.round(y + 4)).setDepth(1e6)
  }

  private repaint() {
    if (!this.texture) return
    this.texture.context.clearRect(0, 0, CELL, CELL)
    drawPlayer(this.texture.context, this.avatar, this.facing, this.frame)
    this.texture.refresh()
  }
}
