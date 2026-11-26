import type { RoomView, ServerEvent } from './protocol'

export function nextRoom(previous: RoomView | null, event: ServerEvent, authoritativeReply: boolean) {
  if (event.type === 'ERROR') return previous
  const { room } = event
  if (!room) return authoritativeReply ? null : previous
  if (room.id !== event.roomId || room.version !== event.stateVersion || !Array.isArray(room.players)) return previous
  if (!previous || previous.id !== room.id) return authoritativeReply ? room : previous
  return room.version > previous.version ? room : previous
}
