import { ClipboardList, LockKeyhole, Search } from 'lucide-react'
import { clueIds, clues, type ClueId } from '../state/investigation'
import { Button, Modal } from './ui'

export function Observation({ id }: { id: ClueId }) {
  const { observed, unknown, assumption } = clues[id]
  return <dl className="observation">
    <div><dt>Verified observation</dt><dd>{observed}</dd></div>
    <div><dt>Still unknown</dt><dd>{unknown}</dd></div>
    <div><dt>Possible assumption</dt><dd>{assumption}</dd></div>
  </dl>
}

export function CluePanel({ id, onClose, onOpenBoard }: { id: ClueId; onClose: () => void; onOpenBoard: () => void }) {
  return <Modal title={clues[id].title} eyebrow="FIELD OBSERVATION" onClose={onClose}>
    <Observation id={id} />
    <div className="modal-actions">
      <Button className="secondary" onClick={onOpenBoard}><ClipboardList size={17} /> Evidence board</Button>
      <Button className="primary" onClick={onClose}>Keep exploring</Button>
    </div>
  </Modal>
}

export function EvidenceBoard({ discovered, spotComplete, onOpenSpot, onClose }: {
  discovered: ClueId[]; spotComplete: boolean; onOpenSpot: () => void; onClose: () => void
}) {
  return <Modal title="Evidence board" eyebrow="THE LOOKOUT DILEMMA" className="evidence-board" onClose={onClose}>
    <div className="evidence-progress">
      <label htmlFor="clue-progress">Clues discovered: {discovered.length} / {clueIds.length}</label>
      <progress id="clue-progress" value={discovered.length} max={clueIds.length} />
    </div>
    <ol className="evidence-list">
      {clueIds.map(id => <li key={id}>
        {discovered.includes(id)
          ? <details><summary><Search size={16} /> {clues[id].title}</summary><Observation id={id} /></details>
          : <p><LockKeyhole size={16} /> Undiscovered clue</p>}
      </li>)}
    </ol>
    {(spotComplete || clueIds.every(id => discovered.includes(id))) && <div className="modal-actions">
      <Button className="primary" onClick={onOpenSpot}>{spotComplete ? 'Review Spot the Risk result' : 'Begin Spot the Risk'}</Button>
    </div>}
  </Modal>
}
