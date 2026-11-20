import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import {
  codeAlphabet, parseRequest, protocolVersion, type Profile, type Request, type RoomEvent, type ServerEvent,
} from '../../../src/multiplayer/protocol'
import {
  closeRoom, connected, connectionKey, makeRoom, mayStart, reconcile, reference, replace, roomKey, roomView,
  sessionKey, sessionMs, touchMember, ttl, verify, type Binding, type Member, type Mutation, type Room, type Session, type Store,
} from './model'

type Send = (connectionId: string, event: ServerEvent) => Promise<void>
const sha = (value: string) => createHash('sha256').update(value).digest('hex')
const generateCode = () => Array.from({ length: 6 }, () => codeAlphabet[randomInt(codeAlphabet.length)]).join('')
const retryLimit = 7

export class LobbyService {
  constructor(
    private readonly store: Store,
    private readonly send: Send,
    private readonly now = Date.now,
    private readonly code = generateCode,
  ) {}

  async allowConnect(origin: string | undefined, address: string, origins: ReadonlySet<string>) {
    return !!origin && origins.has(origin) && this.store.allow('IP#' + sha(address), this.now(), 20)
  }

  async message(connectionId: string, raw: string) {
    if (!await this.store.allow('MSG#' + connectionId, this.now(), 60)) {
      return this.error(connectionId, 'THROTTLED', 'Too many requests. Wait a moment and try again.')
    }
    let request: Request | null = null
    if (Buffer.byteLength(raw) <= 2048) {
      try { request = parseRequest(JSON.parse(raw)) } catch { /* Invalid JSON is handled below. */ }
    }
    if (!request) return this.error(connectionId, 'INVALID_REQUEST', 'The request or player details were invalid.')
    if (request.type === 'HELLO') return this.hello(connectionId, request.requestId)
    if (request.type === 'RESUME') return this.resume(connectionId, request)
    for (let attempt = 0; attempt < retryLimit; attempt++) {
      const binding = await this.getBinding(connectionId)
      const session = binding && await this.getSession(binding.sessionId)
      if (!binding || !session || session.connectionId !== connectionId) {
        return this.error(connectionId, 'SESSION_REQUIRED', 'This connection is no longer authenticated.', request.requestId)
      }
      if (await this.apply(connectionId, request, session, binding)) return
    }
    return this.error(connectionId, 'BUSY', 'The room is busy. Try again.', request.requestId)
  }

  async disconnect(connectionId: string) {
    const binding = await this.getBinding(connectionId)
    if (!binding) return
    for (let attempt = 0; attempt < retryLimit; attempt++) {
      const session = await this.getSession(binding.sessionId)
      if (!session || session.connectionId !== connectionId) return
      const previous = await this.roomFor(session)
      const member = previous?.members.find(candidate => candidate.sessionId === session.id && candidate.connectionId === connectionId)
      if (!previous || !member || previous.status === 'CLOSED' || member.offlineAt !== undefined) return
      const now = this.now()
      const room = {
        ...previous, version: previous.version + 1,
        members: previous.members.map(candidate => candidate === member ? { ...candidate, offlineAt: now, ready: false } : candidate),
      }
      if (await this.store.commit([verify(session), replace(previous, room)])) {
        await this.broadcast('PLAYER_CONNECTION_CHANGED', room, undefined, connectionId)
        return
      }
    }
  }

  private async hello(connectionId: string, requestId: string) {
    const now = this.now()
    const token = randomBytes(32).toString('base64url')
    const id = randomUUID()
    const session: Session = {
      kind: 'session', pk: sessionKey(id), rev: 0, id, playerId: randomUUID(),
      tokenHash: sha(token), connectionId, expiresAt: now + sessionMs, ttl: ttl(now + sessionMs), recent: [],
    }
    if (!await this.store.commit([replace(undefined, session), replace(undefined, this.binding(session, connectionId, now))])) {
      return this.error(connectionId, 'ALREADY_AUTHENTICATED', 'This connection already has a session.', requestId)
    }
    await this.send(connectionId, {
      ...this.header(null, requestId), type: 'SESSION', playerId: session.playerId, room: null,
      credential: { sessionId: id, resumeToken: token },
    })
  }

