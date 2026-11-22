import { useEffect, useRef } from 'react'
import type { Launch } from '../game/scenes/ExplorationScene'
import { loadPlayerArt } from '../game/playerArt'

export function GameCanvas({ launch }: { launch: Launch }) {
  const container = useRef<HTMLDivElement>(null)
  const initial = useRef(launch)
  initial.current = launch

  useEffect(() => {
    const host = document.createElement('div')
    host.className = 'phaser-host'
    container.current?.append(host)
    let disposed = false
    let destroy: (() => void) | undefined
    // Player sprites are recoloured from pixels, so their sheets must be decoded before any scene draws them.
    void Promise.all([import('../game/main'), loadPlayerArt()]).then(([{ mountGame }]) => {
      if (!disposed) destroy = mountGame(host, initial.current)
    })
    return () => {
      disposed = true
      destroy?.()
      host.remove()
    }
  }, [])

  // Appearance is saved React state: synchronize the running scene after commits,
  // including updates that occurred while Phaser was still loading.
  useEffect(() => {
    let disposed = false
    void loadPlayerArt().then(() => {
      if (disposed) return
      launch.bridge.emit('avatar', launch.avatar)
      launch.bridge.emit('name', launch.name ?? '')
    })
    return () => { disposed = true }
  }, [launch.avatar, launch.name, launch.bridge])

  return <div className="game-canvas" ref={container} aria-hidden="true" />
}
