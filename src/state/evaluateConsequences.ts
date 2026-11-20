import { shuffleOptions, type ShieldAssessmentResult } from './shield'

export const CONSEQUENCES_TITLE = 'SHIELD Challenge 4: Evaluate Consequences'
const ASSESSMENT_IDS = { 1: 'evaluate-consequences-v1', 2: 'evaluate-consequences-v2' } as const
type AssessmentVersion = keyof typeof ASSESSMENT_IDS
export const CONSEQUENCE_RULE = { assessmentVersion: 2, minimumCorrectChains: 2 } as const

export const decisions = [
  { id: 'agree', label: 'Decision A', text: 'Agree to watch the entrance for Jun.' },
  { id: 'decline', label: 'Decision B', text: 'Calmly decline Jun’s request.' },
  { id: 'accuse', label: 'Decision C', text: 'Publicly accuse Jun of stealing without evidence.' },
] as const

export const immediateOptions = {
  confrontation: 'The situation could become confrontational.',
  lookOut: 'You take on the lookout role without knowing Jun’s intentions.',
  avoidInvolvement: 'You avoid participating in the unexplained lookout request.',
} as const

export const laterOptions = {
  maintainBoundary: 'You maintain your personal boundary, although Jun might be disappointed.',
  damageTrust: 'An unsupported accusation could unfairly damage Jun’s reputation or relationships.',
  possibleProblems: 'If wrongdoing occurs, your involvement could create problems for you and others.',
} as const

export type DecisionId = typeof decisions[number]['id']
export type ImmediateId = keyof typeof immediateOptions
export type LaterId = keyof typeof laterOptions
export type ConsequenceStage = 'immediate' | 'later'

export const consequenceStages = [
  { id: 'immediate', title: 'Immediate consequence' },
  { id: 'later', title: 'Possible longer-term consequence' },
] as const

type SelectedConsequences = { immediate: ImmediateId; later: LaterId }
export type ConsequenceMatch = SelectedConsequences & { decisionId: DecisionId }
type ScoredChain = ConsequenceMatch & {
  linkCorrect: Record<ConsequenceStage, boolean>
  correct: boolean
}

export type ConsequencesResult = Omit<
  ShieldAssessmentResult<'E', ImmediateId | LaterId>, 'itemIds' | 'responses' | 'correctResponses'
> & {
  assessmentVersion: AssessmentVersion
  minimumCorrectChains: number
  decisionIds: DecisionId[]
  chains: ScoredChain[]
  correctChains: number
}

export const consequenceKey = {
  agree: { immediate: 'lookOut', later: 'possibleProblems' },
  decline: { immediate: 'avoidInvolvement', later: 'maintainBoundary' },
  accuse: { immediate: 'confrontation', later: 'damageTrust' },
} as const satisfies Record<DecisionId, SelectedConsequences>

export const consequenceExplanations: Record<DecisionId, string> = {
  agree: 'Watching the entrance makes you part of the request. Any later problems depend on what happens next.',
  decline: 'Declining keeps you out of the request. Jun may feel disappointed, even though you have kept your boundary.',
  accuse: 'An accusation made in public can create conflict immediately. Its effect on trust or reputation may last longer.',
}

export function shuffledConsequenceIds<T extends Record<string, string>>(options: T, random = Math.random) {
  return shuffleOptions(Object.keys(options) as (keyof T & string)[], random)
}

export function scoreConsequences(
  matches: readonly ConsequenceMatch[], submittedAt: string,
  minimumCorrectChains: number = CONSEQUENCE_RULE.minimumCorrectChains,
): ConsequencesResult | null {
  return gradeConsequences(matches, submittedAt, minimumCorrectChains, CONSEQUENCE_RULE.assessmentVersion)
}

function gradeConsequences(
  matches: readonly ConsequenceMatch[], submittedAt: string, minimumCorrectChains: number, version: AssessmentVersion,
): ConsequencesResult | null {
  if (matches.length !== decisions.length || !Number.isInteger(minimumCorrectChains) ||
      minimumCorrectChains < 1 || minimumCorrectChains > decisions.length) return null

  const chains: ScoredChain[] = []
  for (const decision of decisions) {
    const match = matches.find(candidate => candidate?.decisionId === decision.id)
    if (!match || typeof match.immediate !== 'string' || typeof match.later !== 'string' ||
        !Object.hasOwn(immediateOptions, match.immediate) || !Object.hasOwn(laterOptions, match.later)) return null
    const key = consequenceKey[decision.id]
    const linkCorrect = { immediate: match.immediate === key.immediate, later: match.later === key.later }
    chains.push({
      decisionId: decision.id, immediate: match.immediate, later: match.later,
      linkCorrect, correct: linkCorrect.immediate && linkCorrect.later,
    })
  }

  // Earlier completed attempts could reuse an option. The one-use rule applies to new attempts.
  if (version === 2 && consequenceStages.some(({ id }) =>
    new Set(chains.map(chain => chain[id])).size !== decisions.length)) return null

  const numberCorrect = chains.reduce((total, chain) => total + Number(chain.linkCorrect.immediate) + Number(chain.linkCorrect.later), 0)
  const correctChains = chains.filter(chain => chain.correct).length
  return {
    competency: 'E', assessmentId: ASSESSMENT_IDS[version], assessmentVersion: version,
    status: 'completed', submittedAt, decisionIds: decisions.map(decision => decision.id), chains,
    minimumCorrectChains, numberCorrect, correctChains, passed: correctChains >= minimumCorrectChains,
  }
}

export function readConsequencesResult(value: unknown): ConsequencesResult | undefined {
  if (!value || typeof value !== 'object') return
  const stored = value as Partial<ConsequencesResult>
  const version = stored.assessmentVersion
  if ((version !== 1 && version !== 2) ||
      stored.competency !== 'E' || stored.assessmentId !== ASSESSMENT_IDS[version] || stored.status !== 'completed' ||
      typeof stored.submittedAt !== 'string' || !Number.isFinite(Date.parse(stored.submittedAt)) ||
      typeof stored.minimumCorrectChains !== 'number' || !Array.isArray(stored.chains)) return
  return gradeConsequences(stored.chains, stored.submittedAt, stored.minimumCorrectChains, version) ?? undefined
}
