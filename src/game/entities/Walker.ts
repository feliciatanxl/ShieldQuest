import type Phaser from 'phaser'
import { baseAvatar } from '../../state/avatar'
import type { Point } from '../../state/saveGame'
import { Actor } from './Actor'

const SPEED = 1.15
const NEAR_PLAYER = .6

/** A resident strolling back and forth along a route, pausing now and then and waiting for the player to pass. */
export class Walker {
  readonly actor: Actor
  private next = 1
  private step = 1
  private wait: number

  constructor(scene: Phaser.Scene, id: string, texture: string, private path: Point[]) {
    this.actor = new Actor(scene, 'walker-' + id, baseAvatar, { ...path[0] }, texture)
    this.wait = Math.random() * 2000
  }

  get position() { return this.actor.position }

  update(delta: number, player?: Point) {
    const at = this.actor.position
    if (this.wait > 0 || (player && Math.hypot(player.x - at.x, player.y - at.y) < NEAR_PLAYER)) {
      this.wait -= delta
      this.actor.move(at, 0, { x: 0, y: 0 })
      return
    }
    if (!this.actor.stepTowards(this.path[this.next], SPEED * Math.min(delta, 50) / 1000)) return
    if (this.next + this.step < 0 || this.next + this.step >= this.path.length) {
      this.step = -this.step
      this.wait = 1500 + Math.random() * 2500
    } else if (Math.random() < .25) this.wait = 600 + Math.random() * 1400
    this.next += this.step
  }
}
