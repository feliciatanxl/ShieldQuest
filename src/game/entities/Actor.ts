import Phaser from 'phaser'
import type { Avatar, Facing } from '../../state/avatar'
import type { Point } from '../../state/saveGame'
import { CELL, FEET_Y, RUN_START, WALK_FRAMES, drawPlayer, rows } from '../playerArt'
import { project } from '../isometric'
import { coverFor } from '../hdbBlock'

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
  private avatarRevision = 0
  private sheet = false
  private ghost?: Phaser.GameObjects.Image
  /** Navy copy masked by a block's upper floors: shows only the parts of the actor that building covers. */
  private silhouette?: Phaser.GameObjects.Image
  private facing: Facing = 'front'
  private frame = 0
  private walked = 0

  /** staticTexture: a pre-drawn PixelLab sprite used instead of the avatar when loaded: a single standing image, or a
   *  walking sheet laid out like the player base sheets (8 facing rows of standing, walk and run frames).
   *  label: the name tag shown under the player. */
  constructor(scene: Phaser.Scene, key: string, private avatar: Avatar, public position: Point, staticTexture?: string, label?: string) {
    this.shadow = scene.add.ellipse(0, 0, 24, 10, 0x343246, .28)
    if (staticTexture && scene.textures.exists(staticTexture)) {
      this.sheet = scene.textures.get(staticTexture).frameTotal > 2
      this.sprite = scene.add.image(0, 0, staticTexture).setOrigin(.5, this.sheet ? FEET_Y / CELL : .97)
    } else {
      const texture = scene.textures.createCanvas(`${scene.scene.key}-${key}`, CELL, CELL)
      if (!texture) throw new Error('Could not create an avatar texture')
      this.texture = texture
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
      this.sprite = scene.add.image(0, 0, texture).setOrigin(.5, FEET_Y / CELL)
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { if (this.texture) scene.textures.remove(this.texture.key) })
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
    if (this.texture) {
      // Rebind every visible layer to a fresh texture when changing looks. This also
      // avoids retaining a previous appearance in a cached WebGL texture/frame.
      const previous = this.texture
      const next = this.sprite.scene.textures.createCanvas(`${this.sprite.scene.scene.key}-avatar-${++this.avatarRevision}`, CELL, CELL)
      if (next) {
        next.setFilter(Phaser.Textures.FilterMode.NEAREST)
        this.texture = next
        this.repaint()
        this.sprite.setTexture(next.key)
        this.ghost?.setTexture(next.key)
        this.silhouette?.setTexture(next.key)
        this.sprite.scene.textures.remove(previous.key)
        return
      }
    }
    this.repaint()
  }

  /** A see-through copy drawn over everything, shown while a tall building stands between the camera and the actor. */
  setGhost(on: boolean) {
    if (on && !this.ghost) {
      this.ghost = this.sprite.scene.add.image(0, 0, this.sprite.texture.key, this.sprite.frame.name)
        .setOrigin(this.sprite.originX, this.sprite.originY).setAlpha(.5).setDepth(1e6 - 1)
        .setScale(this.sprite.scaleX,this.sprite.scaleY)
      this.place()
    }
    this.ghost?.setVisible(on)
  }

  private cover(silhouette?: { mask: Phaser.Display.Masks.BitmapMask; depth: number }) {
    if (!silhouette) { this.silhouette?.setVisible(false); return }
    if (!this.silhouette) {
      this.silhouette = this.sprite.scene.add.image(0, 0, this.sprite.texture.key, this.sprite.frame.name)
        .setOrigin(this.sprite.originX, this.sprite.originY).setTintFill(0x22344a).setAlpha(.62)
    }
    if (this.silhouette.mask !== silhouette.mask) this.silhouette.setMask(silhouette.mask)
    this.silhouette.setDepth(silhouette.depth).setVisible(true)
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
    const cover = coverFor(this.sprite.scene, this.position), depth = cover.depth
    this.cover(cover.silhouette)
    this.shadow.setPosition(x, y - 1).setDepth(depth - .01)
    this.sprite.setPosition(Math.round(x), Math.round(y)).setDepth(depth)
    this.ghost?.setPosition(this.sprite.x, this.sprite.y)
    this.silhouette?.setPosition(this.sprite.x, this.sprite.y)
    // The name tag stays readable above roofs and trees in front of the player.
    this.marker?.setPosition(Math.round(x), Math.round(y + 4)).setDepth(1e6)
  }

  private repaint() {
    if (this.sheet) this.sprite.setFrame(rows[this.facing] * (RUN_START + WALK_FRAMES) + this.frame)
    if (this.sheet) this.ghost?.setFrame(this.sprite.frame.name)
    if (this.sheet) this.silhouette?.setFrame(this.sprite.frame.name)
    if (!this.texture) return
    this.texture.context.clearRect(0, 0, CELL, CELL)
    drawPlayer(this.texture.context, this.avatar, this.facing, this.frame)
    this.texture.refresh()
  }
}
