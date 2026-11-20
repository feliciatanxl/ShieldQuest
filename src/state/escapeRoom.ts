import type { Point } from './saveGame'
import {
  bookOrder, drawerCode, evidenceCards, housePickups, items, letterOrder, puzzleIds, puzzles, safeCode, timeline,
  type ItemId, type PickupId, type PuzzleId,
} from './missingEvidence'

export type EscapeRoomProgress = {
  currentLevelId: 'mysterious-house'
  mode: 'solo'
  position?: Point
  inventory: ItemId[]
  puzzleStates: Partial<Record<PuzzleId, 'completed'>>
  drawerUnlocked: boolean
  exitUnlocked: boolean
  hints: Partial<Record<PuzzleId, number>>
  elapsedMs: number
  completedAt?: string
}

export function newEscapeRoom(): EscapeRoomProgress {
  return {
    currentLevelId: 'mysterious-house', mode: 'solo', inventory: [], puzzleStates: {},
    drawerUnlocked: false, exitUnlocked: false, hints: {}, elapsedMs: 0,
  }
}

export type SequencePuzzle = 'letter' | 'cipher' | 'timeline'
export type EvidenceLink = { bin: string; source: string }
export type EscapeAction =
  | { type: 'COLLECT_ITEM'; objectId: PickupId }
  | { type: 'SUBMIT_SEQUENCE'; puzzleId: SequencePuzzle; order: readonly string[] }
  | { type: 'UNLOCK_DRAWER'; code: string }
  | { type: 'LINK_EVIDENCE'; links: Partial<Record<string, EvidenceLink>> }
  | { type: 'SUBMIT_SAFE_CODE'; code: string }
  | { type: 'UNLOCK_EXIT'; at: string }
  | { type: 'REVEAL_HINT'; puzzleId: PuzzleId }

const sequenceAnswers = { letter: letterOrder, cipher: bookOrder, timeline: timeline.map(event => event.id) }
const rewards = {
  letter: ['letter'], cipher: ['cipher-rubbing'], timeline: ['timeline-reference'],
  board: ['safe-instructions'], 'study-safe': ['house-key', 'final-evidence'],
} as const satisfies Record<PuzzleId, readonly ItemId[]>
const drawerItems = ['incident-report', 'witness-note', 'partial-reference'] as const

export function puzzleState(progress: EscapeRoomProgress, id: PuzzleId) {
  if (progress.puzzleStates[id] === 'completed') return 'completed'
  return puzzles[id].required.every(item => progress.inventory.includes(item)) ? 'available' : 'locked'
}

function award(progress: EscapeRoomProgress, additions: readonly ItemId[]): EscapeRoomProgress {
  return { ...progress, inventory: [...new Set([...progress.inventory, ...additions])] }
}

function finishPuzzle(progress: EscapeRoomProgress, id: PuzzleId): EscapeRoomProgress {
  return award({ ...progress, puzzleStates: { ...progress.puzzleStates, [id]: 'completed' } }, rewards[id])
}

export function applyEscapeAction(progress: EscapeRoomProgress, action: EscapeAction) {
  switch (action.type) {
    case 'COLLECT_ITEM': {
      const item = Object.hasOwn(housePickups, action.objectId) && housePickups[action.objectId]
      if (!item || progress.completedAt || progress.inventory.includes(item)) return progress
      return award(progress, [item])
    }
    case 'REVEAL_HINT': {
      if (progress.completedAt || !Object.hasOwn(puzzles, action.puzzleId)) return progress
      const current = progress.hints[action.puzzleId] ?? 0
      if (current >= puzzles[action.puzzleId].hints.length || puzzleState(progress, action.puzzleId) === 'completed') return progress
      return { ...progress, hints: { ...progress.hints, [action.puzzleId]: current + 1 } }
    }
    case 'SUBMIT_SEQUENCE': {
      if (!Object.hasOwn(sequenceAnswers, action.puzzleId) || puzzleState(progress, action.puzzleId) !== 'available') return progress
      const answer = sequenceAnswers[action.puzzleId]
      if (!Array.isArray(action.order) || action.order.length !== answer.length || !answer.every((id, index) => action.order[index] === id)) return progress
      return finishPuzzle(progress, action.puzzleId)
    }
    case 'UNLOCK_DRAWER':
      if (progress.drawerUnlocked || progress.puzzleStates.cipher !== 'completed' || action.code !== drawerCode) return progress
      return award({ ...progress, drawerUnlocked: true }, drawerItems)
    case 'LINK_EVIDENCE':
      if (puzzleState(progress, 'board') !== 'available' ||
          !evidenceCards.every(card => action.links?.[card.id]?.bin === card.bin && action.links[card.id]?.source === card.source)) return progress
      return finishPuzzle(progress, 'board')
    case 'SUBMIT_SAFE_CODE':
      if (puzzleState(progress, 'study-safe') !== 'available' || action.code !== safeCode) return progress
      return finishPuzzle(progress, 'study-safe')
    case 'UNLOCK_EXIT':
      if (progress.exitUnlocked || progress.puzzleStates['study-safe'] !== 'completed' ||
          !progress.inventory.includes('house-key') || !validDate(action.at)) return progress
      return { ...progress, exitUnlocked: true, completedAt: action.at }
  }
}

const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value))
const pickups: readonly ItemId[] = ['bookmark', 'sketch', 'note', ...Object.values(housePickups)]

export function readEscapeRoom(value: unknown): EscapeRoomProgress {
  let fresh = newEscapeRoom()
  if (!value || typeof value !== 'object') return fresh
  const stored = value as Partial<EscapeRoomProgress>
  if (stored.currentLevelId !== fresh.currentLevelId || stored.mode !== fresh.mode) return fresh
  const inventory = stored.inventory
  if (Array.isArray(inventory)) fresh.inventory = pickups.filter(id => inventory.includes(id))
  if (typeof stored.elapsedMs === 'number' && Number.isSafeInteger(stored.elapsedMs) && stored.elapsedMs >= 0) fresh.elapsedMs = stored.elapsedMs
  for (const id of puzzleIds) {
    const count = stored.hints?.[id]
    if (typeof count === 'number' && Number.isInteger(count) && count > 0) fresh.hints[id] = Math.min(count, puzzles[id].hints.length)
    if (stored.puzzleStates?.[id] !== 'completed' || puzzleState(fresh, id) !== 'available') continue
    fresh = finishPuzzle(fresh, id)
    if (id === 'cipher' && stored.drawerUnlocked === true) fresh = award({ ...fresh, drawerUnlocked: true }, drawerItems)
  }
  if (stored.exitUnlocked === true && validDate(stored.completedAt)) {
    fresh = applyEscapeAction(fresh, { type: 'UNLOCK_EXIT', at: stored.completedAt })
  }
  return fresh
}

export function escapeSummary(progress: EscapeRoomProgress) {
  return {
    puzzles: puzzleIds.filter(id => progress.puzzleStates[id] === 'completed').length,
    evidence: progress.inventory.filter(id => items[id].category !== 'Physical Items' && id !== 'note' && id !== 'sketch').length,
    hints: Object.values(progress.hints).reduce((sum, count) => sum + count, 0),
  }
}
