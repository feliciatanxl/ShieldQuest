import Phaser from 'phaser'
import type { Avatar } from '../../state/avatar'
import type { Point } from '../../state/saveGame'
import { Actor } from '../entities/Actor'
import { type GameBridge, type Hotspot } from '../events'
import { canStand, project, screenMovement } from '../isometric'
import { joystickSpeed } from '../joystick'
import { isResident, residents } from '../residentData'
import { SHOP_DOOR, SHOP_SPAWN, type Location } from '../locations'
import type { WorldLayout } from '../world'

export type Launch = {
  avatar: Avatar
  scene?: Location
  bridge: GameBridge
  position: Point
  preview?: boolean
  reducedMotion: boolean
}

type KeyName = 'W' | 'A' | 'S' | 'D' | 'UP' | 'LEFT' | 'DOWN' | 'RIGHT' | 'SHIFT'
const WALK_SPEED = 3.05
const RUN_SPEED = 5.25

export abstract class ExplorationScene extends Phaser.Scene {
  private world!: WorldLayout
  private player?: Actor
  private keys?: Record<KeyName, Phaser.Input.Keyboard.Key>
  private nearby: Hotspot | null = null
  private locked = false
  private transitioning = false
  private touch: Point = { x: 0, y: 0 }
  private checkpointTime = 0
  private travelled = 0
  private releaseScene?: () => void
  private cameraFocus?: Phaser.GameObjects.Zone

  constructor(protected launch: Launch, private location: Location, private fallback: Point) {
    super(location)
  }

  protected abstract createWorld(): WorldLayout

  detach() {
    this.locked = true
    this.releaseScene?.()
  }

