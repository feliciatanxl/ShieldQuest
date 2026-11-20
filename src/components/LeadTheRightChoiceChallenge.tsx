import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { Check, ClipboardCheck, MessageSquare } from 'lucide-react'
import { residents } from '../game/residentData'
import {
  fragmentSlots, leadFragmentText, type FragmentId, type FragmentSlotId, type LeadAnswers, type LeadDraft, type LeadResult,
} from '../state/leadTheRightChoice'
import { AvatarSprite } from './AvatarSprite'
import { canReviewShieldAnswers } from './shieldFeedback'
import { Button, Modal } from './ui'

export function LeadTheRightChoiceChallenge({ result, postTestComplete = false, onSubmit, onClose }: {
  result?: LeadResult
  postTestComplete?: boolean
  onSubmit: (answers: LeadAnswers) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<LeadDraft>({})
  const [activeSlot, setActiveSlot] = useState<FragmentSlotId>()
  const [confirming, setConfirming] = useState(false)
  const [restoreFocus, setRestoreFocus] = useState(false)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const { opening, alternative, 'next-action': nextAction } = draft
  const count = fragmentSlots.filter(slot => draft[slot.id]).length

  function choose(slot: FragmentSlotId, fragment: FragmentId) {
    setDraft(previous => ({ ...previous, [slot]: fragment }))
    setActiveSlot(undefined)
    trigger.current?.focus()
  }

  function toggleSlot(event: MouseEvent<HTMLButtonElement>, slot: FragmentSlotId) {
    trigger.current = event.currentTarget
    setActiveSlot(previous => previous === slot ? undefined : slot)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (result || !opening || !alternative || !nextAction) return
    if (confirming) onSubmit({ opening, alternative, 'next-action': nextAction })
    else {
      setActiveSlot(undefined)
      setConfirming(true)
    }
  }

  return <Modal title="Lead the Right Choice" eyebrow="SHIELD CHALLENGE 5 · L" className="spot-challenge lead-challenge" onClose={onClose}>
    {result ? <LeadFeedback result={result} showReview={canReviewShieldAnswers(postTestComplete)} onClose={onClose} />
      : <form onSubmit={submit}>
        <section className="lead-conversation" aria-label="Conversation">
          <span className="lead-portrait"><AvatarSprite avatar={residents.jun} /></span>
          <div className="spot-card lead-bubble">
            <strong>Jun</strong>
            <p>“Come on lah, we’re friends. Just help me this once.”</p>
          </div>
        </section>
        {confirming && <h3 className="lead-confirm" tabIndex={-1} ref={heading => { heading?.focus() }}>Confirm your message</h3>}
        <MessageBubble draft={draft} live={!confirming} />
        {confirming ? <p className="lead-confirm-note">Your submitted message is final.</p>
          : <div className="lead-slots">
            {fragmentSlots.map((slot, index) => {
              const selected = draft[slot.id]
              const isOpen = activeSlot === slot.id
              return <section key={slot.id}>
                <button type="button" className="ripple-slot lead-slot" aria-expanded={isOpen} autoFocus={restoreFocus && index === 0}
                  onClick={event => toggleSlot(event, slot.id)}>
                  <strong>{index + 1}. {slot.title}</strong>
                  <span>{selected ? <><Check size={15} /> {leadFragmentText(slot, selected)}</> : 'Choose a fragment'}</span>
                </button>
                {isOpen && <div className="ripple-options lead-options" role="group" aria-label={slot.title}>
                  {slot.fragments.map((fragment, optionIndex) => <button type="button" key={fragment.id}
                    aria-pressed={selected === fragment.id} autoFocus={selected === fragment.id || (!selected && optionIndex === 0)}
                    onClick={() => choose(slot.id, fragment.id)}>{fragment.text}</button>)}
                </div>}
              </section>
            })}
          </div>}
        <div className="modal-actions lead-actions">
          {!confirming && <p aria-live="polite">{count} / {fragmentSlots.length} fragments selected</p>}
          {confirming && <Button className="secondary" onClick={() => { setRestoreFocus(true); setConfirming(false) }}>Change message</Button>}
          <Button type="submit" className="primary" disabled={count !== fragmentSlots.length}>
            <ClipboardCheck size={17} /> {confirming ? 'Confirm submission' : 'Review message'}
          </Button>
        </div>
      </form>}
  </Modal>
}

function MessageBubble({ draft, live = false }: { draft: LeadDraft; live?: boolean }) {
  const message = fragmentSlots.map(slot => leadFragmentText(slot, draft[slot.id])).filter(Boolean).join(' ')
  return <div className="spot-card lead-bubble lead-player" aria-live={live ? 'polite' : undefined}>
    <strong><MessageSquare size={16} /> Your message</strong>
    <p>{message || 'Choose fragments to build your reply.'}</p>
  </div>
}

function LeadFeedback({ result, showReview, onClose }: { result: LeadResult; showReview: boolean; onClose: () => void }) {
  const draft = Object.fromEntries(result.responses.map(response => [response.itemId, response.answer])) as LeadDraft
  return <>
    <section className="spot-result" aria-label="Lead the Right Choice result">
      <h3><Check size={19} /> Lead the Right Choice — Completed</h3>
      {showReview ? <>
        <p role="status">{result.numberCorrect} / {fragmentSlots.length} · {result.passed ? 'Criterion met' : 'Criterion not met'}</p>
        <MessageBubble draft={draft} />
        <dl className="influence-review">
          {fragmentSlots.map(slot => <div key={slot.id}>
            <dt>{slot.criterion} · {result.criterionCorrect[slot.id] ? 'Met' : 'Needs work'}</dt>
            <dd>{slot.feedback}</dd>
          </div>)}
        </dl>
        <p>Respectful redirection gives Jun a responsible way forward while his intentions are still unknown.</p>
      </> : <p role="status">Your message was recorded. Feedback becomes available after the post-test.</p>}
    </section>
    <div className="modal-actions"><Button className="primary" onClick={onClose}>Continue exploring</Button></div>
  </>
}
