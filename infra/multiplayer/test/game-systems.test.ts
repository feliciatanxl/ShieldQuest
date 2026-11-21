import assert from 'node:assert/strict'
import { test } from 'node:test'
import { presets } from '../../../src/state/avatar'
import { guardians, readCollectedGuardians } from '../../../src/state/guardians'
import {
  applyEscapeAction, newEscapeRoom, puzzleState, escapeSummary,
} from '../../../src/state/escapeRoom'
import {
  bookOrder, drawerCode, letterOrder, safeCode, timeline,
} from '../../../src/state/missingEvidence'
import { canStartSpot, scoreSpot } from '../../../src/state/spotTheRisk'
import { newInvestigation } from '../../../src/state/investigation'

test('Friends system: code format and character alphabet validation', () => {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  const pattern = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/
  
  // Test code generation pattern
  for (let i = 0; i < 20; i++) {
    const code = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
    assert.equal(code.length, 8)
    assert.match(code, pattern)
  }

  // Reject invalid codes
  assert.equal(pattern.test('12345678'), false) // '1' is not in alphabet
  assert.equal(pattern.test('ABCDEFG0'), false) // '0' is not in alphabet
  assert.equal(pattern.test('SHORT'), false)
  assert.equal(pattern.test('TOOLONG123'), false)
  assert.equal(pattern.test('lowercase'), false)
})

test('Escape room: step-by-step puzzle progression and validation', () => {
  let progress = newEscapeRoom()
  assert.equal(progress.inventory.length, 0)
  assert.equal(puzzleState(progress, 'letter'), 'locked')

  // Collect letter pieces from the living room
  progress = applyEscapeAction(progress, { type: 'COLLECT_ITEM', objectId: 'house-coffee-table' })
  progress = applyEscapeAction(progress, { type: 'COLLECT_ITEM', objectId: 'house-bookshelf' })
  progress = applyEscapeAction(progress, { type: 'COLLECT_ITEM', objectId: 'house-painting' })
  assert.equal(progress.inventory.length, 3)
  assert.equal(puzzleState(progress, 'letter'), 'available')

  // Wrong letter sequence fails
  const badOrder = ['letter-fragment-3', 'letter-fragment-1', 'letter-fragment-2']
  const failedLetter = applyEscapeAction(progress, { type: 'SUBMIT_SEQUENCE', puzzleId: 'letter', order: badOrder })
  assert.equal(failedLetter.puzzleStates.letter, undefined)

  // Correct letter sequence succeeds and awards the reconstructed letter
  progress = applyEscapeAction(progress, { type: 'SUBMIT_SEQUENCE', puzzleId: 'letter', order: letterOrder })
  assert.equal(progress.puzzleStates.letter, 'completed')
  assert.equal(progress.inventory.includes('letter'), true)
  assert.equal(puzzleState(progress, 'cipher'), 'available')

  // Correct book cipher sequence
  progress = applyEscapeAction(progress, { type: 'SUBMIT_SEQUENCE', puzzleId: 'cipher', order: bookOrder })
  assert.equal(progress.puzzleStates.cipher, 'completed')
  assert.equal(progress.inventory.includes('cipher-rubbing'), true)

  // Unlock drawer with code
  assert.equal(progress.drawerUnlocked, false)
  const wrongDrawer = applyEscapeAction(progress, { type: 'UNLOCK_DRAWER', code: '999' })
  assert.equal(wrongDrawer.drawerUnlocked, false)

  progress = applyEscapeAction(progress, { type: 'UNLOCK_DRAWER', code: drawerCode })
  assert.equal(progress.drawerUnlocked, true)
  assert.equal(progress.inventory.includes('partial-reference'), true)

  // Collect remaining items for timeline
  progress = applyEscapeAction(progress, { type: 'COLLECT_ITEM', objectId: 'house-files' })
  progress = applyEscapeAction(progress, { type: 'COLLECT_ITEM', objectId: 'house-cabinet' })
  progress = applyEscapeAction(progress, { type: 'COLLECT_ITEM', objectId: 'house-clock' })
  assert.equal(puzzleState(progress, 'timeline'), 'available')

  // Timeline puzzle
  const timelineIds = timeline.map(e => e.id)
  progress = applyEscapeAction(progress, { type: 'SUBMIT_SEQUENCE', puzzleId: 'timeline', order: timelineIds })
  assert.equal(progress.puzzleStates.timeline, 'completed')
  assert.equal(puzzleState(progress, 'board'), 'available')

  // Evidence board review
  progress = applyEscapeAction(progress, { type: 'REVIEW_EVIDENCE' })
  assert.equal(progress.puzzleStates.board, 'completed')
  assert.equal(puzzleState(progress, 'study-safe'), 'available')

  // Safe keypad
  const wrongSafe = applyEscapeAction(progress, { type: 'SUBMIT_SAFE_CODE', code: '0000' })
  assert.equal(wrongSafe.puzzleStates['study-safe'], undefined)

  progress = applyEscapeAction(progress, { type: 'SUBMIT_SAFE_CODE', code: safeCode })
  assert.equal(progress.puzzleStates['study-safe'], 'completed')
  assert.equal(progress.inventory.includes('house-key'), true)
  assert.equal(progress.inventory.includes('final-evidence'), true)

  // Unlock exit door
  const completedAt = new Date().toISOString()
  progress = applyEscapeAction(progress, { type: 'UNLOCK_EXIT', at: completedAt })
  assert.equal(progress.exitUnlocked, true)
  assert.equal(progress.completedAt, completedAt)

  const summary = escapeSummary(progress)
  assert.equal(summary.puzzles, 5)
  assert(summary.evidence >= 5)
})

