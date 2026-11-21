import type { Avatar } from '../state/avatar'
import type { Point } from '../state/saveGame'
import type { ClueId } from '../state/investigation'
import type { Location } from './locations'
import type { HouseObjectId } from './houseLayout'

export type ResidentId = 'may' | 'amir' | 'jun' | 'cashier'
export type HotspotId =
  | ResidentId
  | ClueId
  | HouseObjectId
  | 'enter'
  | 'exit'
  | 'house-entrance'
  | 'house-h-entrance'
  | 'exit-house-h'
  | 'freeze-station'
  | 'exit-freeze-frame'
  | 'ff-backpack'
  | 'ff-cctv'
  | 'ff-basket'
  | 'ff-counter'
  | 'ff-door'
  | 'ff-jun'
  | 'ff-cashier'
  | 'ff-action'
  | 'house-i-entrance'
  | 'exit-house-i'
  | 'whisper-station'
  | 'whisper-amir'
  | 'whisper-may'
  | 'whisper-jun'
  | 'whisper-terminal'
  | 'whisper-board'
export type Hotspot = { id: HotspotId; label: string; at: Point; radius: number }

type GameEvents = {
  proximity: Hotspot | null
  interact: HotspotId
  checkpoint: { scene: Location; position: Point; distance: number }
  transition: boolean
  ready: undefined
  lock: boolean
  avatar: Avatar
  motion: boolean
  action: undefined
  direction: Point
  houseTravel: { target: Location; position: Point }
}

export class GameBridge {
  private target = new EventTarget()

  emit<K extends keyof GameEvents>(event: K, detail: GameEvents[K]) {
    this.target.dispatchEvent(new CustomEvent(event, { detail }))
  }

  on<K extends keyof GameEvents>(event: K, listener: (detail: GameEvents[K]) => void) {
    const handler = (incoming: Event) => listener((incoming as CustomEvent<GameEvents[K]>).detail)
    this.target.addEventListener(event, handler)
    return () => this.target.removeEventListener(event, handler)
  }
}
