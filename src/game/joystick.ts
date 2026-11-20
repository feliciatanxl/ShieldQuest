import type { Point } from '../state/saveGame'

const DEAD_ZONE = .14
export const JOYSTICK_RUN_THRESHOLD = .78
export const JOYSTICK_RUN_REACH = DEAD_ZONE + (1 - DEAD_ZONE) * JOYSTICK_RUN_THRESHOLD

export function joystickSpeed(strength: number, walkSpeed: number, runSpeed: number) {
  if (strength <= JOYSTICK_RUN_THRESHOLD) return walkSpeed * strength / JOYSTICK_RUN_THRESHOLD
  const sprint = (Math.min(strength, 1) - JOYSTICK_RUN_THRESHOLD) / (1 - JOYSTICK_RUN_THRESHOLD)
  return walkSpeed + (runSpeed - walkSpeed) * sprint
}

export function joystickSample(displacement: Point, radius: number): { offset: Point; direction: Point } {
  const distance = Math.hypot(displacement.x, displacement.y)
  if (distance === 0 || radius <= 0) return { offset: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }
  const reach = Math.min(distance, radius)
  const ux = displacement.x / distance
  const uy = displacement.y / distance
  const strength = Math.max(0, (reach / radius - DEAD_ZONE) / (1 - DEAD_ZONE))

  return {
    offset: { x: ux * reach, y: uy * reach },
    direction: { x: ux * strength, y: uy * strength },
  }
}
