import { Archive, BookOpen, Clock, DoorClosed, FileText, Image, Lock, Package, ScanLine, Table2, Pin, Check } from 'lucide-react'
import type { HouseObject } from '../game/houseLayout'
import { escapeSummary, puzzleState, type EscapeAction, type EscapeRoomProgress } from '../state/escapeRoom'
import { categories, housePickups, items, levelTitle, puzzles, type ItemId, type PuzzleId } from '../state/missingEvidence'
import { CaseDocuments, EvidenceBoardPuzzle, HouseSequence, PuzzleHints } from './HousePuzzles'
import { NumericKeypad } from './NumericKeypad'
import { Button, Modal } from './ui'

const objectIcons = { shelf: BookOpen, painting: Image, drawer: Archive, clock: Clock, cabinet: Package, safe: ScanLine, door: DoorClosed, table: Table2, board: Pin }
const categoryIcons = { Evidence: Archive, 'Physical Items': Package, Documents: FileText }
const missingClues: Record<PuzzleId, string> = {
  letter: 'Find all three pieces in the living room.',
  cipher: 'Reconstruct the letter first.',
  timeline: 'Gather the four timestamped records and the drawer’s partial reference.',
  board: 'Complete the incident timeline to recover the evidence reference.',
  'study-safe': 'Complete the evidence board to recover the safe code worksheet.',
}
const puzzleRewards = {
  letter: ['letter'],
  cipher: ['cipher-rubbing'],
  timeline: ['timeline-reference'],
  board: ['safe-instructions'],
  'study-safe': ['final-evidence', 'house-key'],
} as const satisfies Record<PuzzleId, readonly ItemId[]>

export function HouseEntry({ onPlay, onClose, onReview }: { onPlay: () => void; onClose: () => void; onReview?: () => void }) {
  return <Modal title="The Mysterious House" eyebrow="ESCAPE ROOM ADVENTURE · LEVEL 1" onClose={onClose}>
    <h3>{levelTitle}</h3>
    <p>The neighbourhood has set up a supervised mystery game. In the fictional case, a compass is missing from a shop shelf. Reconstruct what happened, recover the final evidence file, and use the key to leave.</p>
    <div className="house-entry-actions">
      <Button className="primary" onClick={onReview ?? onPlay}>{onReview ? 'View Completion' : 'Play Solo'}</Button>
      <Button className="secondary" disabled>Create Multiplayer Room · Coming Soon</Button>
      <Button className="secondary" disabled>Join Multiplayer Room · Coming Soon</Button>
      <Button className="secondary" onClick={onClose}>Back</Button>
    </div>
  </Modal>
}

function PuzzleDesk({ id, progress, onAction }: {
  id: PuzzleId; progress: EscapeRoomProgress; onAction: (action: EscapeAction) => boolean
}) {
  const state = puzzleState(progress, id)
  return <>
    {state === 'locked' && <p className="house-lock"><Lock size={16} aria-hidden="true" />{missingClues[id]}</p>}
    {state === 'completed' && <>
      <p className="house-success" role="status"><Check size={17} aria-hidden="true" />
        {id === 'study-safe' ? 'Safe unlocked. Key and final evidence added.' : puzzles[id].title + ' solved. New evidence added.'}</p>
      <CaseDocuments ids={puzzleRewards[id]} />
    </>}
    {state === 'available' && (id === 'board' ? <EvidenceBoardPuzzle onAction={onAction} />
      : id === 'study-safe' ? <>
        <h3>The Final Safe</h3>
        <details className="house-reference"><summary>Review Safe Clues</summary>
          <CaseDocuments ids={['safe-instructions', 'letter', 'cipher-rubbing', 'timeline-reference', 'witness-note']} />
        </details>
        <NumericKeypad digits={4} onSubmitCode={code =>
          onAction({ type: 'SUBMIT_SAFE_CODE', code }) ? 'Safe unlocked.' : 'The safe is still locked. Check each digit against the worksheet.'} />
      </> : <HouseSequence id={id} onAction={onAction} />)}
    <PuzzleHints id={id} progress={progress} onAction={onAction} />
  </>
}

