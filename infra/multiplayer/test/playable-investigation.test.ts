import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  calculateFreezeScore,
  FREEZE_DECISIONS,
  FREEZE_HOTSPOTS,
  type FreezeDecisionId,
  type FreezeHotspotId,
} from '../../../src/state/freezeFrame'
import {
  evaluateWhisperBoard,
  WHISPER_SCENARIOS,
  type WhisperConnection,
} from '../../../src/state/whisperNetwork'
import {
  FREEZE_FRAME_SIZE,
  FREEZE_FRAME_SPAWN,
  HOUSE_H_DOOR,
  HOUSE_H_SPAWN,
  HOUSE_I_DOOR,
  HOUSE_I_SPAWN,
} from '../../../src/game/locations'
import { freezeFrameObjects } from '../../../src/game/freezeFrameLayout'
import { houseIObjects } from '../../../src/game/houseILayout'
import { readSave, SAVE_KEY, newSave, type Save } from '../../../src/state/saveGame'
import { presets } from '../../../src/state/avatar'

test('Freeze Frame: Playable scene hotspots, evidence, and spawn definitions', () => {
  // Spawn and size definitions
  assert.equal(FREEZE_FRAME_SIZE.x, 10)
  assert.equal(FREEZE_FRAME_SIZE.y, 8)
  assert.ok(FREEZE_FRAME_SPAWN.x >= 0 && FREEZE_FRAME_SPAWN.x <= 10)
  assert.ok(FREEZE_FRAME_SPAWN.y >= 0 && FREEZE_FRAME_SPAWN.y <= 8)

  // Hotspots available in the physical Minimart investigation scene
  const hotspotIds = freezeFrameObjects.map(h => h.id)
  assert.ok(hotspotIds.includes('exit-freeze-frame'), 'Scene has exit door back to House H')
  assert.ok(hotspotIds.includes('ff-backpack'), 'Scene has Jun’s backpack hotspot')
  assert.ok(hotspotIds.includes('ff-cctv'), 'Scene has CCTV monitor hotspot')
  assert.ok(hotspotIds.includes('ff-counter'), 'Scene has cashier counter store rules hotspot')
  assert.ok(hotspotIds.includes('ff-basket'), 'Scene has shopping basket hotspot')
  assert.ok(hotspotIds.includes('ff-door'), 'Scene has entrance door inspection hotspot')
  assert.ok(hotspotIds.includes('ff-jun'), 'Scene has Jun interaction hotspot')
  assert.ok(hotspotIds.includes('ff-cashier'), 'Scene has Cashier Mr. Tan interaction hotspot')

  // Verify critical evidence facts exist
  assert.equal(FREEZE_HOTSPOTS['jun-backpack'].criticalForVerification, true)
  assert.equal(FREEZE_HOTSPOTS['cctv-monitor'].criticalForVerification, true)
  assert.equal(FREEZE_HOTSPOTS['jun-demeanor'].criticalForVerification, true)
})

