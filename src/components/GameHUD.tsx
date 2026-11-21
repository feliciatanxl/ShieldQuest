import { useState } from 'react'
import { Backpack, Check, ChevronDown, CloudSun, Coins, Compass, Gamepad2, Hand, Map, Menu, Settings, Shirt, SkipForward, Sparkles } from 'lucide-react'
import type { Hotspot } from '../game/events'
import type { Point, Save } from '../state/saveGame'
import { WALK_GOAL } from '../state/saveGame'
import { clueIds, EXPLORE_GOAL } from '../state/investigation'
import { canStartSpot, SPOT_TITLE } from '../state/spotTheRisk'
import { HOLD_TITLE } from '../state/holdBeforeActing'
import { INFLUENCE_TITLE } from '../state/identifyTheInfluence'
import { CONSEQUENCES_TITLE } from '../state/evaluateConsequences'
import { LEAD_TITLE } from '../state/leadTheRightChoice'
import { DEFEND_TITLE, FRAMEWORK_COMPLETE, STORY_TITLE } from '../state/defendYourCommunity'
import type { AvailableAssessment } from '../state/shield'
import { AvatarSprite } from './AvatarSprite'
import { Button } from './ui'
import { VirtualJoystick } from './VirtualJoystick'

export type GameTool = 'wardrobe' | 'pack' | 'settings' | 'map'
export type Panel = GameTool | 'menu'

export function currentObjective(save: Save) {
  const { scene, tutorial, investigation } = save
  if (scene === 'House') return save.escapeRoom.completedAt ? 'Level 1 Completed' : 'Investigate the Missing Evidence'
  if (scene === 'HouseH') return 'Hold Practice · Freeze Frame Station'
  if (scene === 'FreezeFrame') return 'Freeze Frame · Minimart Investigation'
  if (scene === 'HouseI') return 'Influence Practice · Whisper Network Station'
  if (save.shield.D) return STORY_TITLE
  if (save.shield.L) return DEFEND_TITLE
  if (save.shield.E) return LEAD_TITLE
  if (save.shield.I) return CONSEQUENCES_TITLE
  if (save.shield.H) return INFLUENCE_TITLE
  if (save.shield.S) return HOLD_TITLE
  if (canStartSpot(investigation)) return SPOT_TITLE
  if (scene === 'Neighbourhood' && tutorial === 'active') return 'Move around'
  if (scene === 'Neighbourhood' && investigation.choice && investigation.clues.length === clueIds.length) return 'Explore Sunshine Estate'
  if (scene === 'Neighbourhood') return 'Enter Sunshine Minimart'
  if (investigation.walked < EXPLORE_GOAL) return 'Explore the minimart'
  if (investigation.clues.length < clueIds.length) return 'Inspect five clues'
  if (!investigation.spokeToJun) return 'Speak with Jun'
  if (!investigation.choice) return 'Choose how to respond'
  return 'Return to Sunshine Estate'
}

export function objectiveDetails(save: Save) {
  switch (currentObjective(save)) {
    case 'Investigate the Missing Evidence': return 'Search the living room for the host’s instructions. Reopen collected clues in House Inventory.'
    case 'Freeze Frame · Minimart Investigation': return 'Observe Jun, freeze time to inspect evidence, and ask questions before taking action.'
    case 'Level 1 Completed': return 'The case is closed. Reopen the front door panel to review your results or replay.'
    case SPOT_TITLE: return 'Classify observations and assumptions using the five clues you found.'
    case HOLD_TITLE: return 'Spot the Risk — Completed. Choose how to respond to Jun’s request in the moment.'
    case INFLUENCE_TITLE: return 'Hold Before Acting — Completed. Identify the influence in Jun’s request.'
    case CONSEQUENCES_TITLE: return 'Identify the Influence — Completed. Match decisions to plausible immediate and later consequences.'
    case LEAD_TITLE: return 'Evaluate Consequences — Completed. Build a message that helps Jun choose a safer next step.'
    case DEFEND_TITLE: return 'Lead the Right Choice — Completed. Build a plan to seek help safely and share what you know.'
    case STORY_TITLE: return 'Defend Your Community — Completed. You can keep exploring Sunshine Estate.'
    case 'Move around': return 'Explore the estate with the joystick, WASD, or the arrow keys.'
    case 'Enter Sunshine Minimart': return 'Look for the teal storefront beside Kopi Corner. Use the prompt at its door.'
    case 'Explore the minimart': return 'Walk into the shop and look around the aisles.'
    case 'Inspect five clues': return `${save.investigation.clues.length} / ${clueIds.length} clues discovered. Look for gold floor markers near objects.`
    case 'Speak with Jun': return 'Look for Jun in the aisle beside the shelves.'
    case 'Choose how to respond': return 'Speak to Jun again to choose how you want to respond.'
    case 'Return to Sunshine Estate': return 'Head to the edge of the green entrance mat to leave the shop.'
    default: return 'Visit Kopi Corner, the bus stop or the minimart storefront. Use the interaction prompt when a neighbour is nearby.'
  }
}

