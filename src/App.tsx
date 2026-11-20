import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CharacterCustomizer } from './components/CharacterCustomizer'
import { CluePanel, EvidenceBoard } from './components/EvidenceBoard'
import { DefendYourCommunityChallenge } from './components/DefendYourCommunityChallenge'
import { EvaluateConsequencesChallenge } from './components/EvaluateConsequencesChallenge'
import { GameCanvas } from './components/GameCanvas'
import { GameHUD } from './components/GameHUD'
import { HoldBeforeActingChallenge } from './components/HoldBeforeActingChallenge'
import { IdentifyTheInfluenceChallenge } from './components/IdentifyTheInfluenceChallenge'
import { LeadTheRightChoiceChallenge } from './components/LeadTheRightChoiceChallenge'
import { DialogueBox, GamePanel, type GamePanelView } from './components/GamePanels'
import { MainMenu } from './components/MainMenu'
import { QuickMenu } from './components/QuickMenu'
import { SpotTheRiskChallenge } from './components/SpotTheRiskChallenge'
import { Button, Modal } from './components/ui'
import { GameBridge, type Hotspot, type ResidentId } from './game/events'
import { isResident } from './game/residentData'
import { presets, type Avatar } from './state/avatar'
import { newSave, readSave, START, WALK_GOAL, writeSave, type Point, type Save } from './state/saveGame'
import { EXPLORE_GOAL, isClue, type ClueId, type JunChoice } from './state/investigation'
import { canStartSpot, scoreSpot, type SpotResponse } from './state/spotTheRisk'
import { scoreHold, type HoldResponse } from './state/holdBeforeActing'
import { scoreInfluence, type InfluenceAnswers } from './state/identifyTheInfluence'
import { scoreConsequences, type ConsequenceMatch } from './state/evaluateConsequences'
import { scoreLead, type LeadAnswers } from './state/leadTheRightChoice'
import { scoreDefend, type DefendAnswers } from './state/defendYourCommunity'
import type { AvailableAssessment } from './state/shield'

