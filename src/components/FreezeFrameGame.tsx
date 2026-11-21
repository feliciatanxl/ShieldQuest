import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  Maximize2,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import {
  CLARIFICATION_QUESTIONS,
  FREEZE_DECISIONS,
  FREEZE_FRAME_STAGES,
  FREEZE_HOTSPOTS,
  calculateFreezeScore,
  readStoredFreezeFrameRecord,
  saveFreezeFrameRecord,
  type FreezeDecisionId,
  type FreezeFrameResult,
  type FreezeHotspot,
  type FreezeHotspotId,
  type TimelineStage,
} from '../state/freezeFrame'
import { residents } from '../game/residentData'
import { AvatarSprite } from './AvatarSprite'
import { Button, Modal } from './ui'

interface FreezeFrameGameProps {
  onClose: () => void
  onComplete?: (result: FreezeFrameResult) => void
}

export function FreezeFrameGame({ onClose, onComplete }: FreezeFrameGameProps) {
  // Scenario playback state
  const [stageIndex, setStageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 0.5>(1)
  const [hasEverPaused, setHasEverPaused] = useState(false)
  const stagesVisited = useRef<Set<number>>(new Set([1]))

  // Investigation state
  const [inspectedHotspots, setInspectedHotspots] = useState<FreezeHotspotId[]>([])
  const [activeMagnifier, setActiveMagnifier] = useState<FreezeHotspot | null>(null)
  const [askedQuestions, setAskedQuestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'scene' | 'inquiry' | 'ledger'>('scene')

  // Decision & completion state
  const [decisionMode, setDecisionMode] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<FreezeDecisionId | null>(null)
  const [result, setResult] = useState<FreezeFrameResult | null>(readStoredFreezeFrameRecord)

  const currentStage: TimelineStage = FREEZE_FRAME_STAGES[stageIndex]

  // Record visited stages
  useEffect(() => {
    stagesVisited.current.add(currentStage.id)
  }, [currentStage.id])

  // Scenario auto-advance timer when playing
  useEffect(() => {
    if (!isPlaying || decisionMode || result) return

    const duration = (playbackSpeed === 0.5 ? 4000 : 2500)
    const timer = setTimeout(() => {
      setStageIndex(prev => {
        if (prev < FREEZE_FRAME_STAGES.length - 1) {
          return prev + 1
        } else {
          setIsPlaying(false)
          return prev
        }
      })
    }, duration)

    return () => clearTimeout(timer)
  }, [isPlaying, stageIndex, playbackSpeed, decisionMode, result])

  // Keyboard shortcuts (Space = Play/Pause, Left/Right = Scrub)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (decisionMode || result) return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlayPause()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        stepForward()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        stepBackward()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, decisionMode, result])

  function togglePlayPause() {
    if (isPlaying) {
      setIsPlaying(false)
      setHasEverPaused(true)
    } else {
      setIsPlaying(true)
    }
  }

  function stepForward() {
    setIsPlaying(false)
    setHasEverPaused(true)
    setStageIndex(prev => Math.min(FREEZE_FRAME_STAGES.length - 1, prev + 1))
  }

  function stepBackward() {
    setIsPlaying(false)
    setHasEverPaused(true)
    setStageIndex(prev => Math.max(0, prev - 1))
  }

  function scrubToStage(index: number) {
    setIsPlaying(false)
    setHasEverPaused(true)
    setStageIndex(index)
  }

  function inspectHotspot(hotspot: FreezeHotspot) {
    setIsPlaying(false)
    setHasEverPaused(true)
    setActiveMagnifier(hotspot)
    if (!inspectedHotspots.includes(hotspot.id)) {
      setInspectedHotspots(prev => [...prev, hotspot.id])
    }
  }

  function askQuestion(qId: string) {
    if (!askedQuestions.includes(qId)) {
      setAskedQuestions(prev => [...prev, qId])
    }
  }

  function handleDecisionSubmit() {
    if (!selectedDecision) return
    const calculated = calculateFreezeScore({
      paused: hasEverPaused,
      timelinePositionsChecked: Array.from(stagesVisited.current),
      inspectedHotspots,
      askedQuestionIds: askedQuestions,
      decision: selectedDecision,
    })

    setResult(calculated)
    saveFreezeFrameRecord(calculated)
    setDecisionMode(false)
    onComplete?.(calculated)
  }

  function resetScenario() {
    setStageIndex(0)
    setIsPlaying(false)
    setHasEverPaused(false)
    stagesVisited.current = new Set([1])
    setInspectedHotspots([])
    setActiveMagnifier(null)
    setAskedQuestions([])
    setActiveTab('scene')
    setDecisionMode(false)
    setSelectedDecision(null)
    setResult(null)
  }

  const criticalInspectedCount = inspectedHotspots.filter(
    id => FREEZE_HOTSPOTS[id]?.criticalForVerification
  ).length
  const isVerificationReady = hasEverPaused && criticalInspectedCount >= 2 && askedQuestions.length >= 1

  return (
    <Modal
      title="H · Freeze Frame"
      eyebrow="SHIELD PRACTICE · HOLD BEFORE ACTING"
      className="freeze-frame-modal wide"
      onClose={onClose}
    >
      <div className="freeze-container">
        {/* Scenario Header Bar */}
        <div className="freeze-top-bar">
          <div className="freeze-meta">
            <span className={`freeze-status-badge ${isPlaying ? 'playing' : 'paused'}`}>
              {isPlaying ? <><Play size={12} fill="currentColor" /> LIVE ACTION</> : <><Pause size={12} fill="currentColor" /> SCENARIO PAUSED</>}
            </span>
            <span className="freeze-stage-title">{currentStage.title}</span>
            <span className="freeze-time-badge">{currentStage.timeDisplay} / 0:18</span>
          </div>

          <div className="freeze-tabs-nav">
            <button
              type="button"
              className={`freeze-nav-tab ${activeTab === 'scene' ? 'active' : ''}`}
              onClick={() => setActiveTab('scene')}
            >
              <Eye size={15} /> Store Scene
            </button>
            <button
              type="button"
              className={`freeze-nav-tab ${activeTab === 'inquiry' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiry')}
            >
              <MessageSquare size={15} /> Question Witnesses ({askedQuestions.length}/3)
            </button>
            <button
              type="button"
              className={`freeze-nav-tab ${activeTab === 'ledger' ? 'active' : ''}`}
              onClick={() => setActiveTab('ledger')}
            >
              <ShieldCheck size={15} /> Evidence Ledger ({inspectedHotspots.length})
            </button>
          </div>
        </div>

        {/* Result Review View */}
        {result ? (
          <div className="freeze-result-view">
            <div className={`freeze-result-banner ${result.passed ? 'passed' : 'failed'}`}>
              <div className="freeze-result-badge-col">
                {result.passed ? <ShieldCheck size={48} className="result-icon success" /> : <ShieldAlert size={48} className="result-icon warning" />}
                <span className="result-score-tag">{result.score}/100 PTS</span>
              </div>
              <div className="freeze-result-text">
                <h2>{result.passed ? 'Challenge Mastered: Hold Instincts Verified!' : 'Practice Debrief: Lessons on Holding'}</h2>
                <p className="result-main-quote">
                  Chosen response: <strong>“{FREEZE_DECISIONS[result.decision].quote}”</strong>
                </p>
                <p className="result-feedback-body">{FREEZE_DECISIONS[result.decision].feedback}</p>
              </div>
            </div>

            <div className="freeze-ratings-grid">
              <div className="freeze-stat-card">
                <span className="stat-label">Patience & Hold Instinct</span>
                <strong className={`stat-val ${result.paused ? 'good' : 'bad'}`}>
                  {result.paused ? 'Verified (Paused Situation)' : 'Rushed (Zero Pause)'}
                </strong>
                <small>{result.patienceRating} patience rating across timeline</small>
              </div>

              <div className="freeze-stat-card">
                <span className="stat-label">Environmental Inspection</span>
                <strong className={`stat-val ${result.inspectedHotspots.length >= 3 ? 'good' : 'fair'}`}>
                  {result.inspectedHotspots.length} / 5 Clues Verified
                </strong>
                <small>{result.evidenceRating} physical evidence investigation</small>
              </div>

              <div className="freeze-stat-card">
                <span className="stat-label">Clarification Inquiries</span>
                <strong className={`stat-val ${result.askedQuestionIds.length >= 2 ? 'good' : 'fair'}`}>
                  {result.askedQuestionIds.length} / 3 Inquiries Completed
                </strong>
                <small>Questioned Jun and Cashier before commitment</small>
              </div>
            </div>

            <div className="freeze-summary-notes">
              <h3>Investigation Notes & Observations</h3>
              <ul>
                {result.summaryNotes.map((note, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} /> {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="freeze-result-actions">
              <Button className="secondary" onClick={resetScenario}>
                <RotateCcw size={16} /> Replay & Explore Alternatives
              </Button>
              <Button className="primary" onClick={onClose}>
                <Shield size={16} /> Finish & Return to Estate
              </Button>
            </div>
          </div>
        ) : decisionMode ? (
          /* Decision Selection Screen */
          <div className="freeze-decision-view">
            <div className="freeze-decision-header">
              <button type="button" className="text-button" onClick={() => setDecisionMode(false)}>
                <ArrowLeft size={16} /> Back to Investigation
              </button>
              <h2>Make Your Final Decision</h2>
              <p>
                Jun is standing in front of you pressuring for an immediate commitment.
                Based on your verification and observations, what do you say and do?
              </p>
            </div>

            <div className="freeze-decisions-list" role="radiogroup" aria-label="Action choices">
              {(Object.keys(FREEZE_DECISIONS) as FreezeDecisionId[]).map(decId => {
                const dec = FREEZE_DECISIONS[decId]
                const isSelected = selectedDecision === decId
                return (
                  <button
                    key={decId}
                    type="button"
                    className={`freeze-decision-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDecision(decId)}
                  >
                    <div className="freeze-decision-badge">
                      <span className={`rating-pill ${dec.rating}`}>{dec.title}</span>
                    </div>
                    <blockquote className="freeze-decision-quote">{dec.quote}</blockquote>
                    <p className="freeze-decision-desc">{dec.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="freeze-decision-actions">
              <Button className="secondary" onClick={() => setDecisionMode(false)}>
                Cancel
              </Button>
              <Button
                className="primary"
                disabled={!selectedDecision}
                onClick={handleDecisionSubmit}
              >
                <ShieldCheck size={16} /> Commit Decision & View Outcome
              </Button>
            </div>
          </div>
        ) : (
          /* Main Interactive Investigation Area */
          <>
            {activeTab === 'scene' && (
              <div className="freeze-scene-view">
                {/* Visual Minimart Diorama Screen */}
                <div className="freeze-diorama-stage">
                  {/* Background Minimart Aisle Art */}
                  <div className="diorama-background">
                    <div className="diorama-shelf shelf-left">
                      <span className="shelf-label">AISLE 1 · BEVERAGES</span>
                      <div className="shelf-items-row" />
                    </div>
                    <div className="diorama-shelf shelf-center">
                      <span className="shelf-label">AISLE 3 · ELECTRONICS & POWER BANKS</span>
                      <div className="shelf-items-row electronics" />
                    </div>
                    <div className="diorama-counter">
                      <span className="counter-sign">CASHIER</span>
                      <div className="cashier-sprite-box">
                        <AvatarSprite avatar={residents.cashier} facing="front" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Characters & Hotspots */}
                  <div className="diorama-entities">
                    {/* Jun Character Sprite */}
                    <div className={`diorama-jun stage-${currentStage.id}`}>
                      <div className="jun-speech-bubble" role="dialog">
                        {currentStage.junDialogue}
                      </div>
                      <AvatarSprite avatar={residents.jun} facing={currentStage.id <= 2 ? 'front' : 'left'} />
                    </div>

                    {/* Interactive Hotspot Buttons */}
                    {currentStage.activeHotspotIds.map(hId => {
                      const hotspot = FREEZE_HOTSPOTS[hId]
                      const isInspected = inspectedHotspots.includes(hId)
                      return (
                        <button
                          key={hId}
                          type="button"
                          className={`diorama-hotspot-pin hotspot-${hId} ${isInspected ? 'inspected' : 'uninspected'}`}
                          title={`Inspect ${hotspot.label}`}
                          onClick={() => inspectHotspot(hotspot)}
                        >
                          <Search size={14} />
                          <span className="hotspot-pin-label">{hotspot.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Stage Narrative Banner */}
                  <div className="diorama-narrative-bar">
                    <p><strong>Situation:</strong> {currentStage.summary}</p>
                    <p className="diorama-hint">
                      {isPlaying ? '💡 Click Pause (or press Space) to freeze the scene and examine physical clues.' : '🔍 Hover and click glowing pins to inspect physical evidence.'}
                    </p>
                  </div>
                </div>

                {/* Timeline Controller Panel */}
                <div className="freeze-timeline-controller">
                  <div className="freeze-playback-buttons">
                    <button
                      type="button"
                      className="timeline-btn"
                      onClick={stepBackward}
                      disabled={stageIndex === 0}
                      title="Step Backward (Left Arrow)"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      className={`timeline-play-pause ${isPlaying ? 'pause-mode' : 'play-mode'}`}
                      onClick={togglePlayPause}
                      title={isPlaying ? 'Pause Scenario (Space)' : 'Play Scenario (Space)'}
                    >
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                      <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                    </button>

                    <button
                      type="button"
                      className="timeline-btn"
                      onClick={stepForward}
                      disabled={stageIndex === FREEZE_FRAME_STAGES.length - 1}
                      title="Step Forward (Right Arrow)"
                    >
                      <ChevronRight size={18} />
                    </button>

                    <button
                      type="button"
                      className={`speed-toggle-btn ${playbackSpeed === 0.5 ? 'slow' : ''}`}
                      onClick={() => setPlaybackSpeed(s => (s === 1 ? 0.5 : 1))}
                      title="Toggle Speed"
                    >
                      {playbackSpeed}x Speed
                    </button>
                  </div>

                  {/* Scrubber Track with Stage Markers */}
                  <div className="freeze-scrubber-track">
                    <div
                      className="scrubber-progress-fill"
                      style={{ width: `${(stageIndex / (FREEZE_FRAME_STAGES.length - 1)) * 100}%` }}
                    />
                    {FREEZE_FRAME_STAGES.map((stg, idx) => (
                      <button
                        key={stg.id}
                        type="button"
                        className={`scrubber-node ${stageIndex === idx ? 'active' : ''} ${idx < stageIndex ? 'passed' : ''}`}
                        style={{ left: `${(idx / (FREEZE_FRAME_STAGES.length - 1)) * 100}%` }}
                        onClick={() => scrubToStage(idx)}
                        title={`Jump to ${stg.title}`}
                      >
                        <span className="node-pip" />
                        <span className="node-time">{stg.timeDisplay}</span>
                      </button>
                    ))}
                  </div>

                  {/* Decision Action CTA */}
                  <div className="freeze-action-cta">
                    <Button
                      className={`primary ${isVerificationReady ? 'ready-pulse' : ''}`}
                      onClick={() => setDecisionMode(true)}
                    >
                      <ShieldCheck size={16} /> Make Decision Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inquiry' && (
              <div className="freeze-inquiry-view">
                <div className="inquiry-intro">
                  <h3>Clarifying Questions & Interrogations</h3>
                  <p>
                    Holding before acting means testing assumptions. Select questions to pose to Jun or Mr. Tan to uncover their real motives.
                  </p>
                </div>

                <div className="inquiry-cards-list">
                  {CLARIFICATION_QUESTIONS.map(q => {
                    const isAsked = askedQuestions.includes(q.id)
                    return (
                      <div key={q.id} className={`inquiry-card ${isAsked ? 'revealed' : 'unasked'}`}>
                        <div className="inquiry-header">
                          <span className={`target-badge ${q.target}`}>
                            {q.target === 'jun' ? 'Target: Jun' : 'Target: Cashier Mr. Tan'}
                          </span>
                          <button
                            type="button"
                            className="button secondary inquiry-ask-btn"
                            disabled={isAsked}
                            onClick={() => askQuestion(q.id)}
                          >
                            {isAsked ? 'Inquired' : 'Ask Question'}
                          </button>
                        </div>
                        <h4 className="inquiry-prompt">{q.prompt}</h4>
                        {isAsked ? (
                          <div className="inquiry-response-box">
                            <blockquote className="inquiry-answer">{q.answer}</blockquote>
                            <p className="inquiry-insight">
                              <strong>Detective Insight:</strong> {q.insight}
                            </p>
                          </div>
                        ) : (
                          <p className="inquiry-hidden-hint">Click “Ask Question” to hear their reaction.</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="freeze-ledger-view">
                <div className="ledger-header">
                  <h3>Evidence & Fact Ledger</h3>
                  <span className={`verification-badge ${isVerificationReady ? 'ready' : 'incomplete'}`}>
                    {isVerificationReady ? 'Status: Sufficient Evidence to Act' : 'Status: Incomplete Investigation'}
                  </span>
                </div>

                <div className="ledger-grid">
                  <div className="ledger-column">
                    <h4>Verified Facts Gathered ({inspectedHotspots.length}/6)</h4>
                    {inspectedHotspots.length === 0 ? (
                      <p className="ledger-empty">No environmental evidence inspected yet. Pause the scene and click pins.</p>
                    ) : (
                      <ul className="ledger-fact-list">
                        {inspectedHotspots.map(id => {
                          const h = FREEZE_HOTSPOTS[id]
                          return (
                            <li key={id} className="ledger-fact-item">
                              <CheckCircle2 size={16} className="text-teal" />
                              <div>
                                <strong>{h.label}:</strong> {h.verifiedFact}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="ledger-column">
                    <h4>Pressure Tactics Identified</h4>
                    <ul className="ledger-tactics-list">
                      <li className="tactic-item">
                        <strong>Artificial Urgency:</strong> Jun claims there are only two minutes and demands an instant answer to prevent careful thinking.
                      </li>
                      <li className="tactic-item">
                        <strong>Loyalty / Friendship Hook:</strong> Jun says “We’re friends right?” to guilt-trip you into agreeing.
                      </li>
                      <li className="tactic-item">
                        <strong>Diffusion of Responsibility:</strong> Jun asks you to watch the door so that both of you share the risk.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="ledger-footer-action">
                  <Button className="primary" onClick={() => setDecisionMode(true)}>
                    <ShieldCheck size={16} /> Proceed to Decision
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Magnifier Clue Detail Modal */}
        {activeMagnifier && (
          <div className="freeze-magnifier-overlay" onClick={() => setActiveMagnifier(null)}>
            <div className="freeze-magnifier-card" onClick={e => e.stopPropagation()}>
              <div className="magnifier-top">
                <div className="magnifier-title-row">
                  <Search size={18} />
                  <h3>{activeMagnifier.magnifierTitle}</h3>
                </div>
                <button
                  type="button"
                  className="close-magnifier"
                  onClick={() => setActiveMagnifier(null)}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="magnifier-body">
                <p className="magnifier-visual">
                  <strong>Visual Clue:</strong> {activeMagnifier.visualDescription}
                </p>
                <div className="magnifier-fact-box">
                  <span className="fact-title">Verified Fact:</span>
                  <p>{activeMagnifier.verifiedFact}</p>
                </div>
              </div>

              <div className="magnifier-actions">
                <Button className="primary" onClick={() => setActiveMagnifier(null)}>
                  <CheckCircle2 size={16} /> Log Fact in Ledger
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