function Tutorial({ walked, onContinue, onSkip }: { walked: number; onContinue: () => void; onSkip: () => void }) {
  const ratio = walked / WALK_GOAL
  const done = ratio >= 1
  return <section className="tutorial" aria-label="Movement tutorial">
    <div className="keyboard-art" aria-hidden="true"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
    <div className="tutorial-body">
      <div className="eyebrow"><Gamepad2 size={16} /> MOVEMENT TUTORIAL</div>
      <h2>{done ? 'You’ve got it!' : 'Let’s take a walk.'}</h2>
      <p>{done ? 'The estate is yours to explore.' : <>
        <span className="keyboard-instructions">Use <strong>WASD</strong> or the arrow keys to move. Hold <strong>Shift</strong> to run.</span>
        <span className="touch-instructions">Drag the joystick to walk. Push past the ring to run.</span>
      </>}</p>
      <div className="tutorial-progress">
        <div role="progressbar" aria-label="Movement progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(ratio * 100)} className="tutorial-dots">
          {[0, 1, 2].map(index => <span key={index} className={ratio >= (index + 1) / 3 ? 'filled' : ''} />)}
        </div>
        <span>{done ? 'Walk complete' : `${Math.floor(ratio * 100)}% walked`}</span>
      </div>
    </div>
    <div className="tutorial-actions">
      <Button className="primary" disabled={!done} onClick={onContinue}>Continue <Check size={17} /></Button>
      <button className="text-button" type="button" onClick={onSkip}>Skip tutorial <SkipForward size={15} /></button>
    </div>
  </section>
}

