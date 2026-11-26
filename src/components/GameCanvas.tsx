import { useEffect, useRef } from 'react'
import type { Launch } from '../game/scenes/ExplorationScene'

export function GameCanvas({ launch }: { launch: Launch }) {
  const container = useRef<HTMLDivElement>(null)
  const initial = useRef(launch)

  useEffect(() => {
    const host = document.createElement('div')
    host.className = 'phaser-host'
    container.current?.append(host)
    let disposed = false
    let destroy: (() => void) | undefined
    void import('../game/main').then(({ mountGame }) => {
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
