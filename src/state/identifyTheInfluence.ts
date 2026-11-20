import type { ShieldAssessmentResult } from './shield'

export const INFLUENCE_TITLE = 'SHIELD Challenge 3: Identify the Influence'
export const INFLUENCE_ASSESSMENT_ID = 'identify-the-influence-v1'

export const influenceOptions = ['A', 'B', 'C', 'D'] as const
export type InfluenceOption = typeof influenceOptions[number]
export type InfluencePart = 'pressure-tactic' | 'requested-role'
export type InfluenceAnswers = Record<InfluencePart, InfluenceOption>
export type InfluenceResult = ShieldAssessmentResult<'I', InfluenceOption> & {
  partCorrect: Record<InfluencePart, boolean>
}

type Part = {
  id: InfluencePart
  title: string
  question: string
  options: Record<InfluenceOption, string>
  correct: InfluenceOption
  explanation: string
}

export const influenceParts = [
  {
    id: 'pressure-tactic',
    title: 'Part A · Pressure tactic',
    question: 'What is Jun doing to influence your decision?',
    options: {
      A: 'Appealing to your friendship to encourage you to comply.',
      B: 'Giving you a neutral explanation of store rules.',
      C: 'Asking you to compare product prices.',
      D: 'Providing verified evidence that no wrongdoing is involved.',
    },
    correct: 'A',
    explanation: '“We’re friends right?” appeals to your friendship. It can make agreeing feel like a way to prove your loyalty.',
  },
  {
    id: 'requested-role',
    title: 'Part B · Requested role',
    question: 'What is Jun asking you to do?',
    options: {
      A: 'Help the cashier organise products.',
      B: 'Watch the shop entrance and alert Jun if someone approaches.',
      C: 'Pay for Jun’s shopping.',
      D: 'Check the price of a snack.',
    },
    correct: 'B',
    explanation: 'A lookout watches the entrance and alerts someone when another person approaches. That describes the role Jun is asking you to take.',
  },
] as const satisfies readonly Part[]

function isInfluenceOption(value: unknown): value is InfluenceOption {
  return value === 'A' || value === 'B' || value === 'C' || value === 'D'
}

export function scoreInfluence(answers: InfluenceAnswers, submittedAt: string): InfluenceResult {
  const [tactic, role] = influenceParts
  const partCorrect = {
    'pressure-tactic': answers['pressure-tactic'] === tactic.correct,
    'requested-role': answers['requested-role'] === role.correct,
  }
  const numberCorrect = Number(partCorrect['pressure-tactic']) + Number(partCorrect['requested-role'])
  return {
    competency: 'I', assessmentId: INFLUENCE_ASSESSMENT_ID, status: 'completed',
    itemIds: influenceParts.map(part => part.id),
    responses: influenceParts.map(part => ({ itemId: part.id, answer: answers[part.id] })),
    correctResponses: influenceParts.map(part => ({ itemId: part.id, answer: part.correct })),
    partCorrect, numberCorrect, passed: numberCorrect === influenceParts.length, submittedAt,
  }
}

export function readInfluenceResult(value: unknown): InfluenceResult | undefined {
  if (!value || typeof value !== 'object') return
  const stored = value as Partial<InfluenceResult>
  if (stored.competency !== 'I' || stored.assessmentId !== INFLUENCE_ASSESSMENT_ID ||
      stored.status !== 'completed' || typeof stored.submittedAt !== 'string' ||
      !Number.isFinite(Date.parse(stored.submittedAt)) || !Array.isArray(stored.responses) ||
      stored.responses.length !== influenceParts.length) return

  const tactic = stored.responses.find(response => response?.itemId === 'pressure-tactic')?.answer
  const role = stored.responses.find(response => response?.itemId === 'requested-role')?.answer
  if (!isInfluenceOption(tactic) || !isInfluenceOption(role)) return
  return scoreInfluence({ 'pressure-tactic': tactic, 'requested-role': role }, stored.submittedAt)
}
