import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CharacterCustomizer } from './components/CharacterCustomizer'
import { CluePanel, EvidenceBoard } from './components/EvidenceBoard'
import { DefendYourCommunityChallenge } from './components/DefendYourCommunityChallenge'
import { EvaluateConsequencesChallenge } from './components/EvaluateConsequencesChallenge'
import { HouseCompletion, HouseEntry, HouseInspection, HouseInventory } from './components/EscapeRoomPanels'
import { GameCanvas } from './components/GameCanvas'
import { GameHUD } from './components/GameHUD'
import { HoldBeforeActingChallenge } from './components/HoldBeforeActingChallenge'
import { IdentifyTheInfluenceChallenge } from './components/IdentifyTheInfluenceChallenge'
import { LeadTheRightChoiceChallenge } from './components/LeadTheRightChoiceChallenge'
import { MultiplayerLobby } from './components/MultiplayerLobby'
import { lobbyEndpoint } from './multiplayer/endpoint'
import { FriendsPanel } from './components/FriendsPanel'
import { FreezeFrameGame } from './components/FreezeFrameGame'
import { WhisperNetworkGame } from './components/WhisperNetworkGame'
import { FreezeInspectionModal, FreezeDialogueModal, FreezeDecisionModal } from './components/FreezeFrameInvestigation'
import { WhisperInterviewModal, WhisperTerminalModal, WhisperBoardModal } from './components/WhisperInvestigation'
import type { FreezeHotspotId } from './state/freezeFrame'
import { DialogueBox, GamePanel, type GamePanelView } from './components/GamePanels'
import { MainMenu } from './components/MainMenu'
import { QuickMenu } from './components/QuickMenu'
import { SpotTheRiskChallenge } from './components/SpotTheRiskChallenge'
import { Button, Modal } from './components/ui'
import { GameBridge, type Hotspot, type ResidentId } from './game/events'
import { isResident } from './game/residentData'
import { houseObject, type HouseObject } from './game/houseLayout'
import { HOUSE_DOOR, HOUSE_H_DOOR, HOUSE_H_SPAWN, HOUSE_I_DOOR, HOUSE_I_SPAWN, HOUSE_SPAWN, FREEZE_FRAME_SPAWN, type Location } from './game/locations'
import { applyEscapeAction, newEscapeRoom, type EscapeAction } from './state/escapeRoom'
import { presets, type Avatar } from './state/avatar'
import { newSave, readSave, START, WALK_GOAL, writeSave, type Point, type Save } from './state/saveGame'
import { EXPLORE_GOAL, isClue, type ClueId, type JunChoice } from './state/investigation'
import { canStartSpot, scoreSpot, type SpotResponse } from './state/spotTheRisk'
import { scoreHold, type HoldResponse } from './state/holdBeforeActing'
import { scoreInfluence, type InfluenceAnswers } from './state/identifyTheInfluence'
import { scoreConsequences, type ConsequenceMatch } from './state/evaluateConsequences'
import { scoreLead, type LeadAnswers } from './state/leadTheRightChoice'
import { scoreDefend, type DefendAnswers } from './state/defendYourCommunity'
import { guardians, type GuardianId } from './state/guardians'
import type { AvailableAssessment } from './state/shield'

