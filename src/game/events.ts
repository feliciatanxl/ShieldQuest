import type { Avatar } from '../state/avatar'
import type { Point } from '../state/saveGame'
import type { ClueId } from '../state/investigation'
import type { Location } from './locations'

export type ResidentId = 'may' | 'amir' | 'jun' | 'cashier'
export type HotspotId = ResidentId | ClueId | 'enter' | 'exit'
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
