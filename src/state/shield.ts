export type ShieldCompetency = 'S' | 'H' | 'I' | 'E' | 'L' | 'D'
export type ShieldAssessmentStatus = 'not-started' | 'in-progress' | 'completed'

export interface ShieldAssessmentItem<Answer extends string> {
  id: string
  statement: string
  correctResponse: Answer
  feedback: string
}

export interface ShieldAssessmentResponse<Answer extends string> {
  itemId: string
  answer: Answer
}

export interface ShieldAssessmentResult<Competency extends ShieldCompetency, Answer extends string> {
  competency: Competency
  assessmentId: string
  status: Extract<ShieldAssessmentStatus, 'completed'>
  itemIds: string[]
  responses: ShieldAssessmentResponse<Answer>[]
  correctResponses: ShieldAssessmentResponse<Answer>[]
  numberCorrect: number
  passed: boolean
  submittedAt: string
}
import type { HoldResult } from './holdBeforeActing'
import type { ConsequencesResult } from './evaluateConsequences'
import type { InfluenceResult } from './identifyTheInfluence'
import type { LeadResult } from './leadTheRightChoice'
import type { SpotResult } from './spotTheRisk'
import type { DefendResult } from './defendYourCommunity'

export type ShieldProgress = { S?: SpotResult; H?: HoldResult; I?: InfluenceResult; E?: ConsequencesResult; L?: LeadResult; D?: DefendResult }
export type AvailableAssessment = keyof ShieldProgress

export function shuffleOptions<T>(options: readonly T[], random = Math.random) {
  const shuffled = [...options]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const swap = Math.floor(random() * (i + 1))
    const current = shuffled[i]
    shuffled[i] = shuffled[swap]
    shuffled[swap] = current
  }
  return shuffled
}
