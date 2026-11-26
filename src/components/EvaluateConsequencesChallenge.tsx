import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { ArrowDown, Check, ClipboardCheck } from 'lucide-react'
import {
  consequenceExplanations, consequenceKey, consequenceStages, decisions, immediateOptions, laterOptions,
  shuffledConsequenceIds, type ConsequenceMatch, type ConsequenceStage, type ConsequencesResult, type DecisionId,
} from '../state/evaluateConsequences'
import { canReviewShieldAnswers } from './shieldFeedback'
import { Button, Modal } from './ui'

type Draft = Partial<Pick<ConsequenceMatch, 'immediate' | 'later'>>
type PuzzleDraft = Partial<Record<DecisionId, Draft>>
type Slot = { decisionId: DecisionId; stage: ConsequenceStage }

function matchedDecision(draft: PuzzleDraft, stage: ConsequenceStage, value: string) {
  return decisions.find(decision => draft[decision.id]?.[stage] === value)
}

export function EvaluateConsequencesChallenge({ result, postTestComplete = false, onSubmit, onClose }: {
  result?: ConsequencesResult
  postTestComplete?: boolean
  onSubmit: (matches: ConsequenceMatch[]) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<PuzzleDraft>({})
  const [matchMessage, setMatchMessage] = useState('')
  const [slot, setSlot] = useState<Slot>()
  const [immediateIds] = useState(() => shuffledConsequenceIds(immediateOptions))
  const [laterIds] = useState(() => shuffledConsequenceIds(laterOptions))
  const slotButton = useRef<HTMLButtonElement | null>(null)
  const matches = decisions.flatMap(({ id }) => {
    const { immediate, later } = draft[id] ?? {}
    return immediate && later ? [{ decisionId: id, immediate, later }] : []
  })

  function toggleSlot(event: MouseEvent<HTMLButtonElement>, decisionId: DecisionId, stage: ConsequenceStage) {
    slotButton.current = event.currentTarget
    setSlot(previous => previous?.decisionId === decisionId && previous.stage === stage ? undefined : { decisionId, stage })
  }

  function choose<Stage extends ConsequenceStage>(decisionId: DecisionId, stage: Stage, value: NonNullable<Draft[Stage]>) {
    const owner = matchedDecision(draft, stage, value)
    const replaced = draft[decisionId]?.[stage]
    const next = { ...draft, [decisionId]: { ...draft[decisionId], [stage]: value } }
    if (owner && owner.id !== decisionId) {
      next[owner.id] = { ...draft[owner.id], [stage]: replaced }
      setMatchMessage(replaced ? `Swapped matches with ${owner.label}.` : `Moved the match from ${owner.label}.`)
    } else {
      setMatchMessage('')
    }
    setDraft(next)
    setSlot(undefined)
    slotButton.current?.focus()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!result && matches.length === decisions.length) onSubmit(matches)
  }

  return <Modal title="Evaluate Consequences" eyebrow="SHIELD CHALLENGE 4 · E" className="spot-challenge ripple-challenge" onClose={onClose}>
    {result ? <RippleFeedback result={result} showReview={canReviewShieldAnswers(postTestComplete)} onClose={onClose} />
      : <form onSubmit={submit}>
        <p className="spot-instructions">Build three possible chains using each consequence card once. Choosing an assigned card moves it to this slot. If this slot already has a card, the two swap.</p>
        <div className="ripple-grid">
          {decisions.map(decision => {
            const { immediate, later } = draft[decision.id] ?? {}
            const complete = !!immediate && !!later
            return <article key={decision.id} className="spot-card ripple-card" aria-labelledby={'ripple-' + decision.id}>
              <h3 id={'ripple-' + decision.id}>{decision.label}</h3>
              <p className="ripple-decision">{decision.text}</p>
              {consequenceStages.map(({ id: stage, title }) => {
                const active = slot?.decisionId === decision.id && slot.stage === stage
                const selected = stage === 'immediate' ? immediate && immediateOptions[immediate] : later && laterOptions[later]
                return <div key={stage} className="ripple-stage">
                  <span className="ripple-connector" aria-hidden="true"><ArrowDown size={16} /></span>
                  <button type="button" className="ripple-slot" aria-expanded={active}
                    aria-label={decision.label + ' · ' + title + (selected ? ' · ' + selected : ' · Choose a match')}
                    onClick={event => toggleSlot(event, decision.id, stage)}>
                    <strong>{title}</strong>
                    <span>{selected ? <><Check size={15} /> {selected}</> : 'Choose a match'}</span>
                  </button>
                  {active && (stage === 'immediate'
                    ? <OptionBank title={title} options={immediateOptions} ids={immediateIds} selected={immediate}
                      describeOwner={value => matchedDecision(draft, stage, value)?.label}
                      onChoose={value => choose(decision.id, 'immediate', value)} />
                    : <OptionBank title={title} options={laterOptions} ids={laterIds} selected={later}
                      describeOwner={value => matchedDecision(draft, stage, value)?.label}
                      onChoose={value => choose(decision.id, 'later', value)} />)}
                </div>
              })}
              {complete && <span className="ripple-ready"><Check size={15} /> Chain ready</span>}
            </article>
          })}
        </div>
        <footer className="spot-submit ripple-submit">
          <div aria-live="polite">
            <p>{matches.length} / {decisions.length} chains ready</p>
            {matchMessage && <small>{matchMessage}</small>}
          </div>
          <Button type="submit" className="primary" disabled={matches.length !== decisions.length}>
            <ClipboardCheck size={17} /> Submit chains
          </Button>
        </footer>
      </form>}
  </Modal>
}

