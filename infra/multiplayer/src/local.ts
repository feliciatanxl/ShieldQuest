import { randomUUID } from 'node:crypto'
import { WebSocket, WebSocketServer } from 'ws'
import { LobbyService } from './service'
import { MemoryStore } from './memory'

const origins = new Set((process.env.LOCAL_LOBBY_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173').split(','))
const sockets = new Map<string, WebSocket>()
const service = new LobbyService(new MemoryStore(), async (id, event) => {
  const socket = sockets.get(id)
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event))
})
const server = new WebSocketServer({
  host: '127.0.0.1', port: Number(process.env.LOCAL_LOBBY_PORT ?? 8787), maxPayload: 2048,
  verifyClient: (info, done) => {
    void service.allowConnect(info.origin, info.req.socket.remoteAddress ?? '', origins)
      .then(allowed => done(allowed, allowed ? 200 : 403))
      .catch(() => done(false, 500))
  },
})

server.on('connection', socket => {
  const id = randomUUID()
  sockets.set(id, socket)
  socket.on('message', (data, binary) => { void service.message(id, binary ? '' : data.toString()).catch(() => socket.close(1011)) })
  socket.on('close', () => {
    sockets.delete(id)
    void service.disconnect(id).catch(() => console.error('Local presence update failed.'))
  })
  socket.on('error', () => socket.close())
})
server.on('listening', () => {
  console.log(`Local-only lobby server on ws://127.0.0.1:${(server.address() as { port: number }).port}`)
})