test('Guardian collection: prerequisites and unlock rules', () => {
  const shieldProgress: Record<string, any> = {}

  // Initially all guardians are locked
  for (const guardian of guardians) {
    assert.equal(shieldProgress[guardian.competency], undefined)
  }

  // Attempting to read collected guardians without passing competency filters them out
  const invalidCollected = readCollectedGuardians(['cluepaw', 'echo'], shieldProgress)
  assert.deepEqual(invalidCollected, [])

  // Passing Spot the Risk competency allows Cluepaw to be collected
  const now = new Date().toISOString()
  const responses = [
    { itemId: 'shelf-observation', answer: 'verified' as const },
    { itemId: 'shelf-assumption', answer: 'assumption' as const },
    { itemId: 'item-observation', answer: 'verified' as const },
    { itemId: 'item-assumption', answer: 'assumption' as const },
    { itemId: 'bag-observation', answer: 'verified' as const },
    { itemId: 'bag-assumption', answer: 'assumption' as const },
    { itemId: 'counter-observation', answer: 'verified' as const },
    { itemId: 'counter-assumption', answer: 'assumption' as const },
    { itemId: 'entrance-observation', answer: 'verified' as const },
    { itemId: 'entrance-assumption', answer: 'assumption' as const },
  ]
  const spotResult = scoreSpot(responses, now)
  assert(spotResult)
  assert.equal(spotResult.passed, true)

  shieldProgress.S = spotResult
  const validCollected = readCollectedGuardians(['cluepaw'], shieldProgress)
  assert.deepEqual(validCollected, ['cluepaw'])

  // Echo is still locked because H is not completed
  const partialCollected = readCollectedGuardians(['cluepaw', 'echo'], shieldProgress)
  assert.deepEqual(partialCollected, ['cluepaw'])
})

test('Investigation: prerequisites for Spot the Risk', () => {
  const investigation = newInvestigation()
  assert.equal(canStartSpot(investigation), false)

  // Only unlocks after spoke to Jun, made a choice, and found all clues
  investigation.spokeToJun = true
  investigation.choice = 'decline'
  assert.equal(canStartSpot(investigation), false)

  investigation.clues = ['shelf', 'item', 'bag', 'counter', 'entrance']
  assert.equal(canStartSpot(investigation), true)
})
