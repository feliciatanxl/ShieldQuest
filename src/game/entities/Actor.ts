import Phaser from 'phaser'
import type { Avatar, Facing } from '../../state/avatar'
import type { Point } from '../../state/saveGame'
import { AVATAR_HEIGHT, AVATAR_WIDTH, drawAvatar } from '../avatarArt'
import { depthAt, project } from '../isometric'

export class Actor {
  readonly sprite: Phaser.GameObjects.Image
  private shadow: Phaser.GameObjects.Ellipse
  private marker?: Phaser.GameObjects.Triangle
  private texture: Phaser.Textures.CanvasTexture
  private facing: Facing = 'front'
  private frame = 0
  private walked = 0

  constructor(scene: Phaser.Scene, key: string, private avatar: Avatar, public position: Point) {
    const texture = scene.textures.createCanvas(key, AVATAR_WIDTH, AVATAR_HEIGHT)
    if (!texture) throw new Error('Could not create an avatar texture')
    this.texture = texture
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.shadow = scene.add.ellipse(0, 0, 24, 10, 0x343246, .28)
    this.sprite = scene.add.image(0, 0, texture).setOrigin(.5, .95).setScale(1.35)
    if (key === 'player') {
      this.marker = scene.add.triangle(0, 0, 0, 0, 14, 0, 7, 11, 0x82d071)
        .setStrokeStyle(1.6, 0x2f592f).setOrigin(.5, 1)
    }
    this.repaint()
    this.place()
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.textures.remove(texture.key))
  }

  setAvatar(avatar: Avatar) {
    this.avatar = avatar
    this.repaint()
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
    this.marker?.setPosition(Math.round(x), Math.round(y - this.sprite.displayHeight - 4)).setDepth(depth + .01)
  }

  private repaint() {
    drawAvatar(this.texture.context, this.avatar, this.facing, this.frame)
    this.texture.refresh()
  }
}
