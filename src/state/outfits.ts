import { normalizeAvatar, type Avatar } from './avatar'

// Saved outfits live beside the game save, so they survive starting a new game.
export const OUTFITS_KEY = 'shieldquest.outfits'
export const OUTFIT_SLOTS = 6
export const OUTFIT_NAME_LENGTH = 20
export type Outfit = { name: string; avatar: Avatar }

/** Collapses spaces and trims; '' when nothing printable is left. */
export const outfitName = (raw: string) => raw.replace(/\s+/g, ' ').trim().slice(0, OUTFIT_NAME_LENGTH)

/** Always OUTFIT_SLOTS long; unreadable entries become empty slots, older avatars are upgraded. */
export function parseOutfits(raw: string | null): (Outfit | null)[] {
  let data: unknown = null
  try { data = JSON.parse(raw ?? 'null') } catch { /* corrupt storage: start empty */ }
  const list = Array.isArray(data) ? data : []
  return Array.from({ length: OUTFIT_SLOTS }, (_, i) => {
    const entry = list[i] as { name?: unknown; avatar?: unknown } | null
    const avatar = entry ? normalizeAvatar(entry.avatar) : null
    if (!avatar) return null
    return { name: (typeof entry?.name === 'string' && outfitName(entry.name)) || `Outfit ${i + 1}`, avatar }
  })
}

export function readOutfits() {
  try { return parseOutfits(localStorage.getItem(OUTFITS_KEY)) } catch { return parseOutfits(null) }
}

export function writeOutfits(outfits: (Outfit | null)[]) {
  try {
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits))
    return true
  } catch {
    return false
  }
}
