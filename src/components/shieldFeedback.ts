const feedbackMode = import.meta.env.VITE_SHIELD_FEEDBACK === 'after-post-test' ? 'after-post-test' : 'immediate'

export function canReviewShieldAnswers(postTestComplete: boolean) {
  return feedbackMode === 'immediate' || postTestComplete
}