  create(data?: { position?: Point }) {
    this.player = undefined
    this.keys = undefined
    this.cameraFocus = undefined
    this.nearby = null
    this.locked = false
    this.transitioning = false
    this.touch = { x: 0, y: 0 }
    this.checkpointTime = 0
    this.travelled = 0
    const { bridge, preview } = this.launch
    const cleanups: Array<() => void> = []
    this.world = this.createWorld()
    for (const { id, at } of this.world.hotspots) {
      if (isResident(id)) new Actor(this, 'resident-' + id, residents[id], at)
    }
    if (!preview) {
      const requested = data?.position ?? this.launch.position
      const spawn = canStand(requested, this.world.size, this.world.collisions) ? requested : this.fallback
      this.player = new Actor(this, 'player', this.launch.avatar, spawn)
      if (this.location !== 'Minimart') this.cameraFocus = this.add.zone(0, 0, 1, 1)
      this.moveCamera()
      const keys = this.input.keyboard
      if (keys) {
        this.keys = keys.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,SHIFT') as Record<KeyName, Phaser.Input.Keyboard.Key>
        keys.addKey('E').on('down', (_key: Phaser.Input.Keyboard.Key, event: KeyboardEvent) => {
          if (!event.repeat) this.interact()
        })
      }
      cleanups.push(
        bridge.on('lock', locked => {
          if (locked && this.travelled) this.checkpoint()
          this.locked = locked
          this.touch = { x: 0, y: 0 }
          keys?.resetKeys()
          if (locked) keys?.disableGlobalCapture()
          else keys?.enableGlobalCapture()
        }),
        bridge.on('action', () => this.interact()),
        bridge.on('houseTravel', ({ target, position }) => {
          if ((target === 'House' && (this.location === 'Neighbourhood' || this.location === 'House')) ||
              (target === 'Neighbourhood' && this.location === 'House')) this.changeLocation(target, position)
        }),
        bridge.on('direction', direction => { this.touch = this.locked || this.transitioning ? { x: 0, y: 0 } : direction }),
        bridge.on('motion', motion => {
          this.launch.reducedMotion = motion
          this.follow()
        }),
        bridge.on('avatar', avatar => {
          this.launch.avatar = avatar
          this.player?.setAvatar(avatar)
        }),
      )
      this.checkpoint()
      bridge.emit('ready', undefined)
      if (data?.position && !this.launch.reducedMotion) {
        this.transitioning = true
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => this.finishArrival())
        this.cameras.main.fadeIn(240, 25, 20, 31)
      } else {
        this.finishArrival()
        if (!this.launch.reducedMotion) this.cameras.main.fadeIn(240, 25, 20, 31)
      }
    }
    this.layout()
    const scale = this.scale
    const events = this.events
    scale.on(Phaser.Scale.Events.RESIZE, this.layout, this)
    cleanups.push(() => scale.off(Phaser.Scale.Events.RESIZE, this.layout, this))
    const release = () => {
      cleanups.forEach(cleanup => cleanup())
      events.off(Phaser.Scenes.Events.SHUTDOWN, release)
      events.off(Phaser.Scenes.Events.DESTROY, release)
      this.releaseScene = undefined
    }
    this.releaseScene = release
    events.once(Phaser.Scenes.Events.SHUTDOWN, release)
    events.once(Phaser.Scenes.Events.DESTROY, release)
  }

  private follow() {
    if (!this.cameraFocus) return
    const speed = this.launch.reducedMotion ? 1 : .085
    this.cameras.main.startFollow(this.cameraFocus, true, speed, speed)
  }

  private moveCamera() {
    if (!this.player || !this.cameraFocus) return
    const point = project(this.player.position.x, this.player.position.y)
    this.cameraFocus.setPosition(point.x, point.y - 38)
  }

  protected layout() {
    const { width, height } = this.scale.gameSize
    const camera = this.cameras.main
    if (this.launch.preview) {
      const zoom = Math.max(width / 1180, height / 730) * 1.12
      camera.setZoom(zoom).centerOn(35, 295)
    } else if (this.cameraFocus) {
      this.focusCamera(Phaser.Math.Clamp(Math.min(width / 920, height / 600), .87, 1.52))
    }
  }

  protected focusCamera(zoom: number) {
    if (!this.cameraFocus) return
    this.cameras.main.setZoom(zoom).centerOn(this.cameraFocus.x, this.cameraFocus.y)
    this.follow()
  }

  update(_time: number, delta: number) {
    const { player, keys } = this
    if (!player) return
    if (this.locked || this.transitioning) {
      player.move(player.position, 0, this.touch)
      return
    }
    const touchStrength = Math.min(1, Math.hypot(this.touch.x, this.touch.y))
    let { x: sx, y: sy } = this.touch
    if (!touchStrength && keys) {
      sx = Number(keys.D.isDown || keys.RIGHT.isDown) - Number(keys.A.isDown || keys.LEFT.isDown)
      sy = Number(keys.S.isDown || keys.DOWN.isDown) - Number(keys.W.isDown || keys.UP.isDown)
    }
    const direction = screenMovement(sx, sy, 1)
    const speed = touchStrength ? joystickSpeed(touchStrength, WALK_SPEED, RUN_SPEED) : keys?.SHIFT.isDown ? RUN_SPEED : WALK_SPEED
    const step = Math.min(delta, 50) / 1000 * speed
    const { x, y } = player.position
    const next = { x, y }
    const dx = direction.x * step
    const dy = direction.y * step
    if (canStand({ x: x + dx, y }, this.world.size, this.world.collisions)) next.x += dx
    if (canStand({ x: next.x, y: y + dy }, this.world.size, this.world.collisions)) next.y += dy
    const moved = Math.hypot(next.x - x, next.y - y)
    player.move(next, moved, { x: sx, y: sy })
    if (moved) {
      this.travelled += moved
      this.moveCamera()
      this.updateProximity()
      this.checkpointTime += delta
    }
    if (this.travelled && (this.checkpointTime >= 120 || !moved)) this.checkpoint()
  }

  private checkpoint() {
    if (!this.player) return
    this.launch.bridge.emit('checkpoint', { scene: this.location, position: this.player.position, distance: this.travelled })
    this.travelled = 0
    this.checkpointTime = 0
  }

  private updateProximity() {
    if (!this.player) return
    const { x, y } = this.player.position
    let closest: Hotspot | null = null
    let distance = Infinity
    for (const hotspot of this.world.hotspots) {
      const candidate = Math.hypot(hotspot.at.x - x, hotspot.at.y - y)
      if (candidate <= hotspot.radius && candidate < distance) {
        closest = hotspot
        distance = candidate
      }
    }
    if (closest?.id !== this.nearby?.id) {
      this.nearby = closest
      this.launch.bridge.emit('proximity', closest)
    }
  }

  private interact() {
    if (this.locked || this.transitioning || !this.nearby) return
    if (this.travelled) this.checkpoint()
    const { id } = this.nearby
    if (id === 'enter') this.changeLocation('Minimart', SHOP_SPAWN)
    else if (id === 'exit') this.changeLocation('Neighbourhood', SHOP_DOOR)
    else this.launch.bridge.emit('interact', id)
  }

  private finishArrival() {
    this.transitioning = false
    this.launch.bridge.emit('transition', false)
    this.updateProximity()
  }

  private changeLocation(target: Location, position: Point) {
    if (this.transitioning) return
    const { bridge, reducedMotion } = this.launch
    this.transitioning = true
    this.touch = { x: 0, y: 0 }
    bridge.emit('proximity', null)
    bridge.emit('transition', true)
    const change = () => {
      if (target === this.location) this.scene.restart({ position })
      else this.scene.start(target, { position })
    }
    if (reducedMotion) change()
    else {
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, change)
      this.cameras.main.fadeOut(240, 25, 20, 31)
    }
  }
}

