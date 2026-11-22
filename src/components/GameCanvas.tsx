import { useEffect, useRef } from 'react'
import type { Launch } from '../game/scenes/ExplorationScene'
import { loadPlayerArt } from '../game/playerArt'

export function GameCanvas({ launch }: { launch: Launch }) {
  const container = useRef<HTMLDivElement>(null)
  const initial = useRef(launch)

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

  return <div className="game-canvas" ref={container} aria-hidden="true" />
}
