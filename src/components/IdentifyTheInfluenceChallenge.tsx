import { useState, type FormEvent } from 'react'
import { Check, ClipboardCheck, Network } from 'lucide-react'
import {
  influenceOptions, influenceParts, type InfluenceAnswers, type InfluenceResult,
} from '../state/identifyTheInfluence'
import { canReviewShieldAnswers } from './shieldFeedback'
import { Button, Modal } from './ui'

export function IdentifyTheInfluenceChallenge({ result, postTestComplete = false, onSubmit, onClose, onLaunchPractice }: {
  result?: InfluenceResult
  postTestComplete?: boolean
  onSubmit: (answers: InfluenceAnswers) => void
  onClose: () => void
  onLaunchPractice?: () => void
}) {
  const [answers, setAnswers] = useState<Partial<InfluenceAnswers>>({})
  const [confirming, setConfirming] = useState(false)
  const [restoreFocus, setRestoreFocus] = useState(false)
  const tactic = answers['pressure-tactic']
  const role = answers['requested-role']

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (result || !tactic || !role) return
    if (confirming) onSubmit({ 'pressure-tactic': tactic, 'requested-role': role })
    else setConfirming(true)
  }

  return <Modal title="Identify the Influence" eyebrow="SHIELD CHALLENGE 3 · I" className="spot-challenge hold-challenge" onClose={onClose}>
    {result ? <InfluenceFeedback result={result} showReview={canReviewShieldAnswers(postTestComplete)} onClose={onClose} onLaunchPractice={onLaunchPractice} />
      : <form onSubmit={submit}>
        <section className="spot-card hold-scenario" aria-label="Situation">
          <p>Inside Sunshine Minimart, Jun says</p>
          <blockquote>“We’re friends right? Just help me watch the door for a while lah. Don’t need to make it such a big deal.”</blockquote>
          <p>You don’t know whether Jun intends to steal anything.</p>
          {onLaunchPractice && <div style={{ marginTop: 10 }}>
            <Button className="secondary" type="button" onClick={onLaunchPractice}>
              <Network size={16} /> Play Interactive Game: Whisper Network
            </Button>
          </div>}
        </section>
        {confirming ? <section className="spot-card hold-selection" aria-labelledby="influence-confirm-heading">
          <h3 id="influence-confirm-heading" tabIndex={-1} ref={heading => { heading?.focus() }}>Confirm your answers</h3>
          <dl className="influence-confirm">
            {influenceParts.map(part => {
              const answer = answers[part.id]
              return <div key={part.id}><dt>{part.title}</dt><dd>{answer && part.options[answer]}</dd></div>
            })}
          </dl>
          <p>You can change your answers before submitting. Your submitted answers are final.</p>
        </section> : influenceParts.map(part => <fieldset key={part.id} className="spot-card hold-selection">
          <legend>{part.title}</legend>
          <p className="influence-question" id={part.id + '-question'}>{part.question}</p>
          <div className="spot-options">
            {influenceOptions.map(option => <label key={option}>
              <input type="radio" name={part.id} value={option} checked={answers[part.id] === option}
                aria-describedby={part.id + '-question'}
                autoFocus={restoreFocus && part.id === 'pressure-tactic' && answers[part.id] === option}
                onChange={() => setAnswers(previous => ({ ...previous, [part.id]: option }))} />
              <span><strong>{option}.</strong> {part.options[option]}</span>
            </label>)}
          </div>
        </fieldset>)}
        <div className="modal-actions">
          {confirming && <Button className="secondary" onClick={() => { setRestoreFocus(true); setConfirming(false) }}>Change answers</Button>}
          <Button type="submit" className="primary" disabled={!tactic || !role}>
            <ClipboardCheck size={17} /> {confirming ? 'Confirm submission' : 'Review answers'}
          </Button>
        </div>
      </form>}
  </Modal>
}

function InfluenceFeedback({ result, showReview, onClose, onLaunchPractice }: {
  result: InfluenceResult
  showReview: boolean
  onClose: () => void
  onLaunchPractice?: () => void
}) {
  return <>
    <section className="spot-result" aria-label="Identify the Influence result">
      <h3><Check size={19} /> Identify the Influence — Completed</h3>
      {showReview ? <>
        <p role="status">{result.passed ? 'You identified both the tactic and the role.' : 'The challenge requires identifying both the tactic and the role.'}</p>
        <dl className="influence-review">
          {influenceParts.map(part => {
            const answer = result.responses.find(response => response.itemId === part.id)?.answer
            return <div key={part.id}>
              <dt>{part.title} · {result.partCorrect[part.id] ? 'Correct' : 'Incorrect'}</dt>
              <dd>
                {answer && <p>Your answer · {part.options[answer]}</p>}
                <p>Expected answer · {part.options[part.correct]}</p>
                <p>{part.explanation}</p>
              </dd>
            </div>
          })}
        </dl>
        <p>Recognising this pressure and role leaves Jun’s intentions and whether any theft occurred unknown.</p>
      </> : <p role="status">Your two answers were recorded. Feedback becomes available after the post-test.</p>}
    </section>
    <div className="modal-actions">
      {onLaunchPractice && <Button className="secondary" onClick={onLaunchPractice}>
        <Network size={16} /> Play Interactive Game: Whisper Network
      </Button>}
      <Button className="primary" onClick={onClose}>Continue exploring</Button>
    </div>
  </>
}