  private async resume(connectionId: string, request: Extract<Request, { type: 'RESUME' }>) {
    for (let attempt = 0; attempt < retryLimit; attempt++) {
      const session = await this.getSession(request.credential.sessionId)
      if (!session || !timingSafeEqual(Buffer.from(session.tokenHash, 'hex'), Buffer.from(sha(request.credential.resumeToken), 'hex'))) {
        return this.error(connectionId, 'SESSION_EXPIRED', 'Your multiplayer session has expired. Create or join another room.', request.requestId)
      }
      const binding = await this.getBinding(connectionId)
      if (binding && binding.sessionId !== session.id) return this.error(connectionId, 'SESSION_REQUIRED', 'This connection belongs to another session.', request.requestId)
      const previous = await this.roomFor(session)
      const now = this.now()
      const current = previous && reconcile(previous, now)
      const member = current?.status !== 'CLOSED' && current?.members.find(candidate => candidate.sessionId === session.id)
      const updated = current && member ? touchMember(current, member, connectionId, now) : current
      const nextSession = { ...session, connectionId, room: member ? session.room : undefined }
      const writes = [replace(session, nextSession), replace(binding, this.binding(nextSession, connectionId, now, binding))]
      if (previous && updated && previous !== updated) writes.push(replace(previous, updated))
      if (!await this.store.commit(writes)) continue
      const latest = updated?.status === 'STARTING' ? await this.finishStart(updated.code) ?? updated : updated
      if (latest && latest.version !== previous?.version) {
        const type = latest.status === 'CLOSED' ? 'ROOM_CLOSED' : latest.status === 'IN_GAME' && previous?.status === 'STARTING'
          ? 'GAME_STARTED' : 'PLAYER_CONNECTION_CHANGED'
        await this.broadcast(type, latest, undefined, connectionId)
      }
      const room = member && latest?.status !== 'CLOSED' ? latest ?? null : null
      await this.send(connectionId, { ...this.header(room, request.requestId), type: 'SESSION', playerId: session.playerId, room: this.view(room) })
      return
    }
    return this.error(connectionId, 'BUSY', 'The room is busy. Try reconnecting.', request.requestId)
  }

  private async apply(connectionId: string, request: Exclude<Request, { type: 'HELLO' | 'RESUME' }>, session: Session, binding: Binding) {
    const now = this.now()
    const requestId = request.requestId
    const signature = sha(JSON.stringify(request))
    const prior = session.recent.find(receipt => receipt.id === requestId)
    const previous = await this.roomFor(session)
    const current = previous && reconcile(previous, now)
    const member = current?.status !== 'CLOSED' && current?.members.find(candidate => candidate.sessionId === session.id && candidate.connectionId === connectionId)
    const replyError = async (code: string, message: string) => {
      await this.error(connectionId, code, message, requestId, member && current ? current : null)
      return true
    }

    if (prior) {
      if (prior.signature !== signature) return replyError('REQUEST_REUSED', 'This request identifier was already used.')
      const latest = member && current?.status === 'STARTING'
        ? await this.finishStart(current.code) ?? current : member && current ? current : null
      if (latest?.status === 'IN_GAME' && previous?.status === 'STARTING') await this.broadcast('GAME_STARTED', latest)
      await this.reply(connectionId, 'ROOM_UPDATED', latest, requestId)
      return true
    }

    const admission = request.type === 'CREATE_ROOM' || request.type === 'JOIN_ROOM'
    if (admission && member) return replyError('ALREADY_IN_ROOM', 'Leave your current room first.')
    let event: RoomEvent = 'ROOM_UPDATED'
    let room = current
    let oldRoom = previous
    let nextSession = session
    let replyRoom: Room | null = null
    if (request.type === 'CREATE_ROOM') {
      const code = this.code()
      oldRoom = undefined
      room = makeRoom(randomUUID(), code, this.member(session, connectionId, request.profile, 'host', now), now)
      nextSession = { ...session, room: reference(room) }
      event = 'ROOM_CREATED'
    } else if (request.type === 'JOIN_ROOM') {
      oldRoom = await this.getRoom(request.code)
      room = oldRoom && reconcile(oldRoom, now)
      if (!room || room.status === 'CLOSED') return replyError('ROOM_UNAVAILABLE', 'That room code is invalid or has expired.')
      if (room.status !== 'WAITING') return replyError('GAME_IN_PROGRESS', 'This room has already started.')
      if (room.members.length >= 2) return replyError('ROOM_FULL', 'This room already has two players.')
      room = {
        ...room, version: room.version + 1,
        members: [...room.members, this.member(session, connectionId, request.profile, 'guest', now)],
      }
      nextSession = { ...session, room: reference(room) }
      event = 'PLAYER_JOINED'
    } else if (!current || !member) {
      if (request.type !== 'HEARTBEAT' && request.type !== 'LEAVE_ROOM') return replyError('ROOM_UNAVAILABLE', 'Your room is no longer available.')
      if (session.room) nextSession = { ...session, room: undefined }
      if (current && current !== previous) event = current.status === 'CLOSED' ? 'ROOM_CLOSED' : 'PLAYER_CONNECTION_CHANGED'
    } else if (request.type === 'LEAVE_ROOM') {
      room = member.role === 'host' || current.status !== 'WAITING' ? closeRoom(current, now)
        : { ...current, version: current.version + 1, members: current.members.filter(candidate => candidate.id !== member.id) }
      nextSession = { ...session, room: undefined }
      event = room.status === 'CLOSED' ? 'ROOM_CLOSED' : 'PLAYER_LEFT'
    } else {
      room = touchMember(current, member, connectionId, now)
      if (request.type === 'SET_READY') {
        if (room.status !== 'WAITING') return replyError('GAME_IN_PROGRESS', 'Ready status cannot change after the game starts.')
        if (room.members.find(candidate => candidate.id === member.id)?.ready !== request.ready) {
          room = {
            ...room, version: room.version + 1,
            members: room.members.map(candidate => candidate.id === member.id ? { ...candidate, ready: request.ready } : candidate),
          }
          event = 'PLAYER_READY_CHANGED'
        }
      }
      if (request.type === 'START_GAME') {
        if (member.role !== 'host') return replyError('HOST_ONLY', 'Only the host can start the game.')
        if (!mayStart(current, member.id, now)) return replyError('NOT_READY', 'Both connected players must be ready to start.')
        room = { ...room, status: 'STARTING', version: room.version + 1 }
      }
      if (previous && room.version !== previous.version && event === 'ROOM_UPDATED' && room.status === 'WAITING') {
        event = room.members.length < previous.members.length ? 'PLAYER_LEFT' : 'PLAYER_CONNECTION_CHANGED'
      }
    }

    if (request.type !== 'HEARTBEAT') nextSession = { ...nextSession, recent: [...session.recent.slice(-47), { id: requestId, signature }] }
    const writes: Mutation[] = [
      nextSession === session ? verify(session) : replace(session, nextSession),
      replace(binding, { ...binding, lastActivity: now }),
    ]
    if (room && room !== oldRoom) writes.push(replace(oldRoom, room))
    if (!await this.store.commit(writes)) return false
    if (room?.status === 'STARTING') {
      const started = await this.finishStart(room.code)
      if (started) room = started
      if (room.status === 'IN_GAME') event = 'GAME_STARTED'
    }
    if (room && (event !== 'ROOM_UPDATED' || room.version !== oldRoom?.version)) {
      await this.broadcast(event, room, undefined, connectionId)
    }
    if (room && (room.status === 'CLOSED' || (nextSession.room?.id === room.id && room.members.some(candidate => candidate.id === session.playerId)))) replyRoom = room
    await this.reply(connectionId, event, replyRoom, requestId)
    return true
  }