test('Freeze Frame: Verification before action scoring flow', () => {
  const allCriticalHotspots: FreezeHotspotId[] = [
    'jun-backpack',
    'cctv-monitor',
    'cashier-counter',
    'entrance-door',
    'jun-demeanor',
  ]
  const clarifyingQuestions = ['q-jun-purpose', 'q-jun-bag', 'q-cashier-lookout']

  // 1. Player freezes time, inspects all critical evidence, clarifies with Jun & Mr. Tan, then chooses calm refusal
  const thoroughResult = calculateFreezeScore({
    paused: true,
    timelinePositionsChecked: [1, 2, 3, 4, 5],
    inspectedHotspots: allCriticalHotspots,
    askedQuestionIds: clarifyingQuestions,
    decision: 'calm-refusal',
  })
  assert.equal(thoroughResult.passed, true)
  assert.equal(thoroughResult.score, 100)
  assert.equal(thoroughResult.patienceRating, 'High')
  assert.equal(thoroughResult.evidenceRating, 'Thorough')
  assert.equal(thoroughResult.verifiedBeforeActing, true)

  // 2. Player rushes without pausing: fails hold competency regardless of response
  const rushedResult = calculateFreezeScore({
    paused: false,
    timelinePositionsChecked: [1],
    inspectedHotspots: [],
    askedQuestionIds: [],
    decision: 'calm-refusal',
  })
  assert.equal(rushedResult.passed, false)
  assert.ok(rushedResult.score <= 35)
  assert.equal(rushedResult.patienceRating, 'Low')
  assert.equal(rushedResult.verifiedBeforeActing, false)

  // 3. Player pauses but complies with lookout request: fails hold competency
  const complyResult = calculateFreezeScore({
    paused: true,
    timelinePositionsChecked: [1, 2],
    inspectedHotspots: allCriticalHotspots,
    askedQuestionIds: clarifyingQuestions,
    decision: 'comply-lookout',
  })
  assert.equal(complyResult.passed, false)
  assert.equal(complyResult.decision, 'comply-lookout')
  assert.ok(complyResult.summaryNotes.some(n => n.includes('Critical failure')))
})

test('Whisper Network: Investigation room layout and witness hotspots', () => {
  const ids = houseIObjects.map(h => h.id)
  assert.ok(ids.includes('whisper-station'), 'Influence Board hotspot exists')
  assert.ok(ids.includes('whisper-amir'), 'Amir interview hotspot exists')
  assert.ok(ids.includes('whisper-may'), 'Auntie May interview hotspot exists')
  assert.ok(ids.includes('whisper-jun'), 'Jun interview hotspot exists')
  assert.ok(ids.includes('whisper-terminal'), 'Chat terminal archive hotspot exists')
  assert.ok(ids.includes('exit-house-i'), 'Exit door exists')
})

test('Whisper Network: Interactive deduction board evaluation', () => {
  const scenario = WHISPER_SCENARIOS['snack-dare']

  // Map target solutions
  const fullCorrectConnections: WhisperConnection[] = scenario.targetSolutions.map((sol, idx) => ({
    id: `conn-${idx}`,
    phraseId: sol.phraseId,
    speakerId: sol.expectedSource,
    tacticId: sol.expectedTactic,
    targetId: sol.expectedTarget,
  }))

  // 1. Correct connections + verified rumour distortion -> passes with top rank
  const topResult = evaluateWhisperBoard({
    scenarioId: 'snack-dare',
    connections: fullCorrectConnections,
    selectedTwistedSpeakerId: scenario.rumourDistortion.originalTruthSpeaker,
  })
  assert.equal(topResult.passed, true)
  assert.equal(topResult.score, 100)
  assert.equal(topResult.detectiveRank, 'Chief Guardian Analyst')
  assert.equal(topResult.identifiedTwistedFact, true)

  // 2. Empty connections -> zero score
  const emptyResult = evaluateWhisperBoard({
    scenarioId: 'snack-dare',
    connections: [],
  })
  assert.equal(emptyResult.passed, false)
  assert.equal(emptyResult.score, 0)
  assert.equal(emptyResult.detectiveRank, 'Cadet')
})

test('Save system: Restoring FreezeFrame location properly', () => {
  const mockStorage: Record<string, string> = {}
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
    key: (i: number) => Object.keys(mockStorage)[i] ?? null,
    length: 0,
  }

  const baseSave = newSave(presets[0].avatar)
  const ffSave: Save = {
    ...baseSave,
    scene: 'FreezeFrame',
    position: FREEZE_FRAME_SPAWN,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(ffSave))
  const loaded = readSave()
  assert.ok(loaded)
  assert.equal(loaded.scene, 'FreezeFrame')
  assert.deepEqual(loaded.position, FREEZE_FRAME_SPAWN)
})