export function GameHUD({ save, nearby, transitioning, blocked, onAction, onPanel, onTutorial, onMove, onOpenAssessment }: {
  save: Save; nearby: Hotspot | null; transitioning: boolean; blocked: boolean; onAction: () => void; onPanel: (panel: Panel) => void;
  onTutorial: (status: 'done' | 'skipped') => void; onMove: (point: Point) => void
  onOpenAssessment: (competency: AvailableAssessment) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const xp = Math.round(save.walked / WALK_GOAL * 20)
  const indoors = save.scene === 'Minimart' || save.scene === 'HouseH' || save.scene === 'HouseI' || save.scene === 'FreezeFrame'
  const house = save.scene === 'House'
  const tutorial = save.tutorial === 'active' && !indoors && !house
  const { S, H, I, E, L, D } = save.shield
  const frameworkComplete = !!(S && H && I && E && L && D)
  return <div className="hud" inert={transitioning}>
    <div className="hud-top">
      <div className="hud-left">
        <section className="dark-panel player-card" aria-label="Player status">
          <div className="portrait"><AvatarSprite avatar={save.avatar} /></div>
          <div className="player-data">
            <strong>PLAYER01</strong><span>LEVEL 01</span>
            <div className="xp-bar" role="progressbar" aria-label="Experience" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={100}><i style={{ width: xp + '%' }} /></div>
          </div>
        </section>
        <section className="objective dark-panel">
          <button type="button" className="objective-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            <Compass size={20} /><span><small>CURRENT OBJECTIVE</small><strong>{currentObjective(save)}</strong></span><ChevronDown size={16} className={expanded ? 'rotated' : ''} />
          </button>
          {expanded && <p>{objectiveDetails(save)}</p>}
          {!house && <>
          {frameworkComplete && <p className="framework-completion" role="status">
            <Check size={16} aria-hidden="true" /><span><strong>{FRAMEWORK_COMPLETE}</strong><small>6 of 6 submitted</small></span>
          </p>}
          {(L || D) && <Button className="primary spot-entry" onClick={() => onOpenAssessment('D')}>
            {D ? 'Review Defend Your Community result' : 'Begin Defend Your Community'}
          </Button>}
          {(save.shield.E || save.shield.L) && <Button className={`${L ? 'secondary' : 'primary'} spot-entry`} onClick={() => onOpenAssessment('L')}>
            {save.shield.L ? 'Review Lead the Right Choice result' : 'Begin Lead the Right Choice'}
          </Button>}
          {(save.shield.I || save.shield.E) && <Button className={`${save.shield.E ? 'secondary' : 'primary'} spot-entry`} onClick={() => onOpenAssessment('E')}>
            {save.shield.E ? 'Review Evaluate Consequences result' : 'Begin Evaluate Consequences'}
          </Button>}
          {(save.shield.H || save.shield.I) && <Button className={`${save.shield.I ? 'secondary' : 'primary'} spot-entry`} onClick={() => onOpenAssessment('I')}>
            {save.shield.I ? 'Review Identify the Influence result' : 'Begin Identify the Influence'}
          </Button>}
          {(save.shield.S || save.shield.H) && <Button className={`${save.shield.H ? 'secondary' : 'primary'} spot-entry`} onClick={() => onOpenAssessment('H')}>
            {save.shield.H ? 'Review Hold Before Acting result' : 'Begin Hold Before Acting'}
          </Button>}
          {(save.shield.S || canStartSpot(save.investigation)) && <Button className={`${save.shield.S ? 'secondary' : 'primary'} spot-entry`} onClick={() => onOpenAssessment('S')}>
            {save.shield.S ? 'Review Spot the Risk result' : 'Begin Spot the Risk'}
          </Button>}
          </>}
        </section>
      </div>
      <div className="hud-centre dark-panel">
        <div className="coin-total" aria-label={save.coins + ' coins'}><Coins size={21} /><strong>{save.coins}</strong></div>
        <button type="button" onClick={() => onPanel('wardrobe')} title="Wardrobe" aria-label="Wardrobe"><Shirt size={19} /><span>Wardrobe</span></button>
        <button type="button" onClick={() => onPanel('pack')} title={house ? 'House Inventory' : 'Pack'} aria-label={house ? 'House Inventory' : 'Pack'}>
          <Backpack size={19} /><span>{house ? 'Inventory' : 'Pack'}</span>
        </button>
      </div>
      <div className="hud-right">
        <div className="weather dark-panel" aria-label="Fictional in-game time and weather"><CloudSun size={25} /><span><strong>5:42 PM</strong><small>SAT · 31°C · FAIR</small></span></div>
        <div className="hud-tools">
          {([['settings', Settings], ['map', Map], ['menu', Menu]] as const).map(([panel, Icon]) =>
            <button className="dark-panel" key={panel} type="button" aria-label={panel[0].toUpperCase() + panel.slice(1)} title={panel} onClick={() => onPanel(panel)}><Icon size={20} /></button>)}
        </div>
      </div>
    </div>
    <div className="world-label dark-panel"><Sparkles size={14} /> {house ? 'THE MYSTERIOUS HOUSE' : save.scene === 'HouseH' ? 'FREEZE FRAME HOUSE' : save.scene === 'HouseI' ? 'WHISPER NETWORK HOUSE' : save.scene === 'FreezeFrame' ? 'FREEZE FRAME · INVESTIGATION' : indoors ? 'SUNSHINE MINIMART' : 'SUNSHINE ESTATE'}</div>
    <div className="hud-bottom">
      <VirtualJoystick blocked={blocked || transitioning} onMove={onMove} />
      {nearby && <button className="interact dark-panel" type="button" aria-label={nearby.label}
        onClick={onAction} disabled={blocked || transitioning}>
        <kbd aria-hidden="true">E</kbd>
        <span className="touch-interact-icon" aria-hidden="true"><Hand size={20} /></span>
        <span>{nearby.label}</span>
      </button>}
      {tutorial && <Tutorial walked={save.walked} onContinue={() => onTutorial('done')} onSkip={() => onTutorial('skipped')} />}
    </div>
  </div>
}
