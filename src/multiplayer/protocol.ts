import { normalizeAvatar, type Avatar } from '../state/avatar'

export const protocolVersion = 1
export const codeAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
export const roomCodePattern = new RegExp(`^[${codeAlphabet}]{6}$`)
export const heartbeatMs = 15_000

export type Profile = { name: string; avatar: Avatar }
export type RoomPlayer = Profile & { id: string; role: 'host' | 'guest'; connected: boolean; ready: boolean }
export type RoomView = {
  id: string
  code: string
  status: 'WAITING' | 'STARTING' | 'IN_GAME' | 'CLOSED'
  version: number
  expiresAt: number
  players: RoomPlayer[]
}

export type SessionCredential = { sessionId: string; resumeToken: string }
export type Intent =
  | { type: 'HELLO' }
  | { type: 'RESUME'; credential: SessionCredential }
  | { type: 'CREATE_ROOM'; profile: Profile }
  | { type: 'JOIN_ROOM'; code: string; profile: Profile }
  | { type: 'SET_READY'; ready: boolean }
  | { type: 'START_GAME' }
  | { type: 'LEAVE_ROOM' }
  | { type: 'HEARTBEAT' }

export type Request = Intent & { v: 1; requestId: string }
export type RoomEvent = 'ROOM_CREATED' | 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'PLAYER_READY_CHANGED' |
  'PLAYER_CONNECTION_CHANGED' | 'ROOM_UPDATED' | 'GAME_STARTED' | 'ROOM_CLOSED'
type EventHeader = { v: 1; requestId?: string; roomId: string | null; stateVersion: number }
export type ServerEvent = EventHeader & (
  | { type: RoomEvent; room: RoomView | null }
  | { type: 'SESSION'; playerId: string; credential?: SessionCredential; room: RoomView | null }
  | { type: 'ERROR'; code: string; message: string }
)

// Reserved shapes for the next phase. These are neither sent nor persisted by the lobby.
export type SharedCaseState = {
  evidenceNotebook: string[]
  completedPuzzles: string[]
  unlockedDoors: string[]
  safeUnlocked: boolean
  escapeCompleted: boolean
}
export type CasePlayerState = {
  playerId: string
  physicalItems: string[]
  keys: string[]
  position: { x: number; y: number }
  appearance: Avatar
}

const stringId = /^[a-zA-Z0-9_-]{16,64}$/
const tokenPattern = /^[a-zA-Z0-9_-]{43}$/
export function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function readProfile(value: unknown): Profile | null {
  if (!record(value) || typeof value.name !== 'string' || value.name.length > 48 || !record(value.avatar)) return null
  const name = value.name.normalize('NFC').trim().replace(/ {2,}/g, ' ')
  if (!/^[\p{L}\p{N}][\p{L}\p{M}\p{N} _'-]{0,23}$/u.test(name)) return null
  const avatar = normalizeAvatar(value.avatar)
  return avatar ? { name, avatar } : null
}

export function parseRequest(value: unknown): Request | null {
  if (!record(value) || value.v !== protocolVersion || typeof value.requestId !== 'string' || !stringId.test(value.requestId)) return null
  const header = { v: protocolVersion, requestId: value.requestId } as const
  switch (value.type) {
    case 'HELLO': case 'START_GAME': case 'LEAVE_ROOM': case 'HEARTBEAT':
      return { ...header, type: value.type }
    case 'SET_READY':
      return typeof value.ready === 'boolean' ? { ...header, type: value.type, ready: value.ready } : null
    case 'CREATE_ROOM': case 'JOIN_ROOM': {
      const profile = readProfile(value.profile)
      if (!profile) return null
      if (value.type === 'CREATE_ROOM') return { ...header, type: value.type, profile }
      return typeof value.code === 'string' && roomCodePattern.test(value.code)
        ? { ...header, type: value.type, profile, code: value.code } : null
    }
    case 'RESUME': {
      const credential = value.credential
      if (!record(credential) || typeof credential.sessionId !== 'string' || !stringId.test(credential.sessionId) ||
          typeof credential.resumeToken !== 'string' || !tokenPattern.test(credential.resumeToken)) return null
      return { ...header, type: value.type, credential: { sessionId: credential.sessionId, resumeToken: credential.resumeToken } }
    }
    default: return null
  }
}
