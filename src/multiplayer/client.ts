import { heartbeatMs, protocolVersion, record, type Intent, type Request, type RoomView, type ServerEvent, type SessionCredential } from './protocol'
import { nextRoom } from './state'

type Connection = 'connecting' | 'online' | 'reconnecting'
export type LobbyState = {
  connection: Connection
  playerId?: string
  room: RoomView | null
  pending?: Intent['type']
  error?: string
}

const roomEvents = new Set(['ROOM_CREATED', 'PLAYER_JOINED', 'PLAYER_LEFT', 'PLAYER_READY_CHANGED',
  'PLAYER_CONNECTION_CHANGED', 'ROOM_UPDATED', 'GAME_STARTED', 'ROOM_CLOSED', 'SESSION', 'ERROR'])
const request = (intent: Intent): Request => ({ ...intent, v: protocolVersion, requestId: crypto.randomUUID() })

export class LobbyClient {
  private state: LobbyState = { connection: 'connecting', room: null }
  private socket?: WebSocket
  private stopped = false
  private retryTimer?: number
  private watchdog?: number
  private pulse?: number
  private lastMessage = 0
  private failures = 0
  private handshake?: string
  private pending?: Request
  private pendingSince = 0
  private recentPulse?: { id: string; roomId: string | null }
  private credential?: SessionCredential
  private readonly storageKey: string

  constructor(private readonly endpoint: string, private readonly publish: (state: LobbyState) => void, private readonly left: () => void) {
    this.storageKey = `shieldquest.lobby:${endpoint}`
    try {
      const credential: unknown = JSON.parse(sessionStorage.getItem(this.storageKey) ?? 'null')
      if (record(credential) && typeof credential.sessionId === 'string' && typeof credential.resumeToken === 'string') {
        this.credential = { sessionId: credential.sessionId, resumeToken: credential.resumeToken }
      }
    } catch { /* An unavailable browser store still allows in-memory reconnection. */ }
    this.connect()
  }

  private update(changes: Partial<LobbyState>) {
    this.state = { ...this.state, ...changes }
    this.publish(this.state)
  }

  private connect() {
    if (this.stopped) return
    let socket: WebSocket
    try { socket = new WebSocket(this.endpoint) }
    catch {
      this.reconnect()
      return
    }
    this.socket = socket
    this.watchdog = window.setTimeout(() => socket.close(), 10_000)
    socket.onopen = () => {
      const hello = request(this.credential ? { type: 'RESUME', credential: this.credential } : { type: 'HELLO' })
      this.handshake = hello.requestId
      this.send(hello)
    }
    socket.onmessage = message => {
      if (typeof message.data !== 'string' || message.data.length > 16_384) return
      let value: unknown
      try { value = JSON.parse(message.data) } catch { return }
      if (!record(value) || value.v !== protocolVersion || typeof value.type !== 'string' || !roomEvents.has(value.type) ||
          !Number.isSafeInteger(value.stateVersion) || (value.roomId !== null && typeof value.roomId !== 'string')) return
      this.receive(value as ServerEvent)
    }
    socket.onclose = () => {
      this.clearSocket()
      this.reconnect()
    }
  }

  private receive(event: ServerEvent) {
    this.lastMessage = Date.now()
    if (this.handshake && event.requestId === this.handshake) {
      if (event.type === 'ERROR') {
        if (event.code === 'SESSION_EXPIRED') {
          this.forgetCredential()
          this.pending = undefined
          this.update({ room: null, playerId: undefined, pending: undefined, error: event.message })
        }
        this.socket?.close()
        return
      }
      if (event.type !== 'SESSION' || typeof event.playerId !== 'string') return
      this.handshake = undefined
      window.clearTimeout(this.watchdog)
      if (event.credential) {
        this.credential = event.credential
        try { sessionStorage.setItem(this.storageKey, JSON.stringify(event.credential)) } catch { /* Optional storage. */ }
      }
      this.failures = 0
      const room = nextRoom(this.state.room, event, true)
      this.update({ connection: 'online', playerId: event.playerId, room, error: !room && this.state.room ? 'The previous room has closed.' : undefined })
      if (this.pending) this.sendPending()
      this.pulse = window.setInterval(() => {
        if (Date.now() - this.lastMessage > heartbeatMs * 2.5 ||
            this.pending && Date.now() - this.pendingSince > heartbeatMs) {
          this.socket?.close()
        } else {
          const pulse = request({ type: 'HEARTBEAT' })
          this.recentPulse = { id: pulse.requestId, roomId: this.state.room?.id ?? null }
          this.send(pulse)
        }
      }, heartbeatMs)
      return
    }
    if (this.handshake || this.state.connection !== 'online' || event.type === 'SESSION') return
    const matched = this.pending && this.pending.requestId === event.requestId
    const pending = matched ? this.pending : undefined
    if (matched) this.pending = undefined
    if (event.type === 'ERROR') {
      if (event.code === 'SESSION_REQUIRED') this.socket?.close()
      if (matched || !event.requestId) this.update({ pending: this.pending?.type, error: event.message })
      return
    }
    const pulse = this.recentPulse
    const lostRoom = !!this.state.room && event.room === null && pulse?.id === event.requestId && pulse?.roomId === this.state.room.id
    const room = nextRoom(this.state.room, event, !!matched || lostRoom)
    this.update({ room, pending: this.pending?.type, ...(matched && { error: undefined }),
      ...(lostRoom && { error: 'The previous room has closed.' }),
    })
    if (pending?.type === 'LEAVE_ROOM') {
      this.stop(true)
      this.left()
    }
  }

  perform(intent: Extract<Intent, { type: 'CREATE_ROOM' | 'JOIN_ROOM' | 'SET_READY' | 'START_GAME' | 'LEAVE_ROOM' }>) {
    if (this.stopped || this.pending || this.state.connection !== 'online') return
    this.pending = request(intent)
    this.update({ pending: intent.type, error: undefined })
    this.sendPending()
  }

  private sendPending() {
    if (!this.pending) return
    this.pendingSince = Date.now()
    this.send(this.pending)
  }

  private send(payload: Request) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload))
  }

  private clearSocket() {
    window.clearTimeout(this.watchdog)
    window.clearInterval(this.pulse)
    this.handshake = undefined
    this.recentPulse = undefined
    const socket = this.socket
    this.socket = undefined
    if (socket) {
      socket.onopen = socket.onclose = socket.onmessage = null
      if (socket.readyState < WebSocket.CLOSING) socket.close()
    }
  }

  private reconnect() {
    if (this.stopped) return
    this.failures++
    this.update({ connection: 'reconnecting' })
    const delay = Math.min(8_000, 400 * 2 ** Math.min(this.failures, 5)) * (.6 + Math.random() * .4)
    this.retryTimer = window.setTimeout(() => this.connect(), delay)
  }

  private forgetCredential() {
    this.credential = undefined
    try { sessionStorage.removeItem(this.storageKey) } catch { /* Optional storage. */ }
  }

  stop(forget = false) {
    this.stopped = true
    window.clearTimeout(this.retryTimer)
    this.clearSocket()
    if (forget) this.forgetCredential()
  }
}
