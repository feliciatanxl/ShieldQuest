import { useEffect, useRef, useState } from 'react'
import { Copy, Radio, Shield } from 'lucide-react'
import type { Avatar } from '../state/avatar'
import { LobbyClient, type LobbyState } from '../multiplayer/client'
import { readProfile, roomCodePattern, type RoomPlayer } from '../multiplayer/protocol'
import { AvatarSprite } from './AvatarSprite'
import { Button, Modal } from './ui'

export function MultiplayerLobby({ mode, endpoint, avatar, onClose }: {
  mode: 'create' | 'join'; endpoint: { url: string; local: boolean }; avatar: Avatar; onClose: () => void
}) {
  const [state, setState] = useState<LobbyState>({ connection: 'connecting', room: null })
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('')
  const client = useRef<LobbyClient>(null)
  const codeInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const connection = new LobbyClient(endpoint.url, setState, onClose)
    client.current = connection
    return () => {
      connection.stop()
      client.current = null
    }
  }, [endpoint.url, onClose])

  const { room, connection, pending, playerId } = state
  const self = room?.players.find(player => player.id === playerId)
  const host = self?.role === 'host'
  const active = !!room && room.status !== 'CLOSED'
  const busy = connection !== 'online' || !!pending
  const canStart = host && room?.status === 'WAITING' && room.players.length === 2 &&
    room.players.every(player => player.connected && player.ready)

  function leave() {
    if (pending) {
      setNotice('Wait for the server to confirm your current action.')
    } else if (!active) {
      client.current?.stop(true)
      onClose()
    } else if (!busy) {
      client.current?.perform({ type: 'LEAVE_ROOM' })
    } else {
      setNotice('Reconnect to leave on the server. Closing this tab starts the reconnection grace period.')
    }
  }

  async function copy() {
    if (!room) return
    try {
      await navigator.clipboard.writeText(room.code)
      setNotice('Room code copied.')
    } catch {
      codeInput.current?.focus()
      codeInput.current?.select()
      setNotice('Code selected. Copy it using your device’s copy command.')
    }
  }

  return <Modal title="The Mysterious House" eyebrow="ESCAPE ROOM ADVENTURE" className="lobby-modal" onClose={leave}>
    <h3>{room?.status === 'IN_GAME' ? 'Multiplayer Session' : 'Multiplayer Lobby'}</h3>
    <p className="lobby-connection" role="status"><Radio size={16} aria-hidden="true" />
      {connection === 'online' ? 'Connected to lobby server' : connection === 'connecting' ? 'Connecting to lobby server…' : 'Connection lost. Reconnecting…'}
    </p>
    {endpoint.local && <p className="lobby-notice">Local development server</p>}
    {state.error && <p className="lobby-error" role="alert">{state.error}</p>}
    {!room && <form className="lobby-form" onSubmit={event => {
      event.preventDefault()
      const profile = readProfile({ name, avatar })
      if (!profile) {
        setNotice('Enter a name of up to 24 characters. Start with a letter or number.')
        return
      }
      if (mode === 'join' && !roomCodePattern.test(code)) {
        setNotice('Enter the six characters shown on the host’s screen.')
        return
      }
      setNotice('')
      if (mode === 'create') client.current?.perform({ type: 'CREATE_ROOM', profile })
      else client.current?.perform({ type: 'JOIN_ROOM', profile, code })
    }}>
      <label>Display Name<input required maxLength={24} value={name} onChange={event => setName(event.target.value)} autoComplete="nickname" /></label>
      {mode === 'join' && <label>Room Code<input required value={code} maxLength={6} minLength={6}
        onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
        autoComplete="off" autoCapitalize="characters" spellCheck={false} /></label>}
      <Button type="submit" className="primary" disabled={busy}>{mode === 'create' ? 'Create Room' : 'Join Room'}</Button>
      <Button className="secondary" onClick={leave}>Back</Button>
    </form>}
    {room?.status === 'CLOSED' && <div className="house-entry-actions">
      <p role="status">This room has closed.</p>
      <Button className="secondary" onClick={leave}>Back</Button>
    </div>}
    {active && room && <>
      <div className="lobby-code">
        <label>Room Code<input ref={codeInput} readOnly value={room.code} /></label>
        <Button className="secondary" onClick={copy}><Copy size={16} aria-hidden="true" /> Copy Room Code</Button>
      </div>
      <ol className="lobby-roster">
        <PlayerSlot player={room.players.find(player => player.role === 'host')} role="Host" you={playerId} />
        <PlayerSlot player={room.players.find(player => player.role === 'guest')} role="Guest" you={playerId} />
      </ol>
      {room.status === 'IN_GAME' && <div className="lobby-in-game" role="status">
        <strong>Level 1 — The Missing Evidence</strong>
        <p>Both players are in the session. The host coordinates puzzle progress while each player explores independently.</p>
        <dl className="lobby-session-info">
          <div><dt>Room</dt><dd>{room.code}</dd></div>
          <div><dt>Players</dt><dd>{room.players.filter(p => p.connected).length} / {room.players.length} connected</dd></div>
          <div><dt>Status</dt><dd>In Progress</dd></div>
        </dl>
        <p className="lobby-coop-note">Shared puzzle synchronisation and cooperative inventory are planned for the next phase. Each player can solve puzzles in their own escape room session while staying in the multiplayer room.</p>
      </div>}
      {room.status === 'STARTING' && <p role="status">Starting the session…</p>}
      <div className="lobby-actions">
        {room.status === 'WAITING' && self && <Button className="secondary" disabled={busy}
          onClick={() => client.current?.perform({ type: 'SET_READY', ready: !self.ready })}>{self.ready ? 'Not Ready' : 'Ready'}</Button>}
        {room.status === 'WAITING' && host && <Button className="primary" disabled={busy || !canStart}
          onClick={() => client.current?.perform({ type: 'START_GAME' })}>Start Game</Button>}
        <Button className="secondary" onClick={leave}>Leave Room</Button>
      </div>
    </>}
    {notice && <p className="lobby-notice" role="status">{notice}</p>}
  </Modal>
}

function PlayerSlot({ player, role, you }: { player?: RoomPlayer; role: string; you?: string }) {
  return <li className="lobby-player">
    <span className="lobby-avatar">{player ? <AvatarSprite avatar={player.avatar} /> : <Shield size={25} aria-hidden="true" />}</span>
    <div>
      <small>{role}{player?.id === you && !!you ? ' · You' : ''}</small>
      <strong>{player?.name ?? 'Waiting for a player'}</strong>
      {player && <p>{player.connected ? 'Connected' : 'Disconnected'} · {player.ready ? 'Ready' : 'Not ready'}</p>}
    </div>
  </li>
}
