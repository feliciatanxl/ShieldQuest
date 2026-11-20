import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { nextRoom } from '../../../src/multiplayer/state'
import { parseRequest, type Intent, type Profile, type ServerEvent, type SessionCredential } from '../../../src/multiplayer/protocol'
import { presets } from '../../../src/state/avatar'
import { MemoryStore } from '../src/memory'
import { graceMs, idleMs, roomKey, staleMs, type Room } from '../src/model'
import { LobbyService } from '../src/service'
import { gatewayHandlers } from '../src/handlers'

function setup(codes = ['ABC234', 'DEF567', 'GHJ789']) {
  let now = 200_000
  const store = new MemoryStore()
  const updates: { socket: string; event: ServerEvent }[] = []
  const lobby = new LobbyService(store, async (socket, event) => { updates.push({ socket, event }) }, () => now,
    () => codes.shift() ?? 'KLM234')
  const send = async (socket: string, intent: Intent, requestId = randomUUID()) => {
    await lobby.message(socket, JSON.stringify({ ...intent, requestId, v: 1 }))
    const event = updates.findLast(update => update.socket === socket && update.event.requestId === requestId)?.event
    assert(event)
    return event
  }
  const advance = (ms: number) => { now += ms }
  return { store, lobby, updates, send, advance }
}

const profile = (name: string): Profile => ({ name, avatar: presets[0].avatar })
const credentials = (event: ServerEvent): SessionCredential => {
  assert.equal(event.type, 'SESSION')
  assert(event.credential)
  return event.credential
}
const snapshot = (event: ServerEvent) => {
  assert(event.type !== 'ERROR')
  assert(event.room)
  return event.room
}
const errorCode = (event: ServerEvent) => {
  assert.equal(event.type, 'ERROR')
  return event.code
}

test('atomic admission, room-code collisions and request idempotency', async () => {
  const { send, store } = setup(['ABC234', 'ABC234', 'DEF567'])
  for (const name of ['host', 'guest', 'third', 'other']) await send(name, { type: 'HELLO' })
  const requestId = randomUUID()
  const create: Intent = { type: 'CREATE_ROOM', profile: profile('Host') }
  const first = await send('host', create, requestId)
  assert.equal(first.type, 'ROOM_CREATED')
  const { id, code } = snapshot(first)
  assert.equal(snapshot(await send('host', create, requestId)).id, id)
  assert.equal(errorCode(await send('host', { ...create, profile: profile('Modified') }, requestId)), 'REQUEST_REUSED')
  assert.equal(errorCode(await send('host', create)), 'ALREADY_IN_ROOM')
  const joins = await Promise.all(['guest', 'third'].map(name => send(name, { type: 'JOIN_ROOM', code, profile: profile(name) })))
  assert.equal(joins.filter(event => event.type === 'PLAYER_JOINED').length, 1)
  assert.equal(errorCode(joins.find(event => event.type === 'ERROR')!), 'ROOM_FULL')
  const room = await store.get(roomKey(code)) as Room
  assert.equal(room.members.length, 2)
  assert.notEqual(snapshot(await send('other', create)).code, code)
})

test('enforces host, waiting status, readiness and connected presence before starting', async () => {
  const { send, updates } = setup()
  await send('h', { type: 'HELLO' })
  await send('g', { type: 'HELLO' })
  await send('x', { type: 'HELLO' })
  const { code } = snapshot(await send('h', { type: 'CREATE_ROOM', profile: profile('Harper') }))
  await send('h', { type: 'SET_READY', ready: true })
  assert.equal(errorCode(await send('h', { type: 'START_GAME' })), 'NOT_READY')
  assert.equal(errorCode(await send('g', { type: 'JOIN_ROOM', code: 'ZZZZZZ', profile: profile('Guest') })), 'ROOM_UNAVAILABLE')
  await send('g', { type: 'JOIN_ROOM', code, profile: profile('Guest') })
  assert.equal(errorCode(await send('h', { type: 'START_GAME' })), 'NOT_READY')
  assert.equal(errorCode(await send('g', { type: 'START_GAME' })), 'HOST_ONLY')
  const ready = snapshot(await send('g', { type: 'SET_READY', ready: true }))
  const requestId = randomUUID()
  const started = await send('h', { type: 'START_GAME' }, requestId)
  assert.equal(started.type, 'GAME_STARTED')
  const state = snapshot(started)
  assert.equal(state.version, ready.version + 2)
  assert.equal(state.status, 'IN_GAME')
  assert(updates.some(update => update.socket === 'g' && update.event.type === 'GAME_STARTED'))
  assert.equal(snapshot(await send('h', { type: 'START_GAME' }, requestId)).version, state.version)
  assert.equal(errorCode(await send('x', { type: 'JOIN_ROOM', code, profile: profile('Extra') })), 'GAME_IN_PROGRESS')
  assert.equal(nextRoom(state, { ...started, roomId: ready.id, stateVersion: ready.version, room: ready } as ServerEvent, false), state)
  assert.equal(nextRoom(state, { v: 1, type: 'PLAYER_LEFT', stateVersion: 999, roomId: 'another-room', room: { ...ready, id: 'another-room', version: 999 } }, false), state)
})