type Screen = 'menu' | 'customise' | 'play'
type PanelOverlay = { type: 'panel'; panel: GamePanelView | 'menu' | 'friends'; fromMenu?: boolean }
type EvidenceOverlay = { type: 'evidence'; parent?: PanelOverlay }
type Overlay =
  | PanelOverlay
  | { type: 'dialogue'; id: ResidentId }
  | { type: 'clue'; id: ClueId }
  | { type: 'house-entry' }
  | { type: 'house-lobby'; mode: 'create' | 'join' }
  | { type: 'house-inspect'; object: HouseObject }
  | { type: 'house-inventory'; fromMenu?: boolean; fromCompletion?: boolean }
  | { type: 'house-complete' }
  | EvidenceOverlay
  | { type: 'assessment'; competency: AvailableAssessment; parent?: EvidenceOverlay }
  | { type: 'freeze-frame'; parent?: Overlay }
  | { type: 'whisper-network'; parent?: Overlay }
  | { type: 'ff-inspect'; id: FreezeHotspotId }
  | { type: 'ff-dialogue'; speaker: 'jun' | 'cashier' }
  | { type: 'ff-decision' }
  | { type: 'whisper-interview'; witnessId: 'amir' | 'may' | 'jun' }
  | { type: 'whisper-terminal' }
  | { type: 'whisper-board' }

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [save, setSave] = useState(readSave)
  const current = useRef(save)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [ffFacts, setFfFacts] = useState<FreezeHotspotId[]>([])
  const [ffQuestions, setFfQuestions] = useState<string[]>([])
  const [whisperPhrases, setWhisperPhrases] = useState<string[]>([])
  const locked = useRef(false)
  const houseClock = useRef<number | undefined>(undefined)
  const [nearby, setNearby] = useState<Hotspot | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const bridge = useMemo(() => new GameBridge(), [])
  const multiplayer = useMemo(lobbyEndpoint, [])
  const closeLobby = useCallback(() => setOverlay({ type: 'house-entry' }), [])
  const move = useCallback((direction: Point) => bridge.emit('direction', direction), [bridge])

  function persist(next: Save) {
    current.current = next
    setSave(next)
    const saved = writeSave(next)
    setStorageAvailable(saved)
    return saved
  }

  function accountHouseTime(previous: Save): Save {
    if (houseClock.current === undefined || previous.scene !== 'House' || previous.escapeRoom.completedAt) return previous
    const now = performance.now()
    const elapsed = Math.floor(now - houseClock.current)
    if (elapsed < 1) return previous
    houseClock.current += elapsed
    return { ...previous, escapeRoom: { ...previous.escapeRoom, elapsedMs: previous.escapeRoom.elapsedMs + elapsed } }
  }

  const timingHouse = screen === 'play' && save?.scene === 'House' && !save.escapeRoom.completedAt
  useEffect(() => {
    if (!timingHouse) {
      houseClock.current = undefined
      return
    }
    if (!document.hidden) houseClock.current = performance.now()
    function checkpointTime() {
      const previous = current.current
      if (!previous) return
      const next = accountHouseTime(previous)
      if (next !== previous) persist(next)
    }
    function onVisibility() {
      if (document.hidden) {
        checkpointTime()
        houseClock.current = undefined
      } else {
        houseClock.current = performance.now()
      }
    }
    const interval = window.setInterval(checkpointTime, 5000)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', checkpointTime)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', checkpointTime)
    }
  }, [timingHouse])

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
        if (scene === 'House') {
          const timed = accountHouseTime(previous)
          persist({ ...timed, scene, position, escapeRoom: { ...timed.escapeRoom, position } })
        } else if (scene === 'Minimart') {
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
        if (id === 'house-entrance' && previous.scene === 'Neighbourhood') {
          locked.current = true
          setOverlay({ type: 'house-entry' })
        } else if (id === 'freeze-station') {
          bridge.emit('houseTravel', { target: 'FreezeFrame', position: FREEZE_FRAME_SPAWN })
        } else if (id === 'exit-freeze-frame') {
          bridge.emit('houseTravel', { target: 'HouseH', position: HOUSE_H_SPAWN })
        } else if (id === 'ff-backpack') {
          locked.current = true
          setOverlay({ type: 'ff-inspect', id: 'jun-backpack' })
        } else if (id === 'ff-cctv') {
          locked.current = true
          setOverlay({ type: 'ff-inspect', id: 'cctv-monitor' })
        } else if (id === 'ff-counter') {
          locked.current = true
          setOverlay({ type: 'ff-inspect', id: 'cashier-counter' })
        } else if (id === 'ff-basket') {
          locked.current = true
          setOverlay({ type: 'ff-inspect', id: 'shopping-basket' })
        } else if (id === 'ff-door') {
          locked.current = true
          setOverlay({ type: 'ff-inspect', id: 'entrance-door' })
        } else if (id === 'ff-jun') {
          locked.current = true
          setOverlay({ type: 'ff-dialogue', speaker: 'jun' })
        } else if (id === 'ff-cashier') {
          locked.current = true
          setOverlay({ type: 'ff-dialogue', speaker: 'cashier' })
        } else if (id === 'ff-action') {
          locked.current = true
          setOverlay({ type: 'ff-decision' })
        } else if (id === 'whisper-station' || id === 'whisper-board') {
          locked.current = true
          setOverlay({ type: 'whisper-board' })
        } else if (id === 'whisper-amir') {
          locked.current = true
          setOverlay({ type: 'whisper-interview', witnessId: 'amir' })
        } else if (id === 'whisper-may') {
          locked.current = true
          setOverlay({ type: 'whisper-interview', witnessId: 'may' })
        } else if (id === 'whisper-jun') {
          locked.current = true
          setOverlay({ type: 'whisper-interview', witnessId: 'jun' })
        } else if (id === 'whisper-terminal') {
          locked.current = true
          setOverlay({ type: 'whisper-terminal' })
        } else if (previous.scene === 'House') {
          const object = houseObject(id)
          if (!object) return
          locked.current = true
          setOverlay(object.type === 'door' && previous.escapeRoom.completedAt
            ? { type: 'house-complete' } : { type: 'house-inspect', object })
        } else if (isClue(id)) {
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
    return current.current ? persist(accountHouseTime(current.current)) : false
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

  function collectGuardian(id: GuardianId) {
    const previous = current.current
    const guardian = guardians.find(candidate => candidate.id === id)
    if (!previous || !guardian || !previous.shield[guardian.competency] || previous.collectedGuardians.includes(id)) return
    persist({ ...previous, collectedGuardians: [...previous.collectedGuardians, id] })
  }

  function travelHouse(target: Location, replay = false) {
    const previous = current.current
    if (!previous || transitioning) return
    if (target === 'Neighbourhood') {
      if (previous.scene === 'HouseH') {
        bridge.emit('houseTravel', { target: 'Neighbourhood', position: HOUSE_H_DOOR })
        setOverlay(null)
        return
      }
      if (previous.scene === 'HouseI') {
        bridge.emit('houseTravel', { target: 'Neighbourhood', position: HOUSE_I_DOOR })
        setOverlay(null)
        return
      }
      if (previous.scene === 'FreezeFrame') {
        bridge.emit('houseTravel', { target: 'HouseH', position: HOUSE_H_SPAWN })
        setOverlay(null)
        return
      }
      if (previous.scene !== 'House') {
        setOverlay(null)
        return
      }
    }
    if (target === 'HouseH') {
      bridge.emit('houseTravel', { target: 'HouseH', position: HOUSE_H_SPAWN })
      setOverlay(null)
      return
    }
    if (target === 'HouseI') {
      bridge.emit('houseTravel', { target: 'HouseI', position: HOUSE_I_SPAWN })
      setOverlay(null)
      return
    }
    if (target === 'FreezeFrame') {
      bridge.emit('houseTravel', { target: 'FreezeFrame', position: FREEZE_FRAME_SPAWN })
      setOverlay(null)
      return
    }
    if (replay) persist({ ...previous, escapeRoom: newEscapeRoom() })
    else if (previous.scene === 'House') persist(accountHouseTime(previous))
    bridge.emit('houseTravel', {
      target, position: target === 'House' ? (replay ? HOUSE_SPAWN : previous.escapeRoom.position ?? HOUSE_SPAWN) : HOUSE_DOOR,
    })
    setOverlay(null)
  }

  function applyHouseAction(action: EscapeAction) {
    const previous = current.current
    if (previous?.scene !== 'House' || overlay?.type !== 'house-inspect') return false
    const { object } = overlay
    const allowed = {
      COLLECT_ITEM: action.type === 'COLLECT_ITEM' && object.pickup?.objectId === action.objectId,
      REVEAL_HINT: action.type === 'REVEAL_HINT' && object.puzzleId === action.puzzleId,
      SUBMIT_SEQUENCE: action.type === 'SUBMIT_SEQUENCE' && object.puzzleId === action.puzzleId,
      UNLOCK_DRAWER: object.type === 'drawer',
      REVIEW_EVIDENCE: object.puzzleId === 'board',
      SUBMIT_SAFE_CODE: object.puzzleId === 'study-safe',
      UNLOCK_EXIT: object.type === 'door',
    }[action.type]
    if (!allowed) return false
    const timed = accountHouseTime(previous)
    const progress = applyEscapeAction(timed.escapeRoom, action)
    if (progress === timed.escapeRoom) {
      if (timed !== previous) persist(timed)
      return false
    }
    persist({ ...timed, escapeRoom: progress })
    if (progress.completedAt) setOverlay({ type: 'house-complete' })
    return true
  }

  function openPanel(panel: GamePanelView | 'menu' | 'friends', fromMenu = false) {
    setOverlay(panel === 'pack' && current.current?.scene === 'House'
      ? { type: 'house-inventory', fromMenu }
      : { type: 'panel', panel, fromMenu })
  }

  if (screen === 'play' && save) return <main className={`game-shell ${save.reducedMotion ? 'reduce-motion' : ''} ${save.scene === 'Minimart' ? 'minimart-shell' : ''}`}>
    <GameCanvas launch={{ bridge, avatar: save.avatar, scene: save.scene, position: save.position, reducedMotion: save.reducedMotion }} />
    <GameHUD save={save} nearby={nearby} transitioning={transitioning} blocked={!!overlay}
      onAction={() => { if (!locked.current && !transitioning) bridge.emit('action', undefined) }}
      onMove={move} onPanel={openPanel}
      onTutorial={tutorial => update({ tutorial })} onOpenAssessment={openAssessment} />
    {overlay?.type === 'house-entry' && <HouseEntry onPlay={() => travelHouse('House')} onClose={() => setOverlay(null)}
      onMultiplayer={multiplayer ? mode => setOverlay({ type: 'house-lobby', mode }) : undefined}
      onReview={save.escapeRoom.completedAt ? () => setOverlay({ type: 'house-complete' }) : undefined} />}
    {overlay?.type === 'house-lobby' && multiplayer &&
      <MultiplayerLobby mode={overlay.mode} endpoint={multiplayer} avatar={save.avatar} onClose={closeLobby} />}
    {overlay?.type === 'house-inspect' && <HouseInspection object={overlay.object} progress={save.escapeRoom}
      onAction={applyHouseAction} onClose={() => setOverlay(null)} />}
    {overlay?.type === 'house-inventory' && <HouseInventory progress={save.escapeRoom}
      onClose={() => setOverlay(overlay.fromCompletion ? { type: 'house-complete' }
        : overlay.fromMenu ? { type: 'panel', panel: 'menu' } : null)} />}
    {overlay?.type === 'house-complete' && <HouseCompletion progress={save.escapeRoom}
      onReturn={() => travelHouse('Neighbourhood')} onReview={() => setOverlay({ type: 'house-inventory', fromCompletion: true })}
      onReplay={() => travelHouse('House', true)} onClose={() => setOverlay(null)} />}
    {overlay?.type === 'dialogue' && <DialogueBox id={overlay.id} choice={save.investigation.choice}
      onChoice={chooseResponse} onClose={() => setOverlay(null)}
      onOpenFreezeFrame={() => setOverlay({ type: 'freeze-frame', parent: overlay })}
      onOpenWhisperNetwork={() => setOverlay({ type: 'whisper-network', parent: overlay })} />}
    {overlay?.type === 'clue' && <CluePanel id={overlay.id} onClose={() => setOverlay(null)} onOpenBoard={() => setOverlay({ type: 'evidence' })} />}
    {overlay?.type === 'evidence' && <EvidenceBoard discovered={save.investigation.clues} spotComplete={!!save.shield.S}
      onOpenSpot={() => openAssessment('S', overlay)} onClose={() => setOverlay(overlay.parent ?? null)} />}
    {overlay?.type === 'assessment' && <>
      {overlay.competency === 'S' && <SpotTheRiskChallenge result={save.shield.S} onSubmit={submitSpot} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'H' && <HoldBeforeActingChallenge result={save.shield.H} onSubmit={submitHold}
        onClose={() => setOverlay(overlay.parent ?? null)} onLaunchPractice={() => setOverlay({ type: 'freeze-frame', parent: overlay })} />}
      {overlay.competency === 'I' && <IdentifyTheInfluenceChallenge result={save.shield.I} onSubmit={submitInfluence}
        onClose={() => setOverlay(overlay.parent ?? null)} onLaunchPractice={() => setOverlay({ type: 'whisper-network', parent: overlay })} />}
      {overlay.competency === 'E' && <EvaluateConsequencesChallenge result={save.shield.E} onSubmit={submitConsequences} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'L' && <LeadTheRightChoiceChallenge result={save.shield.L} onSubmit={submitLead} onClose={() => setOverlay(overlay.parent ?? null)} />}
      {overlay.competency === 'D' && <DefendYourCommunityChallenge result={save.shield.D} onSubmit={submitDefend} onClose={() => setOverlay(overlay.parent ?? null)} />}
    </>}
    {overlay?.type === 'freeze-frame' && <FreezeFrameGame onClose={() => setOverlay(overlay.parent ?? null)} />}
    {overlay?.type === 'whisper-network' && <WhisperNetworkGame onClose={() => setOverlay(overlay.parent ?? null)} />}
    {overlay?.type === 'ff-inspect' && (
      <FreezeInspectionModal
        hotspotId={overlay.id}
        alreadyAdded={ffFacts.includes(overlay.id)}
        onAddFact={fact => setFfFacts(prev => Array.from(new Set([...prev, fact])))}
        onClose={() => { locked.current = false; setOverlay(null) }}
      />
    )}
    {overlay?.type === 'ff-dialogue' && (
      <FreezeDialogueModal
        speaker={overlay.speaker}
        askedQuestions={ffQuestions}
        onAskQuestion={q => setFfQuestions(prev => Array.from(new Set([...prev, q])))}
        onOpenDecision={() => setOverlay({ type: 'ff-decision' })}
        onClose={() => { locked.current = false; setOverlay(null) }}
      />
    )}
    {overlay?.type === 'ff-decision' && (
      <FreezeDecisionModal
        paused={true}
        inspectedHotspots={ffFacts}
        askedQuestions={ffQuestions}
        onReturnToHouse={() => travelHouse('HouseH')}
        onClose={() => { locked.current = false; setOverlay(null) }}
      />
    )}
    {overlay?.type === 'whisper-interview' && (
      <WhisperInterviewModal
        witnessId={overlay.witnessId}
        collectedPhrases={whisperPhrases}
        onCollectPhrase={p => setWhisperPhrases(prev => Array.from(new Set([...prev, p])))}
        onOpenBoard={() => setOverlay({ type: 'whisper-board' })}
        onClose={() => { locked.current = false; setOverlay(null) }}
      />
    )}
    {overlay?.type === 'whisper-terminal' && (
      <WhisperTerminalModal
        collectedPhrases={whisperPhrases}
        onCollectPhrase={p => setWhisperPhrases(prev => Array.from(new Set([...prev, p])))}
        onClose={() => { locked.current = false; setOverlay(null) }}
      />
    )}
    {overlay?.type === 'whisper-board' && (
      <WhisperBoardModal
        collectedPhrases={whisperPhrases}
        onClose={() => { locked.current = false; setOverlay(null) }}
      />
    )}
    {save.scene === 'FreezeFrame' && !overlay && (
      <div className="freeze-floating-hud">
        <button
          type="button"
          className="freeze-floating-btn action-btn"
          onClick={() => { locked.current = true; setOverlay({ type: 'ff-decision' }) }}
        >
          ⚡ Decide Response
        </button>
      </div>
    )}
    {overlay?.type === 'panel' && (overlay.panel === 'menu'
      ? <QuickMenu save={save} onClose={() => setOverlay(null)} onCheckpoint={saveCheckpoint} onReturn={returnToMenu}
        onReturnToNeighbourhood={() => travelHouse('Neighbourhood')}
        onOpen={panel => openPanel(panel, true)} />
      : overlay.panel === 'friends'
      ? <FriendsPanel onClose={() => setOverlay(overlay.fromMenu ? { type: 'panel', panel: 'menu' } : null)} />
      : <GamePanel panel={overlay.panel} save={save} onUpdate={update}
        onCollectGuardian={collectGuardian}
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