type Screen = 'menu' | 'customise' | 'play'
type PanelOverlay = { type: 'panel'; panel: GamePanelView | 'menu'; fromMenu?: boolean }
type EvidenceOverlay = { type: 'evidence'; parent?: PanelOverlay }
type Overlay =
  | PanelOverlay
  | { type: 'dialogue'; id: ResidentId }
  | { type: 'clue'; id: ClueId }
  | EvidenceOverlay
  | { type: 'assessment'; competency: AvailableAssessment; parent?: EvidenceOverlay }

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [save, setSave] = useState(readSave)
  const current = useRef(save)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const locked = useRef(false)
  const [nearby, setNearby] = useState<Hotspot | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const bridge = useMemo(() => new GameBridge(), [])
  const move = useCallback((direction: Point) => bridge.emit('direction', direction), [bridge])

  function persist(next: Save) {
    current.current = next
    setSave(next)
    const saved = writeSave(next)
    setStorageAvailable(saved)
    return saved
  }

  useLayoutEffect(() => {
    locked.current = !!overlay
    bridge.emit('lock', locked.current)
  }, [bridge, overlay])

  useEffect(() => {
    const cleanup = [
      bridge.on('proximity', setNearby),
      bridge.on('transition', setTransitioning),
      bridge.on('ready', () => bridge.emit('lock', locked.current)),
      bridge.on('checkpoint', ({ scene, position, distance }) => {
        const previous = current.current
        if (!previous) return
        if (scene === 'Minimart') {
          persist({ ...previous, scene, position, investigation: {
            ...previous.investigation, entered: true,
            walked: Math.min(EXPLORE_GOAL, previous.investigation.walked + distance),
          } })
        } else {
          persist({ ...previous, scene, position, walked: Math.min(WALK_GOAL, previous.walked + distance) })
        }
      }),
      bridge.on('interact', id => {
        const previous = current.current
        if (locked.current || !previous) return
        const investigation = previous.investigation
        if (isClue(id)) {
          locked.current = true
          if (!investigation.clues.includes(id)) {
            persist({ ...previous, investigation: { ...investigation, clues: [...investigation.clues, id] } })
          }
          setOverlay({ type: 'clue', id })
        } else if (isResident(id)) {
          locked.current = true
          if (id === 'jun' && !investigation.spokeToJun) {
            persist({ ...previous, investigation: { ...investigation, spokeToJun: true } })
          }
          setOverlay({ type: 'dialogue', id })
        }
      }),
    ]
    return () => cleanup.forEach(remove => remove())
  }, [bridge])

  function start(avatar: Avatar) {
    const fresh = newSave(avatar)
    fresh.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    persist(fresh)
    setScreen('play')
  }

  function update(changes: Partial<Save>) {
    if (!current.current) return
    persist({ ...current.current, ...changes })
    if (changes.avatar) bridge.emit('avatar', changes.avatar)
    if (changes.reducedMotion !== undefined) bridge.emit('motion', changes.reducedMotion)
  }

  function saveCheckpoint() {
    return current.current ? persist(current.current) : false
  }

  function chooseResponse(choice: JunChoice) {
    const previous = current.current
    if (!previous || previous.investigation.choice) return
    persist({ ...previous, investigation: { ...previous.investigation, choice } })
  }

  function openAssessment(competency: AvailableAssessment, parent?: EvidenceOverlay) {
    const previous = current.current
    if (!previous) return
    const available = previous.shield[competency] || {
      S: canStartSpot(previous.investigation), H: !!previous.shield.S, I: !!previous.shield.H, E: !!previous.shield.I,
      L: !!previous.shield.E, D: !!previous.shield.L,
    }[competency]
    if (available) setOverlay({ type: 'assessment', competency, parent })
  }

  function submitSpot(responses: SpotResponse[]) {
    const previous = current.current
    if (!previous || previous.shield.S || !canStartSpot(previous.investigation)) return
    const result = scoreSpot(responses, new Date().toISOString())
    if (result) persist({ ...previous, shield: { ...previous.shield, S: result } })
  }

  function submitHold(response: HoldResponse) {
    const previous = current.current
    if (!previous?.shield.S || previous.shield.H) return
    const result = scoreHold(response, new Date().toISOString())
    persist({ ...previous, shield: { ...previous.shield, H: result } })
  }

  function submitInfluence(answers: InfluenceAnswers) {
    const previous = current.current
    if (!previous?.shield.H || previous.shield.I) return
    const result = scoreInfluence(answers, new Date().toISOString())
    persist({ ...previous, shield: { ...previous.shield, I: result } })
  }

  function submitConsequences(matches: ConsequenceMatch[]) {
    const previous = current.current
    if (!previous?.shield.I || previous.shield.E) return
    const result = scoreConsequences(matches, new Date().toISOString())
    if (result) persist({ ...previous, shield: { ...previous.shield, E: result } })
  }

  function submitLead(answers: LeadAnswers) {
    const previous = current.current
    if (!previous?.shield.E || previous.shield.L) return
    const result = scoreLead(answers, new Date().toISOString())
    if (result) persist({ ...previous, shield: { ...previous.shield, L: result } })
  }

  function submitDefend(answers: DefendAnswers) {
    const previous = current.current
    if (!previous?.shield.L || previous.shield.D) return
    const result = scoreDefend(answers, new Date().toISOString())
    if (result) persist({ ...previous, shield: { ...previous.shield, D: result } })
  }

  function returnToMenu() {
    saveCheckpoint()
    setOverlay(null)
    setNearby(null)
    setTransitioning(false)
    setScreen('menu')
  }

  if (screen === 'play' && save) return <main className={`game-shell ${save.reducedMotion ? 'reduce-motion' : ''} ${save.scene === 'Minimart' ? 'minimart-shell' : ''}`}>
    <GameCanvas launch={{ bridge, avatar: save.avatar, scene: save.scene, position: save.position, reducedMotion: save.reducedMotion }} />
    <GameHUD save={save} nearby={nearby} transitioning={transitioning} blocked={!!overlay}
      onAction={() => { if (!locked.current && !transitioning) bridge.emit('action', undefined) }}
      onMove={move} onPanel={panel => setOverlay({ type: 'panel', panel })}
      onTutorial={tutorial => update({ tutorial })} onOpenAssessment={openAssessment} />
    {overlay?.type === 'dialogue' && <DialogueBox id={overlay.id} choice={save.investigation.choice}
      onChoice={chooseResponse} onClose={() => setOverlay(null)} />}
    {overlay?.type === 'clue' && <CluePanel id={overlay.id} onClose={() => setOverlay(null)} onOpenBoard={() => setOverlay({ type: 'evidence' })} />}
    {overlay?.type === 'evidence' && <EvidenceBoard discovered={save.investigation.clues} spotComplete={!!save.shield.S}
      onOpenSpot={() => openAssessment('S', overlay)} onClose={() => setOverlay(overlay.parent ?? null)} />}
    {overlay?.type === 'assessment' && <>
      {overlay.competency === 'S' && <SpotTheRiskChallenge result={save.shield.S} onSubmit={submitSpot} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'H' && <HoldBeforeActingChallenge result={save.shield.H} onSubmit={submitHold} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'I' && <IdentifyTheInfluenceChallenge result={save.shield.I} onSubmit={submitInfluence} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'E' && <EvaluateConsequencesChallenge result={save.shield.E} onSubmit={submitConsequences} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'L' && <LeadTheRightChoiceChallenge result={save.shield.L} onSubmit={submitLead} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'D' && <DefendYourCommunityChallenge result={save.shield.D} onSubmit={submitDefend} onClose={() => setOverlay(overlay.parent ?? null)} />}
    </>}
    {overlay?.type === 'panel' && (overlay.panel === 'menu'
      ? <QuickMenu save={save} onClose={() => setOverlay(null)} onCheckpoint={saveCheckpoint} onReturn={returnToMenu}
        onOpen={panel => setOverlay({ type: 'panel', panel, fromMenu: true })} />
      : <GamePanel panel={overlay.panel} save={save} onUpdate={update}
        onOpenBoard={() => setOverlay({ type: 'evidence', parent: overlay })}
        onRestart={() => { update({ tutorial: 'active', walked: 0 }); setOverlay(null) }}
        onClose={() => setOverlay(overlay.fromMenu ? { type: 'panel', panel: 'menu' } : null)} />)}
    {!storageAvailable && <p className="storage-warning" role="status">Browser storage is unavailable. Progress will last for this session.</p>}
  </main>

  return <div className={'game-shell menu-shell ' + (screen === 'customise' ? 'character-shell' : '')}>
    <GameCanvas launch={{ bridge, avatar: presets[0].avatar, position: START, preview: true, reducedMotion: true }} />
    <div className="menu-veil" aria-hidden="true" />
    {screen === 'menu' ? <MainMenu canContinue={!!save} storageAvailable={storageAvailable}
      onStart={() => save ? setConfirm(true) : setScreen('customise')} onContinue={() => save && setScreen('play')} />
      : <main className="custom-main"><CharacterCustomizer initial={presets[0].avatar} onBack={() => setScreen('menu')} onConfirm={start} /></main>}
    {confirm && <Modal title="Start a new game?" onClose={() => setConfirm(false)}>
      <p>Your saved adventure will be replaced when you confirm a new character.</p>
      <div className="modal-actions">
        <Button className="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
        <Button className="primary" onClick={() => { setConfirm(false); setScreen('customise') }}>Create new character</Button>
      </div>
    </Modal>}
  </div>
}
