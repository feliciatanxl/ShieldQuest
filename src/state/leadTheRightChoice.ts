import type { ShieldAssessmentResult } from './shield'

export const LEAD_TITLE = 'SHIELD Challenge 5: Lead the Right Choice'
const ASSESSMENT_ID = 'lead-the-right-choice-v1'
export const LEAD_RULE = { assessmentVersion: 1, minimumCorrect: 3 } as const

export const fragmentSlots = [
  {
    id: 'opening', title: 'Acknowledge the friendship or situation', criterion: 'Respectful opening',
    fragments: [
      { id: 'acknowledge', text: 'I know we’re friends, and I want to help you.' },
      { id: 'insult', text: 'You’re such a terrible person.' },
      { id: 'publicise', text: 'Everyone should know what you’re doing.' },
    ],
    feedback: 'Acknowledge the friendship so the conversation can stay respectful.',
  },
  {
    id: 'alternative', title: 'Suggest a constructive alternative', criterion: 'Constructive alternative',
    fragments: [
      { id: 'shop-normally', text: 'Let’s just shop normally and pay for what we want.' },
      { id: 'avoid-getting-caught', text: 'Just make sure nobody catches you.' },
      { id: 'embarrass-cashier', text: 'Let’s embarrass the cashier instead.' },
    ],
    feedback: 'Suggest a responsible alternative that gives Jun another way forward.',
  },
  {
    id: 'next-action', title: 'Encourage a positive next action', criterion: 'Positive next action',
    fragments: [
      { id: 'counter-together', text: 'Come on, we can head to the counter together.' },
      { id: 'accuse', text: 'I’ll tell everyone you’re a thief.' },
      { id: 'cut-off', text: 'You should never speak to me again.' },
    ],
    feedback: 'Offer a specific, positive step that you can take together.',
  },
] as const

type Slot = typeof fragmentSlots[number]
export type FragmentSlotId = Slot['id']
export type FragmentId = Slot['fragments'][number]['id']
export type LeadDraft = Partial<Record<FragmentSlotId, FragmentId>>
export type LeadAnswers = Record<FragmentSlotId, FragmentId>
export type LeadResult = ShieldAssessmentResult<'L', FragmentId> & {
  assessmentVersion: typeof LEAD_RULE.assessmentVersion
  minimumCorrect: number
  criterionCorrect: Record<FragmentSlotId, boolean>
}

const leadKey = {
  opening: 'acknowledge', alternative: 'shop-normally', 'next-action': 'counter-together',
} as const satisfies LeadAnswers

export function leadFragmentText(slot: Slot, id: FragmentId | undefined) {
  return slot.fragments.find(fragment => fragment.id === id)?.text
}

export function scoreLead(
  answers: LeadAnswers, submittedAt: string, minimumCorrect: number = LEAD_RULE.minimumCorrect,
): LeadResult | null {
  if (!Number.isInteger(minimumCorrect) || minimumCorrect < 1 || minimumCorrect > fragmentSlots.length ||
      !fragmentSlots.every(slot => leadFragmentText(slot, answers[slot.id]))) return null
  const criterionCorrect = {
    opening: answers.opening === leadKey.opening,
    alternative: answers.alternative === leadKey.alternative,
    'next-action': answers['next-action'] === leadKey['next-action'],
  }
  const numberCorrect = Object.values(criterionCorrect).filter(Boolean).length
  return {
    competency: 'L', assessmentId: ASSESSMENT_ID, assessmentVersion: LEAD_RULE.assessmentVersion, status: 'completed',
    submittedAt, minimumCorrect, criterionCorrect, numberCorrect, passed: numberCorrect >= minimumCorrect,
    itemIds: fragmentSlots.map(slot => slot.id),
    responses: fragmentSlots.map(slot => ({ itemId: slot.id, answer: answers[slot.id] })),
    correctResponses: fragmentSlots.map(slot => ({ itemId: slot.id, answer: leadKey[slot.id] })),
  }
}

export function readLeadResult(value: unknown): LeadResult | undefined {
  if (!value || typeof value !== 'object') return
  const stored = value as Partial<LeadResult>
  if (stored.competency !== 'L' || stored.assessmentId !== ASSESSMENT_ID ||
      stored.assessmentVersion !== LEAD_RULE.assessmentVersion || stored.status !== 'completed' ||
      typeof stored.submittedAt !== 'string' || !Number.isFinite(Date.parse(stored.submittedAt)) ||
      typeof stored.minimumCorrect !== 'number' || !Array.isArray(stored.responses) ||
      stored.responses.length !== fragmentSlots.length) return

  const opening = stored.responses.find(response => response?.itemId === 'opening')?.answer
  const alternative = stored.responses.find(response => response?.itemId === 'alternative')?.answer
  const nextAction = stored.responses.find(response => response?.itemId === 'next-action')?.answer
  if (!opening || !alternative || !nextAction) return
  return scoreLead({ opening, alternative, 'next-action': nextAction }, stored.submittedAt, stored.minimumCorrect) ?? undefined
}
