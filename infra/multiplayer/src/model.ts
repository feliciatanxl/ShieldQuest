import type { Profile, RoomView } from '../../../src/multiplayer/protocol'

export const staleMs = 45_000
export const graceMs = 60_000
export const idleMs = 30 * 60_000
export const maxRoomMs = 2 * 60 * 60_000
export const sessionMs = 3 * 60 * 60_000
export const ttl = (ms: number) => Math.ceil(ms / 1000)

export type Member = Profile & {
  id: string
  sessionId: string
  connectionId: string
  role: 'host' | 'guest'
  lastSeen: number
  offlineAt?: number
  ready: boolean
}

type RecordBase = { pk: string; rev: number; ttl: number }
export type Room = RecordBase & {
  kind: 'room'
  id: string
  code: string
  hostId: string
  status: RoomView['status']
  version: number
  createdAt: number
  expiresAt: number
  members: Member[]
}
export type Binding = RecordBase & {
  kind: 'binding'
  sessionId: string
  connectedAt: number
  lastActivity: number
}
export type RoomRef = { code: string; id: string }
export type Receipt = { id: string; signature: string }
export type Session = RecordBase & {
  kind: 'session'
  id: string
  playerId: string
  connectionId: string
  tokenHash: string
  expiresAt: number
  room?: RoomRef
  recent: Receipt[]
}

export type Entity = Room | Binding | Session
export type Mutation = { pk: string; before?: Entity; after?: Entity; check?: true }
export interface Store {
  get(pk: string): Promise<Entity | undefined>
  commit(mutations: Mutation[]): Promise<boolean>
  allow(key: string, now: number, limit: number): Promise<boolean>
}

export const roomKey = (code: string) => 'R#' + code
export const sessionKey = (id: string) => 'S#' + id
export const connectionKey = (id: string) => 'C#' + id
export const replace = (before: Entity | undefined, after: Entity): Mutation => ({
  pk: after.pk, before, after: { ...after, rev: (before?.rev ?? 0) + 1 },
})
export const verify = (before: Entity): Mutation => ({ pk: before.pk, before, check: true })
export const connected = (member: Member, now: number) => member.offlineAt === undefined && now < member.lastSeen + staleMs
export const reference = (room: Room): RoomRef => ({ id: room.id, code: room.code })

export function makeRoom(id: string, code: string, host: Member, now: number): Room {
  return {
    pk: roomKey(code), kind: 'room', rev: 0, ttl: ttl(now + idleMs) + 600,
    id, code, hostId: host.id, status: 'WAITING', version: 1,
    createdAt: now, expiresAt: now + idleMs, members: [host],
  }
}

export function closeRoom(room: Room, now: number): Room {
  return { ...room, status: 'CLOSED', version: room.version + 1, expiresAt: now, ttl: ttl(now) + 600 }
}

export function reconcile(room: Room, now: number): Room {
  if (room.status === 'CLOSED') return room
  if (now >= room.expiresAt) return closeRoom(room, now)
  const members = room.members.flatMap(member => {
    const offlineAt = member.offlineAt ?? member.lastSeen + staleMs
    if (now >= offlineAt + graceMs) return []
    if (now >= offlineAt && member.offlineAt === undefined) return [{ ...member, offlineAt, ready: false }]
    return [member]
  })
  if (!members.some(member => member.id === room.hostId) ||
      (room.status !== 'WAITING' && members.length < 2)) return closeRoom(room, now)
  if (members.length === room.members.length && members.every((member, index) => member === room.members[index])) return room
  return { ...room, members, version: room.version + 1 }
}

export function touchMember(room: Room, member: Member, connectionId: string, now: number): Room {
  const reconnected = member.offlineAt !== undefined || member.connectionId !== connectionId
  const expiresAt = Math.min(room.createdAt + maxRoomMs, now + idleMs)
  const { offlineAt: _offlineAt, ...online } = member
  return {
    ...room, expiresAt, ttl: ttl(expiresAt) + 600, version: room.version + Number(reconnected),
    members: room.members.map(candidate => candidate.id === member.id
      ? { ...online, connectionId, lastSeen: now, ready: reconnected ? false : member.ready } : candidate),
  }
}

export function mayStart(room: Room, playerId: string, now: number) {
  return room.status === 'WAITING' && room.hostId === playerId && room.members.length === 2 &&
    room.members.every(member => connected(member, now) && member.ready)
}

export function roomView(room: Room, now: number): RoomView {
  return {
    id: room.id, code: room.code, status: room.status, version: room.version, expiresAt: room.expiresAt,
    players: room.members.map(member => {
      const { id, role, name, avatar, ready } = member
      const online = room.status !== 'CLOSED' && connected(member, now)
      return { id, role, name, avatar, connected: online, ready: online && ready }
    }),
  }
}