export function HouseInspection({ object, progress, onAction, onClose }: {
  object: HouseObject; progress: EscapeRoomProgress; onAction: (action: EscapeAction) => boolean; onClose: () => void
}) {
  const Icon = objectIcons[object.type]
  const pickup = object.pickup
  const item = pickup && housePickups[pickup.objectId]
  const collected = !!item && progress.inventory.includes(item)
  const key = progress.inventory.includes('house-key')
  return <Modal title={object.name} eyebrow="INSPECT OBJECT" className="house-inspection" onClose={onClose}>
    <div className="house-preview">
      <span><Icon size={31} aria-hidden="true" /></span><p>{object.description}</p>
    </div>
    {pickup && !collected && <div className="house-action"><Button className="primary"
      onClick={() => onAction({ type: 'COLLECT_ITEM', objectId: pickup.objectId })}>{pickup.label}</Button></div>}
    {item && collected && <>
      <p className="house-success" role="status"><Check size={17} aria-hidden="true" />{items[item].name} added to inventory.</p>
      <CaseDocuments ids={[item]} />
    </>}
    {object.puzzleId && <PuzzleDesk id={object.puzzleId} progress={progress} onAction={onAction} />}
    {object.type === 'drawer' && (progress.drawerUnlocked ? <>
      <p className="house-success" role="status"><Check size={17} aria-hidden="true" />Drawer unlocked. Case documents added.</p>
      <CaseDocuments ids={['incident-report', 'witness-note', 'partial-reference']} />
    </> : progress.puzzleStates.cipher === 'completed' ? <>
      <CaseDocuments ids={['cipher-rubbing']} />
      <NumericKeypad digits={3} onSubmitCode={code =>
        onAction({ type: 'UNLOCK_DRAWER', code }) ? 'Drawer unlocked.' : 'The drawer is still locked. Check the spine numbers.'} />
    </> : <p className="house-lock"><Lock size={16} aria-hidden="true" />Solve the study bookshelf cipher to find the drawer code.</p>)}
    {object.type === 'door' && (key ? <div className="house-action"><Button className="primary"
      onClick={() => onAction({ type: 'UNLOCK_EXIT', at: new Date().toISOString() })}>Use House Exit Key</Button></div>
      : <p className="house-lock"><Lock size={16} aria-hidden="true" />The door is locked. You still need the key.</p>)}
    <div className="modal-actions"><Button className="secondary" onClick={onClose}>Leave</Button></div>
  </Modal>
}

export function HouseInventory({ progress, onClose }: { progress: EscapeRoomProgress; onClose: () => void }) {
  return <Modal title="House Inventory" eyebrow="THE MISSING EVIDENCE" onClose={onClose}>
    <div className="house-inventory">
      {categories.map(category => {
        const Icon = categoryIcons[category]
        const collected = progress.inventory.filter(id => items[id].category === category)
        return <section key={category}>
          <h3><Icon aria-hidden="true" size={17} /> {category} <small>{collected.length}</small></h3>
          {collected.length > 0 ? <CaseDocuments ids={collected} /> : <p>Nothing collected yet.</p>}
        </section>
      })}
    </div>
  </Modal>
}

export function HouseCompletion({ progress, onReturn, onReview, onReplay, onClose }: {
  progress: EscapeRoomProgress; onReturn: () => void; onReview: () => void; onReplay: () => void; onClose: () => void
}) {
  const summary = escapeSummary(progress)
  const totalSeconds = Math.floor(progress.elapsedMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return <Modal title="Level 1 Completed — The Missing Evidence" eyebrow="CASE CLOSED" onClose={onClose}>
    <p>{items['final-evidence'].description}</p>
    <dl className="house-results">
      <div><dt>Puzzles completed</dt><dd>{summary.puzzles} / 5</dd></div>
      <div><dt>Evidence collected</dt><dd>{summary.evidence}</dd></div>
      <div><dt>Hints used</dt><dd>{summary.hints}</dd></div>
      <div><dt>Completion time</dt><dd>{minutes}m {String(seconds).padStart(2, '0')}s</dd></div>
    </dl>
    <div className="house-entry-actions">
      <Button className="primary" onClick={onReturn}>Return to Neighbourhood</Button>
      <Button className="secondary" onClick={onReview}>Review Evidence</Button>
      <Button className="secondary" onClick={onReplay}>Replay Level</Button>
    </div>
  </Modal>
}
