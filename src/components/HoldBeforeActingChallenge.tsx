import { useState, type FormEvent } from 'react'
import { Check, ClipboardCheck } from 'lucide-react'
import { holdOptions, holdResponses, type HoldResponse, type HoldResult } from '../state/holdBeforeActing'
import { canReviewShieldAnswers } from './shieldFeedback'
import { Button, Modal } from './ui'

export function HoldBeforeActingChallenge({ result, postTestComplete = false, onSubmit, onClose }: {
  result?: HoldResult
  postTestComplete?: boolean
  onSubmit: (response: HoldResponse) => void
  onClose: () => void
}) {
  const [selection, setSelection] = useState<HoldResponse | null>(null)
  const [confirming, setConfirming] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (result || !selection) return
    if (confirming) onSubmit(selection)
    else setConfirming(true)
  }

  return <Modal title="Hold Before Acting" eyebrow="SHIELD CHALLENGE 2 · H" className="spot-challenge hold-challenge" onClose={onClose}>
    {result ? <HoldFeedback result={result} showReview={canReviewShieldAnswers(postTestComplete)} onClose={onClose} />
      : <form onSubmit={submit}>
        <section className="spot-card hold-scenario" aria-label="Situation">
          <p>You are inside Sunshine Minimart. Your friend Jun approaches you and says</p>
          <blockquote>“Eh, can you watch the door for me? Just let me know if anyone comes.”</blockquote>
          <p>You are unsure what Jun intends to do. You need to decide how to respond immediately.</p>
        </section>
        {confirming && selection ? <section className="spot-card hold-selection" aria-labelledby="hold-confirm-heading">
          <h3 id="hold-confirm-heading" tabIndex={-1} ref={heading => { heading?.focus() }}>Confirm your response</h3>
          <p>{selection}. “{holdOptions[selection].text}”</p>
          <p>You can change your selection before submitting. Your submitted response is final.</p>
        </section> : <fieldset className="spot-card hold-selection">
          <legend>How do you respond right now?</legend>
          <div className="spot-options">
            {holdResponses.map(option => <label key={option}>
              <input type="radio" name="hold-response" value={option} checked={selection === option} autoFocus={selection === option}
                onChange={() => setSelection(option)} />
              <span><strong>{option}.</strong> “{holdOptions[option].text}”</span>
            </label>)}
          </div>
        </fieldset>}
        <div className="modal-actions">
          {confirming && <Button className="secondary" onClick={() => setConfirming(false)}>Change response</Button>}
          <Button type="submit" className="primary" disabled={!selection}>
            <ClipboardCheck size={17} /> {confirming ? 'Confirm submission' : 'Review response'}
          </Button>
        </div>
      </form>}
  </Modal>
}

function HoldFeedback({ result, showReview, onClose }: {
  result: HoldResult
  showReview: boolean
  onClose: () => void
}) {
  const answer = result.responses[0].answer
  return <>
    <section className="spot-result" aria-label="Hold Before Acting result">
      <h3><Check size={19} /> Hold Before Acting — Completed</h3>
      {showReview ? <>
        <p role="status">{result.passed ? 'Your response set a safe boundary.' : 'Your response did not set a safe boundary.'}</p>
        <p><strong>Your response</strong> · “{holdOptions[answer].text}”</p>
        <p>{holdOptions[answer].feedback}</p>
        <p>You can calmly refuse to take part even when you have no proof that anything is wrong.</p>
      </> : <p role="status">Your response was recorded. Feedback becomes available after the post-test.</p>}
    </section>
    <div className="modal-actions"><Button className="primary" onClick={onClose}>Continue exploring</Button></div>
  </>
}
