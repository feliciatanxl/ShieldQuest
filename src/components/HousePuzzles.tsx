import { useState } from 'react'
import { ArrowDown, ArrowUp, Pin } from 'lucide-react'
import { books, evidenceBins, evidenceCards, items, letterOrder, puzzles, timeline, type ItemId, type PuzzleId } from '../state/missingEvidence'
import type { EscapeAction, EscapeRoomProgress, SequencePuzzle } from '../state/escapeRoom'
import { Button } from './ui'

export function CaseDocuments({ ids }: { ids: readonly ItemId[] }) {
  return <div className="house-documents">
    {ids.map(id => <details key={id}><summary>{items[id].name}</summary><p>{items[id].description}</p></details>)}
  </div>
}

export function PuzzleHints({ id, progress, onAction }: {
  id: PuzzleId; progress: EscapeRoomProgress; onAction: (action: EscapeAction) => boolean
}) {
  const hints = puzzles[id].hints
  const count = progress.hints[id] ?? 0
  const solved = progress.puzzleStates[id] === 'completed'
  return <details className="house-hints">
    <summary>Hints · {count} of {hints.length}</summary>
    {count > 0 && <ol>{hints.slice(0, count).map(hint => <li key={hint}>{hint}</li>)}</ol>}
    {count < hints.length && !solved && <Button className="secondary" onClick={() => onAction({ type: 'REVEAL_HINT', puzzleId: id })}>Reveal Hint {count + 1}</Button>}
    {solved && count === 0 && <p>No hints used.</p>}
  </details>
}

const sequenceOptions = {
  letter: [letterOrder[1], letterOrder[2], letterOrder[0]].map(id => ({ id, label: items[id].description })),
  cipher: books.map(book => ({ id: book.id, label: `${book.label} · ${book.digit}`, symbol: book.symbol })),
  timeline: [timeline[2], timeline[0], timeline[3], timeline[1]].map(({ id, label }) => ({ id, label })),
}
const sequenceLength = { letter: 3, cipher: 3, timeline: 4 }
const sequencePrompts = {
  letter: 'Arrange the three pieces to read the host’s letter from beginning to end.',
  cipher: 'Choose three books in the order described by the letter.',
  timeline: 'Arrange the four events from earliest to latest.',
}

export function HouseSequence({ id, onAction }: { id: SequencePuzzle; onAction: (action: EscapeAction) => boolean }) {
  const [order, setOrder] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const options: readonly { id: string; label: string; symbol?: string }[] = sequenceOptions[id]
  const required = sequenceLength[id]
  const documents: readonly ItemId[] = id === 'timeline' ? timeline.map(event => event.source) : id === 'cipher' ? ['letter'] : []
  function revise(next: string[]) {
    setOrder(next)
    setFeedback('')
  }
  function move(index: number, offset: number) {
    const next = [...order]
    const other = index + offset
    if (other < 0 || other >= next.length) return
    ;[next[index], next[other]] = [next[other], next[index]]
    revise(next)
  }
  return <section className="house-puzzle">
    <h3>{puzzles[id].title}</h3>
    <p>{sequencePrompts[id]}</p>
    {documents.length > 0 && <details className="house-reference"><summary>Review Clue Documents</summary><CaseDocuments ids={documents} /></details>}
    <div className={`house-choice-bank ${id === 'cipher' ? 'book-bank' : ''}`} aria-label="Available pieces">
      {options.map(option => <Button key={option.id} className="secondary" disabled={order.length >= required || order.includes(option.id)}
        onClick={() => revise([...order, option.id])}>
        {option.symbol && <span aria-hidden="true">{option.symbol}</span>}{option.label}
      </Button>)}
    </div>
    {order.length > 0 && <ol className="house-order" aria-label="Selected order">
      {order.map((option, index) => <li key={option}>
        <span>{options.find(entry => entry.id === option)?.label}</span>
        <div>
          <Button className="secondary" aria-label={`Move item ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></Button>
          <Button className="secondary" aria-label={`Move item ${index + 1} down`} disabled={index === order.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></Button>
          <Button className="secondary" aria-label={`Remove item ${index + 1}`} onClick={() => revise(order.filter(value => value !== option))}>Remove</Button>
        </div>
      </li>)}
    </ol>}
    <Button className="primary" disabled={order.length !== required}
      onClick={() => {
        if (!onAction({ type: 'SUBMIT_SEQUENCE', puzzleId: id, order })) setFeedback('That order did not match the clues. You can revise it and try again.')
      }}>Check Order</Button>
    {feedback && <p role="status">{feedback}</p>}
  </section>
}

export function EvidenceBoardReview({ onAction }: { onAction: (action: EscapeAction) => boolean }) {
  return <section className="house-puzzle">
    <h3>{puzzles.board.title}</h3>
    <details className="house-reference"><summary>Review Case Records</summary>
      <CaseDocuments ids={['incident-report', ...timeline.map(event => event.source)]} />
    </details>
    <div className="house-pinboard">
      {Object.entries(evidenceBins).map(([bin, label]) => <section key={bin}>
        <h4><Pin size={16} aria-hidden="true" />{label}</h4>
        <ul>{evidenceCards.filter(card => card.bin === bin).map(card => <li key={card.id}>{card.text}</li>)}</ul>
      </section>)}
    </div>
    <Button className="primary" onClick={() => onAction({ type: 'REVIEW_EVIDENCE' })}>Finish Evidence Review</Button>
  </section>
}
