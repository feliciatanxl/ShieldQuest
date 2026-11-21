import Phaser from 'phaser'
import type { Avatar, Facing } from '../../state/avatar'
import type { Point } from '../../state/saveGame'
import { AVATAR_HEIGHT, AVATAR_WIDTH, drawAvatar } from '../avatarArt'
import { depthAt, project } from '../isometric'

export class Actor {
  readonly sprite: Phaser.GameObjects.Image
  private shadow: Phaser.GameObjects.Ellipse
  private marker?: Phaser.GameObjects.Text
  private texture?: Phaser.Textures.CanvasTexture
  private facing: Facing = 'front'
  private frame = 0
  private walked = 0

  /** staticTexture: a pre-drawn standing sprite (PixelLab NPC) used instead of the animated avatar when loaded. */
  constructor(scene: Phaser.Scene, key: string, private avatar: Avatar, public position: Point, staticTexture?: string) {
    this.shadow = scene.add.ellipse(0, 0, 24, 10, 0x343246, .28)
    if (staticTexture && scene.textures.exists(staticTexture)) {
      this.sprite = scene.add.image(0, 0, staticTexture).setOrigin(.5, .97)
    } else {
      const texture = scene.textures.createCanvas(key, AVATAR_WIDTH, AVATAR_HEIGHT)
      if (!texture) throw new Error('Could not create an avatar texture')
      this.texture = texture
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
      this.sprite = scene.add.image(0, 0, texture).setOrigin(.5, .95).setScale(1.35)
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.textures.remove(texture.key))
    }
    this.sprite.setName('character').setData('player', key === 'player')
    if (key === 'player') {
      this.marker = scene.add.text(0, 0, 'YOU', {
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
      this.move(target, dist, { x: dx, y: dy })
      return true
    }
    const ratio = stepSize / dist
    const newPos = { x: this.position.x + dx * ratio, y: this.position.y + dy * ratio }
    this.move(newPos, stepSize, { x: dx, y: dy })
    return false
  }

  move(position: Point, distance: number, screenDirection: Point) {
    this.position = position
    this.place()
    if (!distance) this.walked = 0
    else this.walked += distance
    const frame = Math.floor(this.walked * 8) % 4
    const facing: Facing = !distance ? this.facing :
      Math.abs(screenDirection.x) > Math.abs(screenDirection.y) ? (screenDirection.x < 0 ? 'left' : 'right') :
      screenDirection.y < 0 ? 'back' : 'front'
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
    this.marker?.setPosition(Math.round(x), Math.round(y + 4)).setDepth(depth + .01)
  }

  private repaint() {
    if (!this.texture) return
    drawAvatar(this.texture.context, this.avatar, this.facing, this.frame)
    this.texture.refresh()
  }
}
