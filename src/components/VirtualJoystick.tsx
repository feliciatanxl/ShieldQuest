import { useCallback, useLayoutEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import { Move } from 'lucide-react'
import { JOYSTICK_RUN_REACH, JOYSTICK_RUN_THRESHOLD, joystickSample } from '../game/joystick'
import type { Point } from '../state/saveGame'

type Gesture = { id: number; element: HTMLDivElement }

export function VirtualJoystick({ blocked, onMove }: { blocked: boolean; onMove: (point: Point) => void }) {
  const stick = useRef<HTMLSpanElement>(null)
  const active = useRef<Gesture | null>(null)

  const stop = useCallback(() => {
    const gesture = active.current
    if (!gesture) return
    active.current = null
    delete gesture.element.dataset.active
    delete gesture.element.dataset.running
    stick.current?.style.removeProperty('transform')
    onMove({ x: 0, y: 0 })
    if (gesture.element.hasPointerCapture(gesture.id)) gesture.element.releasePointerCapture(gesture.id)
  }, [onMove])

  useLayoutEffect(() => {
    if (blocked) stop()
  }, [blocked, stop])

  useLayoutEffect(() => {
    document.addEventListener('visibilitychange', stop)
    window.addEventListener('blur', stop)
    window.addEventListener('pagehide', stop)
    window.addEventListener('resize', stop)
    return () => {
      document.removeEventListener('visibilitychange', stop)
      window.removeEventListener('blur', stop)
      window.removeEventListener('pagehide', stop)
      window.removeEventListener('resize', stop)
      stop()
    }
  }, [stop])

  function move(event: PointerEvent<HTMLDivElement>) {
    if (blocked || active.current?.id !== event.pointerId || !stick.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const centre = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
    const radius = (bounds.width - stick.current.offsetWidth) / 2 - 4
    const { offset, direction } = joystickSample({ x: event.clientX - centre.x, y: event.clientY - centre.y }, radius)
    stick.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`
    event.currentTarget.toggleAttribute('data-running', Math.hypot(direction.x, direction.y) > JOYSTICK_RUN_THRESHOLD)
    onMove(direction)
  }

  function start(event: PointerEvent<HTMLDivElement>) {
    if (blocked || active.current || event.button !== 0) return
    event.preventDefault()
    const element = event.currentTarget
    element.setPointerCapture(event.pointerId)
    active.current = { id: event.pointerId, element }
    element.dataset.active = ''
    move(event)
  }

  function end(event: PointerEvent<HTMLDivElement>) {
    if (active.current?.id === event.pointerId) stop()
  }

  return <div className="virtual-joystick" role="group" aria-label="Movement joystick"
    style={{ '--walk-range': JOYSTICK_RUN_REACH } as CSSProperties}
    onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
    onLostPointerCapture={end} onContextMenu={event => event.preventDefault()}>
    <span className="joystick-stick" ref={stick} aria-hidden="true"><Move size={21} /></span>
    <span className="joystick-run-indicator" aria-hidden="true">Run</span>
  </div>
}
