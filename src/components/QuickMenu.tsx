import { useState } from 'react'
import { Backpack, ChevronDown, ClipboardList, Compass, DoorOpen, Gamepad2, Map, Play, RotateCcw, Save as SaveIcon, Settings, Shield, Shirt, Users } from 'lucide-react'
import type { Save } from '../state/saveGame'
import { guardians } from '../state/guardians'
import { currentObjective, objectiveDetails } from './GameHUD'
import type { GamePanelView } from './GamePanels'
import { Button, Modal } from './ui'

const shortcuts = [
  { key: 'missions', icon: ClipboardList, label: 'Missions', detail: 'Track your current objective' },
  { key: 'friends', icon: Users, label: 'Friends', detail: 'View friends and friend code' },
  { key: 'guardians', icon: Shield, label: 'Guardians', detail: '' },
  { key: 'wardrobe', icon: Shirt, label: 'Wardrobe', detail: 'Edit your look' },
  { key: 'pack', icon: Backpack, label: 'Inventory', detail: 'Estate pocket guide' },
  { key: 'map', icon: Map, label: 'Map', detail: 'Sunshine Estate' },
  { key: 'settings', icon: Settings, label: 'Settings', detail: 'Motion and display' },
] as const

export function QuickMenu({ save, onClose, onOpen, onCheckpoint, onReturn, onReturnToNeighbourhood }: {
  save: Save
  onClose: () => void
  onOpen: (panel: GamePanelView | 'friends') => void
  onCheckpoint: () => boolean
  onReturn: () => void
  onReturnToNeighbourhood: () => void
}) {
  const [feedback, setFeedback] = useState('')
  const house = save.scene === 'House'
  const isInterior = house || save.scene === 'HouseH' || save.scene === 'HouseI'
  const area = house ? 'The Mysterious House'
    : save.scene === 'HouseH' ? 'Freeze Frame House'
    : save.scene === 'HouseI' ? 'Whisper Network House'
    : save.scene === 'Minimart' ? 'Sunshine Minimart' : 'Sunshine Estate'

  return <Modal title={area} eyebrow="PAUSED · QUICK MENU" className="quick-menu" onClose={onClose}>
    <details className="quick-objective">
      <summary className="quick-card">
        <span className="quick-icon"><Compass size={21} aria-hidden="true" /></span>
        <span className="quick-card-copy"><small>ACTIVE OBJECTIVE</small><strong>{currentObjective(save)}</strong></span>
        <ChevronDown className="quick-disclosure" size={16} aria-hidden="true" />
      </summary>
      <p>{objectiveDetails(save)}</p>
    </details>
    <nav className="quick-shortcuts" aria-label="Game shortcuts">
      {shortcuts.map(({ key, icon: Icon, label, detail }) => {
        const open = () => onOpen(key as GamePanelView | 'friends')
        const status = key === 'guardians' ? `${save.collectedGuardians.length} of ${guardians.length} collected`
          : key === 'map' ? area : key === 'pack' && house ? 'House evidence and keys' : detail
        return <button className={`quick-card quick-${key}`} key={key} type="button" onClick={open}>
          <span className="quick-icon"><Icon size={21} aria-hidden="true" /></span>
          <span className="quick-card-copy"><strong>{label}</strong><small>{status}</small></span>
        </button>
      })}
    </nav>
    <footer className="quick-footer">
      <div className="quick-utilities">
        <Button onClick={() => setFeedback(onCheckpoint() ? 'Checkpoint saved.' : 'Browser storage is unavailable.')}><SaveIcon size={16} /> Save checkpoint</Button>
        <Button onClick={() => onOpen('controls')}><Gamepad2 size={17} /> Help &amp; controls</Button>
        {isInterior
          ? <Button onClick={onReturnToNeighbourhood}><DoorOpen size={16} /> Return to Neighbourhood</Button>
          : <Button onClick={() => onOpen('restart')}><RotateCcw size={16} /> Restart tutorial</Button>}
        <Button onClick={onReturn}><DoorOpen size={17} /> Return to title</Button>
      </div>
      <a href="/map-data/attribution.html" target="_blank" rel="noreferrer">Map credits &amp; licence</a>
      <p className="quick-feedback" role="status">{feedback}</p>
      <Button className="quick-resume" onClick={onClose}><Play size={16} /> Resume game</Button>
    </footer>
  </Modal>
}
