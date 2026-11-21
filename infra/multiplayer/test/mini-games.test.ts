import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateFreezeScore,
  FREEZE_FRAME_STAGES,
  FREEZE_HOTSPOTS,
  CLARIFICATION_QUESTIONS,
  FREEZE_DECISIONS,
} from '../../../src/state/freezeFrame'
import {
  evaluateWhisperBoard,
  WHISPER_SCENARIOS,
  INFLUENCE_TACTICS,
  type WhisperConnection,
} from '../../../src/state/whisperNetwork'

test('Freeze Frame: scenario timeline and inspection points data integrity', () => {
  assert.equal(FREEZE_FRAME_STAGES.length, 5)
  assert.equal(FREEZE_FRAME_STAGES[0].id, 1)
  assert.equal(FREEZE_FRAME_STAGES[4].id, 5)

  // Verify all active hotspots across stages exist in FREEZE_HOTSPOTS
  for (const stage of FREEZE_FRAME_STAGES) {
    for (const hId of stage.activeHotspotIds) {
      assert.ok(FREEZE_HOTSPOTS[hId], `Hotspot ${hId} in stage ${stage.id} must exist`)
    }
  }

  // Clarification questions exist
  assert.ok(CLARIFICATION_QUESTIONS.length >= 3)
})

test('Freeze Frame: pressing pause alone must NOT award a passing score', () => {
  const result = calculateFreezeScore({
    paused: true,
    timelinePositionsChecked: [1],
    inspectedHotspots: [],
    askedQuestionIds: [],
    decision: 'comply-lookout',
  })

  assert.equal(result.paused, true)
  assert.equal(result.verifiedBeforeActing, false)
  assert.equal(result.passed, false)
  assert.ok(result.score < 50)
})

test('Freeze Frame: rushing without pausing fails hold competency', () => {
  const result = calculateFreezeScore({
    paused: false,
    timelinePositionsChecked: [1],
    inspectedHotspots: ['jun-backpack', 'cctv-monitor'],
    askedQuestionIds: ['q-jun-purpose'],
    decision: 'calm-refusal',
  })

  assert.equal(result.paused, false)
  assert.equal(result.passed, false)
  assert.equal(result.patienceRating, 'Low')
})

test('Freeze Frame: full verification and calm refusal awards mastery and 100% score', () => {
  const result = calculateFreezeScore({
    paused: true,
    timelinePositionsChecked: [1, 2, 3, 4, 5],
    inspectedHotspots: ['jun-backpack', 'cctv-monitor', 'cashier-counter', 'entrance-door', 'jun-demeanor'],
    askedQuestionIds: ['q-jun-purpose', 'q-jun-bag', 'q-cashier-lookout'],
    decision: 'calm-refusal',
  })

  assert.equal(result.paused, true)
  assert.equal(result.verifiedBeforeActing, true)
  assert.equal(result.passed, true)
  assert.equal(result.score, 100)
  assert.equal(result.patienceRating, 'High')
  assert.equal(result.evidenceRating, 'Thorough')
  assert.ok(result.summaryNotes.some(n => n.includes('Held before acting')))
})

test('Freeze Frame: public accusation creates reckless escalation and fails', () => {
  const result = calculateFreezeScore({
    paused: true,
    timelinePositionsChecked: [1, 2, 3],
    inspectedHotspots: ['jun-backpack', 'cctv-monitor'],
    askedQuestionIds: ['q-jun-purpose'],
    decision: 'public-accusation',
  })

  assert.equal(result.passed, false)
  assert.ok(result.summaryNotes.some(n => n.includes('Flawed decision')))
})

test('Whisper Network: scenarios and tactics definitions exist', () => {
  assert.ok(WHISPER_SCENARIOS['snack-dare'])
  assert.ok(WHISPER_SCENARIOS['fast-cash'])

  const tacticsCount = Object.keys(INFLUENCE_TACTICS).length
  assert.ok(tacticsCount >= 7)
  assert.ok(INFLUENCE_TACTICS['urgency'])
  assert.ok(INFLUENCE_TACTICS['social-proof'])
  assert.ok(INFLUENCE_TACTICS['dare'])
  assert.ok(INFLUENCE_TACTICS['false-authority'])
})

test('Whisper Network: empty board yields zero score and cadet rank', () => {
  const result = evaluateWhisperBoard({
    scenarioId: 'snack-dare',
    connections: [],
  })

  assert.equal(result.correctConnectionsCount, 0)
  assert.equal(result.score, 0)
  assert.equal(result.passed, false)
  assert.equal(result.detectiveRank, 'Cadet')
})

test('Whisper Network Case 1: correctly mapping all tactics and rumour origin passes with top rank', () => {
  const scenario = WHISPER_SCENARIOS['snack-dare']
  const connections: WhisperConnection[] = scenario.targetSolutions.map((sol, index) => ({
    id: `conn-${index}`,
    phraseId: sol.phraseId,
    speakerId: sol.expectedSource,
    tacticId: sol.expectedTactic,
    targetId: sol.expectedTarget,
  }))

  const result = evaluateWhisperBoard({
    scenarioId: 'snack-dare',
    connections,
    selectedTwistedSpeakerId: scenario.rumourDistortion.originalTruthSpeaker,
  })

  assert.equal(result.correctConnectionsCount, scenario.targetSolutions.length)
  assert.equal(result.identifiedTwistedFact, true)
  assert.equal(result.score, 100)
  assert.equal(result.passed, true)
  assert.equal(result.detectiveRank, 'Chief Guardian Analyst')
})

test('Whisper Network Case 2: correctly mapping financial scam tactics awards Senior Investigator or higher', () => {
  const scenario = WHISPER_SCENARIOS['fast-cash']
  const connections: WhisperConnection[] = scenario.targetSolutions.map((sol, index) => ({
    id: `conn-${index}`,
    phraseId: sol.phraseId,
    speakerId: sol.expectedSource,
    tacticId: sol.expectedTactic,
    targetId: sol.expectedTarget,
  }))

  const result = evaluateWhisperBoard({
    scenarioId: 'fast-cash',
    connections,
    selectedTwistedSpeakerId: 'may', // Auntie May gave factual police bulletin
  })

  assert.equal(result.correctConnectionsCount, scenario.targetSolutions.length)
  assert.equal(result.identifiedTwistedFact, true)
  assert.equal(result.score, 100)
  assert.equal(result.passed, true)
  assert.equal(result.detectiveRank, 'Chief Guardian Analyst')
})
