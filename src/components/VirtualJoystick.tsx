import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Lock, Move } from 'lucide-react'
import { JOYSTICK_RUN_REACH, JOYSTICK_RUN_THRESHOLD, joystickSample } from '../game/joystick'
import type { Point } from '../state/saveGame'

type Gesture = { id: number; element: HTMLDivElement }
type RunLockState = 'idle' | 'running' | 'lock-ready' | 'locked'

export function VirtualJoystick({ blocked, onMove }: { blocked: boolean; onMove: (point: Point) => void }) {
  const stick = useRef<HTMLSpanElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const active = useRef<Gesture | null>(null)
  const runLocked = useRef(false)
  const [runState, setRunState] = useState<RunLockState>('idle')
  const lastDirection = useRef<Point>({ x: 0, y: 0 })
  const lastOffset = useRef<Point>({ x: 0, y: 0 })
  const touchStartTime = useRef<number>(0)

  const stop = useCallback(() => {
    runLocked.current = false
    setRunState('idle')
    const gesture = active.current
    if (gesture) {
      active.current = null
      delete gesture.element.dataset.active
      delete gesture.element.dataset.running
      delete gesture.element.dataset.locked
      if (gesture.element.hasPointerCapture(gesture.id)) gesture.element.releasePointerCapture(gesture.id)
    }
    if (container.current) {
      delete container.current.dataset.active
      delete container.current.dataset.running
      delete container.current.dataset.locked
    }
    stick.current?.style.removeProperty('transform')
    onMove({ x: 0, y: 0 })
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
    const displacement = { x: event.clientX - centre.x, y: event.clientY - centre.y }
    const { offset, direction } = joystickSample(displacement, radius)
    const strength = Math.hypot(direction.x, direction.y)

    lastOffset.current = offset
    lastDirection.current = direction

    // Is the stick pushed upwards toward the RUN lock notch at the top?
    const inLockZone = strength >= JOYSTICK_RUN_THRESHOLD && displacement.y < -radius * 0.65 && Math.abs(displacement.x) < radius * 0.85

    if (runLocked.current) {
      // User is controlling the joystick while locked in run:
      // "unless the user controls the joystick to normal speed"
      // If the user brings the joystick into the normal walking zone:
      if (strength <= JOYSTICK_RUN_THRESHOLD) {
        runLocked.current = false
        setRunState('idle')
        delete event.currentTarget.dataset.locked
        event.currentTarget.toggleAttribute('data-running', false)
        stick.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`
        onMove(direction)
        return
      }

      // If user continues steering at run speed (strength > JOYSTICK_RUN_THRESHOLD):
      const dist = Math.hypot(direction.x, direction.y)
      const runDir = dist > 0 ? { x: direction.x / dist, y: direction.y / dist } : { x: 0, y: -1 }
      stick.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`
      onMove(runDir)
      return
    }

    // Normal movement:
    stick.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`
    const isRunning = strength > JOYSTICK_RUN_THRESHOLD
    event.currentTarget.toggleAttribute('data-running', isRunning)

    if (inLockZone) {
      setRunState('lock-ready')
    } else if (isRunning) {
      setRunState('running')
    } else {
      setRunState('idle')
    }

    onMove(direction)
  }

  function start(event: PointerEvent<HTMLDivElement>) {
    if (blocked || active.current || event.button !== 0) return
    event.preventDefault()
    const element = event.currentTarget
    element.setPointerCapture(event.pointerId)
    touchStartTime.current = performance.now()
    active.current = { id: event.pointerId, element }
    element.dataset.active = ''
    move(event)
  }

  function end(event: PointerEvent<HTMLDivElement>) {
    if (active.current?.id !== event.pointerId) return
    const elapsed = performance.now() - touchStartTime.current
    const element = active.current.element
    active.current = null
    delete element.dataset.active
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)

    // Quick tap while locked -> stops!
    if (runLocked.current && elapsed < 250) {
      runLocked.current = false
      setRunState('idle')
      delete element.dataset.locked
      delete element.dataset.running
      stick.current?.style.removeProperty('transform')
      onMove({ x: 0, y: 0 })
      return
    }

    // Check if released in the top lock zone:
    const bounds = element.getBoundingClientRect()
    const centre = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
    const radius = (bounds.width - (stick.current?.offsetWidth ?? 40)) / 2 - 4
    const displacement = { x: event.clientX - centre.x, y: event.clientY - centre.y }
    const strength = Math.hypot(lastDirection.current.x, lastDirection.current.y)
    const inLockZone = strength >= JOYSTICK_RUN_THRESHOLD && displacement.y < -radius * 0.65

    if (inLockZone || (runLocked.current && strength >= JOYSTICK_RUN_THRESHOLD)) {
      // Lock on run! Keep running speed!
      runLocked.current = true
      setRunState('locked')
      element.dataset.locked = ''
      element.dataset.running = ''
      // Maximize to full running speed vector
      const dist = Math.hypot(lastDirection.current.x, lastDirection.current.y)
      const lockedDir = dist > 0 ? { x: lastDirection.current.x / dist, y: lastDirection.current.y / dist } : { x: 0, y: -1 }
      if (stick.current) {
        stick.current.style.transform = `translate(${lastOffset.current.x}px, ${lastOffset.current.y}px)`
      }
      onMove(lockedDir)
      return
    }

    // Released in normal walking speed zone -> stop
    runLocked.current = false
    setRunState('idle')
    delete element.dataset.locked
    delete element.dataset.running
    stick.current?.style.removeProperty('transform')
    onMove({ x: 0, y: 0 })
  }

  return <div className="virtual-joystick" ref={container} role="group" aria-label="Movement joystick"
    style={{ '--walk-range': JOYSTICK_RUN_REACH } as CSSProperties}
    onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
    onLostPointerCapture={end} onContextMenu={event => event.preventDefault()}>
    <span className="joystick-lock-notch" aria-hidden="true" title="Lock Run Zone" />
    <span className="joystick-stick" ref={stick} aria-hidden="true"><Move size={21} /></span>
    <span className={`joystick-run-indicator ${runState}`} aria-hidden="true">
      {runState === 'locked' ? <><Lock size={11} /> Run Locked</>
        : runState === 'lock-ready' ? <><Lock size={11} /> Release to Lock</>
        : 'Run'}
    </span>
  </div>
}
