import type { ShieldAssessmentResult } from './shield'

export const HOLD_TITLE = 'SHIELD Challenge 2: Hold Before Acting'
export const HOLD_ASSESSMENT_ID = 'hold-before-acting-v1'
export const HOLD_ITEM_ID = 'jun-immediate-response'

export const holdOptions = {
  A: { text: 'Okay, I’ll watch the entrance.', feedback: 'Agreeing makes you part of a request you are unsure about.' },
  B: { text: 'I don’t want to do that. Let’s just shop normally.', feedback: 'This response sets a clear boundary and refuses the request calmly.' },
  C: { text: 'Fine, but only for a minute.', feedback: 'A time limit still means agreeing to take part.' },
  D: { text: 'You’re definitely stealing! I’m telling everyone!', feedback: 'A public accusation escalates the situation. Jun’s intentions remain unknown.' },
} as const

export type HoldResponse = keyof typeof holdOptions
export type HoldResult = ShieldAssessmentResult<'H', HoldResponse>

export const holdResponses = Object.keys(holdOptions) as HoldResponse[]
const protectiveResponse: HoldResponse = 'B'

function isHoldResponse(value: unknown): value is HoldResponse {
  return typeof value === 'string' && Object.hasOwn(holdOptions, value)
}

export function scoreHold(response: HoldResponse, submittedAt: string): HoldResult {
  const passed = response === protectiveResponse
  return {
    competency: 'H', assessmentId: HOLD_ASSESSMENT_ID, status: 'completed',
    itemIds: [HOLD_ITEM_ID], responses: [{ itemId: HOLD_ITEM_ID, answer: response }],
    correctResponses: [{ itemId: HOLD_ITEM_ID, answer: protectiveResponse }],
    numberCorrect: Number(passed), passed, submittedAt,
  }
}

export function readHoldResult(value: unknown): HoldResult | undefined {
  if (!value || typeof value !== 'object') return
  const stored = value as Partial<HoldResult>
  if (stored.competency !== 'H' || stored.assessmentId !== HOLD_ASSESSMENT_ID ||
      stored.status !== 'completed' || typeof stored.submittedAt !== 'string' ||
      !Number.isFinite(Date.parse(stored.submittedAt)) || !Array.isArray(stored.responses) ||
      stored.responses.length !== 1) return
  const response = stored.responses[0]
  if (response?.itemId !== HOLD_ITEM_ID || !isHoldResponse(response.answer)) return
  return scoreHold(response.answer, stored.submittedAt)
}
