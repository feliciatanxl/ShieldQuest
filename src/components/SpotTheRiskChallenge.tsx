import { useState, type FormEvent } from 'react'
import { Check, ClipboardCheck } from 'lucide-react'
import {
  MAX_FALSE_ALARMS, REQUIRED_FACTS, spotCards, spotItems,
  type Classification, type SpotResponse, type SpotResult,
} from '../state/spotTheRisk'
import { Button, Modal } from './ui'
import { canReviewShieldAnswers } from './shieldFeedback'

const answerLabels: Record<Classification, string> = {
  verified: 'Verified Observation',
  assumption: 'Assumption / Not Established',
}
const classifications = Object.keys(answerLabels) as Classification[]

export function SpotTheRiskChallenge({ result, postTestComplete = false, onSubmit, onClose }: {
  result?: SpotResult
  postTestComplete?: boolean
  onSubmit: (responses: SpotResponse[]) => void
  onClose: () => void
}) {
  const [answers, setAnswers] = useState<Partial<Record<string, Classification>>>({})
  const answered = Object.keys(answers).length
  const showReview = canReviewShieldAnswers(postTestComplete)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!result && answered === spotItems.length) {
      onSubmit(Object.entries(answers).flatMap(([itemId, answer]) => answer ? [{ itemId, answer }] : []))
    }
  }

  return <Modal title="Spot the Risk" eyebrow="SHIELD CHALLENGE 1" className="spot-challenge" onClose={onClose}>
    {result ? <>
      <section className="spot-result" aria-label="Spot the Risk result">
        <h3><Check size={19} /> Spot the Risk — Completed</h3>
        <p role="status">{result.passed ? 'Criterion met' : 'Criterion not yet met'}</p>
        <ul>
          <li>{result.factualCorrect} / {spotCards.length} factual cues identified</li>
          <li>{result.falseAlarms} false {result.falseAlarms === 1 ? 'alarm' : 'alarms'}</li>
          <li>{result.numberCorrect} / {spotItems.length} correct classifications</li>
        </ul>
        <p>A verified observation describes what you directly saw or heard. An assumption adds a claim that the evidence has yet to establish.</p>
        {!showReview && <p>Answer review becomes available after the post-test.</p>}
      </section>
      {showReview && <Review result={result} />}
      <div className="modal-actions"><Button className="primary" onClick={onClose}>Continue exploring</Button></div>
    </> : <form onSubmit={submit}>
      <p className="spot-instructions">Classify both statements on each of the five clue cards. An assumption goes beyond what you could verify in the shop.</p>
      <div className="spot-items">
        {spotCards.map((card, index) => <section key={card.id} className="spot-card" aria-labelledby={`spot-card-${card.id}`}>
          <h3 id={`spot-card-${card.id}`}>{index + 1}. {card.title}</h3>
          {card.items.map(item => <fieldset key={item.id}>
            <legend>{item.statement}</legend>
            <div className="spot-options">
              {classifications.map(answer => <label key={answer}>
                <input type="radio" name={item.id} value={answer} required checked={answers[item.id] === answer}
                  onChange={() => setAnswers(previous => ({ ...previous, [item.id]: answer }))} />
                {answerLabels[answer]}
              </label>)}
            </div>
          </fieldset>)}
        </section>)}
      </div>
      <footer className="spot-submit">
        <div>
          <p aria-live="polite">{answered} / {spotItems.length} statements answered</p>
          <small>Pass with {REQUIRED_FACTS} of {spotCards.length} factual cues and at most {MAX_FALSE_ALARMS} false alarm.</small>
        </div>
        <Button className="primary" type="submit" disabled={answered !== spotItems.length}><ClipboardCheck size={17} /> Submit answers</Button>
      </footer>
    </form>}
  </Modal>
}

function Review({ result }: { result: SpotResult }) {
  const answers = new Map(result.responses.map(response => [response.itemId, response.answer]))
  const key = new Map(result.correctResponses.map(response => [response.itemId, response.answer]))
  return <details className="spot-review">
    <summary>Review your answers</summary>
    <ol>
      {spotItems.map(item => {
        const answer = answers.get(item.id)
        const correct = key.get(item.id)
        return <li key={item.id}>
          <strong>{item.statement}</strong>
          <p>Your answer · {answer && answerLabels[answer]}</p>
          <p>Expected answer · {correct && answerLabels[correct]}</p>
          <p>{item.feedback}</p>
        </li>
      })}
    </ol>
  </details>
}
