import { normalizeAvatar, type Avatar } from './avatar'
import { NEIGHBOURHOOD_SIZE, HOUSE_SIZE, HOUSE_SPAWN, HOUSE_H_SIZE, HOUSE_H_SPAWN, HOUSE_I_SIZE, HOUSE_I_SPAWN, FREEZE_FRAME_SIZE, FREEZE_FRAME_SPAWN, SHOP_SIZE, type Location } from '../game/locations'
import { houseCollisions } from '../game/houseLayout'
import { canStand } from '../game/isometric'
import { newEscapeRoom, readEscapeRoom, type EscapeRoomProgress } from './escapeRoom'
import { newInvestigation, validInvestigation, type Investigation } from './investigation'
import { readSpotResult } from './spotTheRisk'
import { readHoldResult } from './holdBeforeActing'
import { readInfluenceResult } from './identifyTheInfluence'
import { readConsequencesResult } from './evaluateConsequences'
import { readLeadResult } from './leadTheRightChoice'
import { readDefendResult } from './defendYourCommunity'
import { readCollectedGuardians, type GuardianId } from './guardians'
import type { ShieldProgress } from './shield'
import { readName } from '../multiplayer/protocol'

export type Point = { x: number; y: number }
export type Save = {
  version: 3
  name: string
  avatar: Avatar
  scene: Location
  investigation: Investigation
  shield: ShieldProgress
  collectedGuardians: GuardianId[]
  escapeRoom: EscapeRoomProgress
  position: Point
  walked: number
  tutorial: 'active' | 'done' | 'skipped'
  coins: number
  reducedMotion: boolean
}

export const SAVE_KEY = 'shieldquest.phase1'
export const WALK_GOAL = 3
export const START = { x: 10.6, y: 10.55 }
/** Shown for saves made before players chose a name. */
export const DEFAULT_NAME = 'Player'

export function newSave(avatar: Avatar, name: string): Save {
  return { version: 3, name, avatar, scene: 'Neighbourhood', investigation: newInvestigation(), shield: {}, collectedGuardians: [], escapeRoom: newEscapeRoom(),
    position: START, walked: 0, tutorial: 'active', coins: 240, reducedMotion: false }
}

export function readSave(): Save | null {
  try {
    const data: (Partial<Omit<Save, 'version'>> & { version?: number }) | null =
      JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null')
    if (!data || (data.version !== 1 && data.version !== 2 && data.version !== 3) || !data.avatar || !data.position) return null
    const { position, walked, coins, tutorial, reducedMotion } = data
    const avatar = normalizeAvatar(data.avatar)
    if (!avatar) return null
    const scene = data.version === 1 ? 'Neighbourhood' : data.scene
    if (scene !== 'Neighbourhood' && scene !== 'Minimart' && scene !== 'HouseH' && scene !== 'HouseI' && scene !== 'FreezeFrame' && !(data.version === 3 && scene === 'House')) return null
    const investigation = data.version === 1 ? newInvestigation() : data.investigation
    if (!validInvestigation(investigation)) return null
    const size = scene === 'Minimart' ? SHOP_SIZE : scene === 'House' ? HOUSE_SIZE : scene === 'HouseH' ? HOUSE_H_SIZE : scene === 'HouseI' ? HOUSE_I_SIZE : scene === 'FreezeFrame' ? FREEZE_FRAME_SIZE : NEIGHBOURHOOD_SIZE
    if (scene !== 'House' && scene !== 'HouseH' && scene !== 'HouseI' && scene !== 'FreezeFrame' && (!Number.isFinite(position.x) || !Number.isFinite(position.y) ||
        position.x < 0 || position.y < 0 || position.x >= size.x || position.y >= size.y)) return null
    if (typeof walked !== 'number' || !Number.isFinite(walked) || walked < 0 || walked > WALK_GOAL) return null
    if (typeof coins !== 'number' || !Number.isSafeInteger(coins) || coins < 0) return null
    if (tutorial !== 'active' && tutorial !== 'done' && tutorial !== 'skipped') return null
    if (typeof reducedMotion !== 'boolean') return null
    const shield: ShieldProgress = {}
    if (data.version === 3) {
      const spot = readSpotResult(data.shield?.S)
      const hold = readHoldResult(data.shield?.H)
      const influence = readInfluenceResult(data.shield?.I)
      const consequences = readConsequencesResult(data.shield?.E)
      const lead = readLeadResult(data.shield?.L)
      const defend = readDefendResult(data.shield?.D)
      if (spot) shield.S = spot
      if (hold) shield.H = hold
      if (influence) shield.I = influence
      if (consequences) shield.E = consequences
      if (lead) shield.L = lead
      if (defend) shield.D = defend
    }
    const collectedGuardians = readCollectedGuardians(data.collectedGuardians, shield)
    const escapeRoom = readEscapeRoom(data.escapeRoom)
    const housePosition = scene === 'House' ? position : data.escapeRoom?.position
    if (housePosition && Number.isFinite(housePosition.x) && Number.isFinite(housePosition.y) &&
        canStand(housePosition, HOUSE_SIZE, houseCollisions)) escapeRoom.position = housePosition
    return { version: 3, name: readName(data.name) ?? DEFAULT_NAME, avatar, scene, investigation, shield, collectedGuardians, escapeRoom,
      position: scene === 'House' ? escapeRoom.position ?? HOUSE_SPAWN : scene === 'HouseH' ? HOUSE_H_SPAWN : scene === 'HouseI' ? HOUSE_I_SPAWN : scene === 'FreezeFrame' ? FREEZE_FRAME_SPAWN : position, walked, tutorial, coins, reducedMotion }
  } catch {
    return null
  }
}

export function writeSave(save: Save): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    return true
  } catch {
    return false
  }
}