test('requires a bound session, rejects spoofing and rebinds a private resume credential', async () => {
  const { send, lobby, updates } = setup()
  await lobby.message('unknown', JSON.stringify({ v: 1, requestId: randomUUID(), type: 'LEAVE_ROOM', playerId: 'h' }))
  assert.equal(errorCode(updates.at(-1)!.event), 'SESSION_REQUIRED')
  const welcome = await send('h', { type: 'HELLO' })
  const secret = credentials(welcome)
  const { code } = snapshot(await send('h', { type: 'CREATE_ROOM', profile: profile('Host') }))
  await send('g', { type: 'HELLO' })
  await send('g', { type: 'JOIN_ROOM', code, profile: profile('Guest') })
  await send('h', { type: 'SET_READY', ready: true })
  await lobby.disconnect('h')
  const offline = updates.findLast(update => update.socket === 'g' && update.event.type === 'PLAYER_CONNECTION_CHANGED')
  assert(offline)
  assert.equal(snapshot(offline.event).players[0].connected, false)
  assert.equal(errorCode(await send('bad', { type: 'RESUME', credential: { ...secret, resumeToken: 'x'.repeat(43) } })), 'SESSION_EXPIRED')
  const resumed = await send('h2', { type: 'RESUME', credential: secret })
  assert.equal(resumed.type, 'SESSION')
  assert.equal(resumed.playerId, welcome.type === 'SESSION' && welcome.playerId)
  assert.equal(snapshot(resumed).players[0].connected, true)
  assert.equal(snapshot(resumed).players[0].ready, false)
  assert.equal(errorCode(await send('h', { type: 'SET_READY', ready: true })), 'SESSION_REQUIRED')
  await lobby.disconnect('h')
  assert.equal(snapshot(await send('g', { type: 'HEARTBEAT' })).players[0].connected, true)
  await send('h2', { type: 'LEAVE_ROOM' })
  assert(updates.some(update => update.socket === 'g' && update.event.type === 'ROOM_CLOSED'))
  assert(!JSON.stringify(updates.filter(update => update.socket === 'g')).includes(secret.resumeToken))
})

test('heartbeat detects missed disconnect, preserves grace, and sheds expired memberships', async () => {
  const { send, advance } = setup()
  await send('h', { type: 'HELLO' })
  const { code } = snapshot(await send('h', { type: 'CREATE_ROOM', profile: profile('Host') }))
  const guest = credentials(await send('g', { type: 'HELLO' }))
  await send('g', { type: 'JOIN_ROOM', code, profile: profile('Guest') })
  advance(staleMs)
  const absent = snapshot(await send('h', { type: 'HEARTBEAT' }))
  assert.equal(absent.players.length, 2)
  assert.equal(absent.players[1].connected, false)
  advance(graceMs - 1)
  assert.equal(snapshot(await send('g2', { type: 'RESUME', credential: guest })).players[1].connected, true)
  advance(1)
  await send('h', { type: 'HEARTBEAT' })
  advance(staleMs + graceMs)
  const closed = await send('g2', { type: 'HEARTBEAT' })
  assert.equal(closed.type, 'ROOM_CLOSED')
})

test('expired rooms are rejected before DynamoDB TTL deletion', async () => {
  const { send, store, advance } = setup()
  await send('host', { type: 'HELLO' })
  const { code } = snapshot(await send('host', { type: 'CREATE_ROOM', profile: profile('Host') }))
  advance(idleMs + 1)
  assert(await store.get(roomKey(code)))
  await send('guest', { type: 'HELLO' })
  assert.equal(errorCode(await send('guest', { type: 'JOIN_ROOM', code, profile: profile('Guest') })), 'ROOM_UNAVAILABLE')
})

test('validates origin, throttles connections and checks public request inputs', async () => {
  const { lobby } = setup()
  const origins = new Set(['https://example.test'])
  assert.equal(await lobby.allowConnect('https://elsewhere.test', 'addr', origins), false)
  for (let attempt = 0; attempt < 20; attempt++) assert.equal(await lobby.allowConnect('https://example.test', 'addr', origins), true)
  assert.equal(await lobby.allowConnect('https://example.test', 'addr', origins), false)
  const header = { v: 1, requestId: randomUUID(), type: 'CREATE_ROOM' }
  assert(parseRequest({ ...header, profile: profile('小林') }))
  assert.equal(parseRequest({ ...header, profile: profile('<script>') }), null)
  assert.equal(parseRequest({ ...header, profile: { ...profile('Player'), avatar: { ...profile('Player').avatar, hair: 999 } } }), null)
})

test('Gateway route adapters use the trusted connection context and send typed replies', async () => {
  const { lobby, updates } = setup()
  const routes = gatewayHandlers(() => lobby, new Set(['https://example.test']))
  const event = {
    headers: { Origin: 'https://example.test' },
    requestContext: {
      connectionId: 'gateway-connection', domainName: 'example.test', stage: 'lobby',
      identity: { sourceIp: '192.0.2.12' },
    },
  }
  assert.equal((await routes.connect(event)).statusCode, 200)
  assert.equal((await routes.connect({ ...event, headers: {} })).statusCode, 403)
  const body = JSON.stringify({ v: 1, requestId: randomUUID(), type: 'HELLO', connectionId: 'untrusted' })
  assert.equal((await routes.message({ ...event, body })).statusCode, 200)
  assert.equal(updates.at(-1)?.socket, 'gateway-connection')
  assert.equal(updates.at(-1)?.event.type, 'SESSION')
  assert.equal((await routes.message({ ...event, body, isBase64Encoded: true })).statusCode, 200)
  assert.equal(errorCode(updates.at(-1)!.event), 'INVALID_REQUEST')
  assert.equal((await routes.disconnect(event)).statusCode, 200)
})