function OptionBank<Id extends string>({ title, options, ids, selected, describeOwner, onChoose }: {
  title: string
  options: Readonly<Record<Id, string>>
  ids: readonly Id[]
  selected?: Id
  describeOwner: (value: Id) => string | undefined
  onChoose: (value: Id) => void
}) {
  return <div role="group" aria-label={title + ' options'} className="ripple-options">
    {ids.map((id, index) => {
      const owner = selected === id ? undefined : describeOwner(id)
      return <button type="button" key={id} aria-pressed={selected === id}
        autoFocus={selected === id || (!selected && index === 0)} onClick={() => onChoose(id)}>
        {selected === id && <Check size={15} />} {options[id]}
        {owner && <small>{selected ? 'Swap with ' : 'Move from '}{owner}</small>}
      </button>
    })}
  </div>
}

function RippleFeedback({ result, showReview, onClose }: {
  result: ConsequencesResult
  showReview: boolean
  onClose: () => void
}) {
  return <>
    <section className="spot-result" aria-label="Evaluate Consequences result">
      {showReview ? <>
        <h3><Check size={19} /> Evaluate Consequences — Completed</h3>
        <p role="status">{result.passed ? 'Criterion met' : 'Criterion not met'}</p>
        <ul>
          <li>{result.correctChains} / {decisions.length} correct chains</li>
          <li>{result.numberCorrect} / {decisions.length * consequenceStages.length} correct links</li>
        </ul>
        <p>Decisions can have immediate and later effects. What happens depends on the circumstances, and whether any theft occurred is still unknown.</p>
      </> : <>
        <h3>Evaluate Consequences completed.</h3>
        <p role="status">Your responses have been recorded.</p>
      </>}
    </section>
    {showReview && <div className="ripple-grid ripple-review">
      {decisions.map(decision => {
        const match = result.chains.find(chain => chain.decisionId === decision.id)
        const expected = consequenceKey[decision.id]
        return <section key={decision.id} className="spot-card ripple-card" aria-label={decision.label + ' review'}>
          <h3>{decision.label}</h3>
          <p className="ripple-chain-result">{match?.correct ? 'Chain correct' : 'Chain not fully correct'}</p>
          <p className="ripple-decision">{decision.text}</p>
          <dl>
            <div>
              <dt>Immediate · {match?.linkCorrect.immediate ? 'Correct' : 'Incorrect'}</dt>
              <dd>{immediateOptions[expected.immediate]}</dd>
              {match && !match.linkCorrect.immediate && <dd className="ripple-your-match">Your match · {immediateOptions[match.immediate]}</dd>}
            </div>
            <div>
              <dt>Later · {match?.linkCorrect.later ? 'Correct' : 'Incorrect'}</dt>
              <dd>{laterOptions[expected.later]}</dd>
              {match && !match.linkCorrect.later && <dd className="ripple-your-match">Your match · {laterOptions[match.later]}</dd>}
            </div>
          </dl>
          <p>{consequenceExplanations[decision.id]}</p>
        </section>
      })}
    </div>}
    <div className="modal-actions"><Button className="primary" onClick={onClose}>Continue exploring</Button></div>
  </>
}
