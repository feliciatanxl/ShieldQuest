import { clueIds, clues, type Investigation } from './investigation'
import type { ShieldAssessmentItem, ShieldAssessmentResponse, ShieldAssessmentResult } from './shield'

export type Classification = 'verified' | 'assumption'
export type SpotResponse = ShieldAssessmentResponse<Classification>
export type SpotResult = ShieldAssessmentResult<'S', Classification> & { factualCorrect: number; falseAlarms: number }

export const SPOT_TITLE = 'SHIELD Challenge 1: Spot the Risk'
export const SPOT_ASSESSMENT_ID = 'spot-the-risk-v1'
export const REQUIRED_FACTS = 4
export const MAX_FALSE_ALARMS = 1

const assumptionFirst = new Set(['item', 'counter'])
const factualFeedback = {
  shelf: 'The gap is visible in the display. It does not explain where a packet went.',
  item: 'The packet and its location are visible. Payment and ownership are still unknown.',
  bag: 'You can see the tote beside the table. Its contents and purpose are unknown.',
  counter: 'The cashier, register and receipt tray are visible. Those details cannot verify a particular sale.',
  entrance: 'The open entry and the green mat are visible. They do not reveal who passed through.',
}
export const spotCards = clueIds.map(clueId => {
  const clue = clues[clueId]
  const fact: ShieldAssessmentItem<Classification> = {
    id: clueId + '-observation',
    statement: clue.observed,
    correctResponse: 'verified',
    feedback: factualFeedback[clueId],
  }
  const assumption: ShieldAssessmentItem<Classification> = {
    id: clueId + '-assumption',
    statement: clue.assumption,
    correctResponse: 'assumption',
    feedback: 'The clue leaves this unknown: ' + clue.unknown,
  }
  return { id: clueId, title: clue.title, items: assumptionFirst.has(clueId) ? [assumption, fact] : [fact, assumption] }
})

export const spotItems = spotCards.flatMap(card => card.items)

export function canStartSpot(investigation: Investigation) {
  return clueIds.every(id => investigation.clues.includes(id))
}

export function scoreSpot(responses: readonly SpotResponse[], submittedAt: string): SpotResult | null {
  const answers = new Map(responses.map(response => [response.itemId, response.answer]))
  if (responses.length !== spotItems.length || answers.size !== spotItems.length) return null

  const ordered: SpotResponse[] = []
  let numberCorrect = 0
  let factualCorrect = 0
  let falseAlarms = 0
  for (const item of spotItems) {
    const answer = answers.get(item.id)
    if (answer !== 'verified' && answer !== 'assumption') return null
    ordered.push({ itemId: item.id, answer })
    if (answer === item.correctResponse) {
      numberCorrect++
      if (answer === 'verified') factualCorrect++
    } else if (answer === 'verified') {
      falseAlarms++
    }
  }

  return {
    competency: 'S', assessmentId: SPOT_ASSESSMENT_ID, status: 'completed',
    itemIds: spotItems.map(item => item.id), responses: ordered,
    correctResponses: spotItems.map(item => ({ itemId: item.id, answer: item.correctResponse })),
    numberCorrect, factualCorrect, falseAlarms,
    passed: factualCorrect >= REQUIRED_FACTS && falseAlarms <= MAX_FALSE_ALARMS,
    submittedAt,
  }
}

export function readSpotResult(value: unknown): SpotResult | undefined {
  if (!value || typeof value !== 'object') return
  const stored = value as Partial<SpotResult>
  if (stored.competency !== 'S' || stored.assessmentId !== SPOT_ASSESSMENT_ID ||
      stored.status !== 'completed' || typeof stored.submittedAt !== 'string' ||
      !Number.isFinite(Date.parse(stored.submittedAt)) || !Array.isArray(stored.responses) ||
      !stored.responses.every(response => response && typeof response.itemId === 'string')) return
  return scoreSpot(stored.responses, stored.submittedAt) ?? undefined
}