  private async finishStart(code: string) {
    for (let attempt = 0; attempt < retryLimit; attempt++) {
      const room = await this.getRoom(code)
      if (!room || room.status !== 'STARTING') return room
      const started: Room = { ...room, status: 'IN_GAME', version: room.version + 1 }
      if (await this.store.commit([replace(room, started)])) return started
    }
  }

  private member(session: Session, connectionId: string, profile: Profile, role: Member['role'], now: number): Member {
    return { ...profile, id: session.playerId, sessionId: session.id, connectionId, role, lastSeen: now, ready: false }
  }

  private binding(session: Session, connectionId: string, now: number, previous?: Binding): Binding {
    return {
      kind: 'binding', pk: connectionKey(connectionId), rev: 0, ttl: session.ttl,
      sessionId: session.id, connectedAt: previous?.connectedAt ?? now, lastActivity: now,
    }
  }

  private async getBinding(id: string) {
    const entity = await this.store.get(connectionKey(id))
    return entity?.kind === 'binding' ? entity : undefined
  }

  private async getSession(id: string) {
    const entity = await this.store.get(sessionKey(id))
    return entity?.kind === 'session' && entity.expiresAt > this.now() ? entity : undefined
  }

  private async getRoom(code: string) {
    const entity = await this.store.get(roomKey(code))
    return entity?.kind === 'room' ? entity : undefined
  }

  private async roomFor(session: Session) {
    if (!session.room) return
    const room = await this.getRoom(session.room.code)
    return room?.id === session.room.id ? room : undefined
  }

  private header(room: Room | null, requestId?: string) {
    return { v: protocolVersion, roomId: room?.id ?? null, stateVersion: room?.version ?? 0, requestId } as const
  }

  private view(room: Room | null) {
    return room ? roomView(room, this.now()) : null
  }

  private async reply(connectionId: string, type: RoomEvent, room: Room | null, requestId?: string) {
    await this.send(connectionId, { ...this.header(room, requestId), type, room: this.view(room) })
  }

  private async broadcast(type: RoomEvent, room: Room, requestId?: string, skip?: string) {
    await Promise.all(room.members.filter(member => member.connectionId !== skip && connected(member, this.now()))
      .map(member => this.reply(member.connectionId, type, room, requestId).catch(() => { /* Heartbeats recover missed pushes. */ })))
  }

  private async error(connectionId: string, code: string, message: string, requestId?: string, room: Room | null = null) {
    await this.send(connectionId, { ...this.header(room, requestId), type: 'ERROR', code, message })
  }
}
