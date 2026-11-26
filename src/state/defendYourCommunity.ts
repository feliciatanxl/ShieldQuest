import type { ShieldAssessmentResult } from './shield'

export const DEFEND_TITLE = 'SHIELD Challenge 6: Defend Your Community'
export const STORY_TITLE = 'Continue the Story'
export const FRAMEWORK_COMPLETE = 'SHIELD Framework Challenges Completed'
const ASSESSMENT_ID = 'defend-your-community-v1'
export const DEFEND_RULE = { assessmentVersion: 1, minimumCorrect: 3 } as const

export const helpStages = [
  {
    id: 'channel', title: 'Who to approach', question: 'Who would be appropriate to approach?',
    criterion: 'Appropriate help channel',
    options: [
      { id: 'cashier-or-trusted-adult', text: 'The shop cashier or a trusted adult.' },
      { id: 'social-media', text: 'A public social-media audience.' },
      { id: 'confrontation-group', text: 'A group of friends who can confront Jun.' },
    ],
    feedback: 'Shop staff or a trusted adult can listen privately and decide how to respond to what you observed.',
  },
  {
    id: 'communication', title: 'What to communicate', question: 'What should you communicate?',
    criterion: 'Objective communication',
    options: [
      { id: 'share-request-with-uncertainty', text: 'Jun asked me to watch the entrance, but I don’t know why.' },
      { id: 'claim-theft', text: 'Jun definitely stole something.' },
      { id: 'warn-others-away', text: 'Everyone should stay away from Jun.' },
    ],
    feedback: 'Describe the request you heard and say what you are unsure about. The request alone leaves Jun’s intentions unknown.',
  },
  {
    id: 'follow-up', title: 'Safe next action', question: 'What should you do after seeking help?',
    criterion: 'Safe follow-up',
    options: [
      { id: 'leave-to-staff-safely', text: 'Allow the responsible adult or shop staff to assess the situation, while staying safe.' },
      { id: 'follow-and-record', text: 'Follow Jun and secretly record him for social media.' },
      { id: 'public-confrontation', text: 'Publicly confront Jun and demand an explanation.' },
    ],
    feedback: 'Give the adult or staff member space to assess the situation. Stay somewhere safe and let them handle the follow-up.',
  },
] as const

type HelpStage = typeof helpStages[number]
export type HelpStageId = HelpStage['id']
export type HelpOptionId = HelpStage['options'][number]['id']
export type HelpPlan = Partial<Record<HelpStageId, HelpOptionId>>
export type DefendAnswers = Record<HelpStageId, HelpOptionId>
export type DefendResult = ShieldAssessmentResult<'D', HelpOptionId> & {
  assessmentVersion: typeof DEFEND_RULE.assessmentVersion
  minimumCorrect: number
  criterionCorrect: Record<HelpStageId, boolean>
}

const defendKey = {
  channel: 'cashier-or-trusted-adult',
  communication: 'share-request-with-uncertainty',
  'follow-up': 'leave-to-staff-safely',
} as const satisfies DefendAnswers

export function helpOptionText(stage: HelpStage, id?: HelpOptionId) {
  return stage.options.find(option => option.id === id)?.text
}

export function scoreDefend(
  answers: DefendAnswers, submittedAt: string, minimumCorrect: number = DEFEND_RULE.minimumCorrect,
): DefendResult | null {
  if (!Number.isInteger(minimumCorrect) || minimumCorrect < 1 || minimumCorrect > helpStages.length ||
      !helpStages.every(stage => helpOptionText(stage, answers[stage.id]))) return null
  const criterionCorrect = {
    channel: answers.channel === defendKey.channel,
    communication: answers.communication === defendKey.communication,
    'follow-up': answers['follow-up'] === defendKey['follow-up'],
  }
  const numberCorrect = Object.values(criterionCorrect).filter(Boolean).length
  return {
    competency: 'D', assessmentId: ASSESSMENT_ID, assessmentVersion: DEFEND_RULE.assessmentVersion,
    status: 'completed', submittedAt, minimumCorrect, criterionCorrect, numberCorrect, passed: numberCorrect >= minimumCorrect,
    itemIds: helpStages.map(stage => stage.id),
    responses: helpStages.map(stage => ({ itemId: stage.id, answer: answers[stage.id] })),
    correctResponses: helpStages.map(stage => ({ itemId: stage.id, answer: defendKey[stage.id] })),
  }
}

export function readDefendResult(value: unknown): DefendResult | undefined {
  if (!value || typeof value !== 'object') return
  const stored = value as Partial<DefendResult>
  if (stored.competency !== 'D' || stored.assessmentId !== ASSESSMENT_ID ||
      stored.assessmentVersion !== DEFEND_RULE.assessmentVersion || stored.status !== 'completed' ||
      typeof stored.submittedAt !== 'string' || !Number.isFinite(Date.parse(stored.submittedAt)) ||
      typeof stored.minimumCorrect !== 'number' || !Array.isArray(stored.responses) ||
      stored.responses.length !== helpStages.length) return

  const channel = stored.responses.find(response => response?.itemId === 'channel')?.answer
  const communication = stored.responses.find(response => response?.itemId === 'communication')?.answer
  const followUp = stored.responses.find(response => response?.itemId === 'follow-up')?.answer
  if (!channel || !communication || !followUp) return
  return scoreDefend({ channel, communication, 'follow-up': followUp }, stored.submittedAt, stored.minimumCorrect) ?? undefined
}
