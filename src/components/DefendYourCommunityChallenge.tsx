import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { ArrowDown, Check, ClipboardCheck } from 'lucide-react'
import {
  helpOptionText, helpStages, type DefendAnswers, type DefendResult, type HelpOptionId, type HelpPlan, type HelpStageId,
} from '../state/defendYourCommunity'
import { shuffleOptions } from '../state/shield'
import { canReviewShieldAnswers } from './shieldFeedback'
import { Button, Modal } from './ui'

export function DefendYourCommunityChallenge({ result, postTestComplete = false, onSubmit, onClose }: {
  result?: DefendResult
  postTestComplete?: boolean
  onSubmit: (answers: DefendAnswers) => void
  onClose: () => void
}) {
  const [plan, setPlan] = useState<HelpPlan>({})
  const [openStage, setOpenStage] = useState<HelpStageId>()
  const [confirming, setConfirming] = useState(false)
  const [restoreFocus, setRestoreFocus] = useState(false)
  const [stages] = useState(() => helpStages.map(stage => ({ ...stage, options: shuffleOptions([...stage.options]) })))
  const trigger = useRef<HTMLButtonElement | null>(null)
  const count = helpStages.filter(stage => plan[stage.id]).length
  const { channel, communication, 'follow-up': followUp } = plan

  function toggle(event: MouseEvent<HTMLButtonElement>, id: HelpStageId) {
    trigger.current = event.currentTarget
    setOpenStage(previous => previous === id ? undefined : id)
  }

  function choose(stage: HelpStageId, option: HelpOptionId) {
    setPlan(previous => ({ ...previous, [stage]: option }))
    setOpenStage(undefined)
    trigger.current?.focus()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (result || !channel || !communication || !followUp) return
    if (confirming) onSubmit({ channel, communication, 'follow-up': followUp })
    else {
      setOpenStage(undefined)
      setConfirming(true)
    }
  }

  return <Modal title="Defend Your Community" eyebrow="SHIELD CHALLENGE 6 · D" className="spot-challenge defend-challenge" onClose={onClose}>
    {result ? <DefendFeedback result={result} showReview={canReviewShieldAnswers(postTestComplete)} onClose={onClose} />
      : <form onSubmit={submit}>
        <h3 className="defend-builder-title">Help Channel Builder</h3>
        <p className="spot-instructions">You still don’t know what Jun intends to do. His request to watch the entrance makes you uncomfortable. Build a plan to seek appropriate help.</p>
        {confirming && <h3 className="lead-confirm" tabIndex={-1} ref={heading => { heading?.focus() }}>Confirm your help plan</h3>}
        {!confirming && <div className="defend-stages">
          {stages.map((stage, index) => {
            const selected = plan[stage.id]
            const isOpen = openStage === stage.id
            return <section key={stage.id}>
              {index > 0 && <span className="ripple-connector" aria-hidden="true"><ArrowDown size={16} /></span>}
              <button type="button" className="ripple-slot lead-slot" aria-expanded={isOpen}
                autoFocus={restoreFocus && index === 0} onClick={event => toggle(event, stage.id)}>
                <strong>{index + 1}. {stage.title}</strong>
                <span>{selected ? <><Check size={15} /> {stage.options.find(option => option.id === selected)?.text}</> : stage.question}</span>
              </button>
              {isOpen && <div className="ripple-options lead-options" role="group" aria-label={stage.title}>
                {stage.options.map((option, optionIndex) => <button type="button" key={option.id}
                  aria-pressed={option.id === selected} autoFocus={option.id === selected || (!selected && optionIndex === 0)}
                  onClick={() => choose(stage.id, option.id)}>{option.text}</button>)}
              </div>}
            </section>
          })}
        </div>}
        <PlanPreview plan={plan} live={!confirming} />
        {confirming && <p className="lead-confirm-note">Your submitted plan is final.</p>}
        <div className="modal-actions lead-actions">
          {!confirming && <p aria-live="polite">{count} / {helpStages.length} stages selected</p>}
          {confirming && <Button className="secondary" onClick={() => { setRestoreFocus(true); setConfirming(false) }}>Change plan</Button>}
          <Button type="submit" className="primary" disabled={count !== helpStages.length}>
            <ClipboardCheck size={17} /> {confirming ? 'Confirm submission' : 'Review plan'}
          </Button>
        </div>
      </form>}
  </Modal>
}

function PlanPreview({ plan, live = false }: { plan: HelpPlan; live?: boolean }) {
  return <section className="spot-card defend-preview" aria-label="Your help plan" aria-live={live ? 'polite' : undefined}>
    <h3>Your help plan</h3>
    <dl>{helpStages.map(stage => <div key={stage.id}>
      <dt>{stage.title}</dt><dd>{helpOptionText(stage, plan[stage.id]) ?? 'Select a card'}</dd>
    </div>)}</dl>
  </section>
}

function DefendFeedback({ result, showReview, onClose }: { result: DefendResult; showReview: boolean; onClose: () => void }) {
  const plan = Object.fromEntries(result.responses.map(response => [response.itemId, response.answer])) as HelpPlan
  return <>
    <section className="spot-result" aria-label="Defend Your Community result">
      <h3><Check size={19} /> Defend Your Community — Completed</h3>
      {showReview ? <>
        <p role="status">{result.numberCorrect} / {helpStages.length} · {result.passed ? 'Criterion met' : 'Criterion not met'}</p>
        <PlanPreview plan={plan} />
        <dl className="influence-review">
          {helpStages.map(stage => <div key={stage.id}>
            <dt>{stage.criterion} · {result.criterionCorrect[stage.id] ? 'Met' : 'Needs work'}</dt>
            <dd>{stage.feedback}</dd>
          </div>)}
        </dl>
      </> : <p role="status">Your plan was recorded. Feedback becomes available after the post-test.</p>}
    </section>
    <div className="modal-actions"><Button className="primary" onClick={onClose}>Continue exploring</Button></div>
  </>
}
