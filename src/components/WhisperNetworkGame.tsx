import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CornerDownRight,
  FileQuestion,
  HelpCircle,
  Link2,
  MessageSquare,
  Network,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import {
  INFLUENCE_TACTICS,
  WHISPER_SCENARIOS,
  evaluateWhisperBoard,
  readStoredWhisperRecord,
  saveWhisperRecord,
  type QuotePhrase,
  type TacticId,
  type WhisperConnection,
  type WhisperNetworkResult,
  type WhisperScenario,
} from '../state/whisperNetwork'
import { AvatarSprite } from './AvatarSprite'
import { Button, Modal } from './ui'

interface WhisperNetworkGameProps {
  onClose: () => void
  onComplete?: (result: WhisperNetworkResult) => void
}

export function WhisperNetworkGame({ onClose, onComplete }: WhisperNetworkGameProps) {
  const [scenarioId, setScenarioId] = useState<'snack-dare' | 'fast-cash'>('snack-dare')
  const [selectedWitnessId, setSelectedWitnessId] = useState<string>('amir')
  const [activeTab, setActiveTab] = useState<'interviews' | 'board' | 'review'>('interviews')

  // Connection building state
  const [connections, setConnections] = useState<WhisperConnection[]>([])
  const [selectedTwistedSpeaker, setSelectedTwistedSpeaker] = useState<string>('')
  const [result, setResult] = useState<WhisperNetworkResult | null>(() => readStoredWhisperRecord('snack-dare'))

  const currentScenario: WhisperScenario = WHISPER_SCENARIOS[scenarioId]

  function switchScenario(id: 'snack-dare' | 'fast-cash') {
    setScenarioId(id)
    setSelectedWitnessId(id === 'snack-dare' ? 'amir' : 'jun')
    setConnections([])
    setSelectedTwistedSpeaker('')
    setResult(readStoredWhisperRecord(id))
    setActiveTab('interviews')
  }

  function addOrToggleQuoteToBoard(phrase: QuotePhrase, speakerId: string) {
    const existingIndex = connections.findIndex(c => c.phraseId === phrase.id)
    if (existingIndex >= 0) {
      // Toggle off
      setConnections(prev => prev.filter(c => c.phraseId !== phrase.id))
      return
    }

    // Default tactic to assign if manipulative
    const initialTactic: TacticId = phrase.associatedTactic ?? 'social-proof'
    const newConnection: WhisperConnection = {
      id: 'conn-' + Date.now() + '-' + phrase.id,
      phraseId: phrase.id,
      speakerId: speakerId,
      tacticId: initialTactic,
      targetId: phrase.targetId ?? 'player',
    }

    setConnections(prev => [...prev, newConnection])
    setActiveTab('board')
  }

  function updateConnectionTactic(connId: string, tacticId: TacticId) {
    setConnections(prev =>
      prev.map(c => (c.id === connId ? { ...c, tacticId } : c))
    )
  }

  function updateConnectionTarget(connId: string, targetId: string) {
    setConnections(prev =>
      prev.map(c => (c.id === connId ? { ...c, targetId } : c))
    )
  }

  function removeConnection(connId: string) {
    setConnections(prev => prev.filter(c => c.id !== connId))
  }

  function handleVerifyDeductions() {
    const evalResult = evaluateWhisperBoard({
      scenarioId,
      connections,
      selectedTwistedSpeakerId: selectedTwistedSpeaker,
    })

    setResult(evalResult)
    saveWhisperRecord(evalResult)
    setActiveTab('review')
    onComplete?.(evalResult)
  }

  function resetDeductionBoard() {
    setConnections([])
    setSelectedTwistedSpeaker('')
    setResult(null)
    setActiveTab('interviews')
  }

  // Find phrase object by ID
  function findPhrase(phraseId: string): QuotePhrase | undefined {
    for (const w of currentScenario.witnesses) {
      for (const t of w.transcript) {
        const found = t.phrases.find(p => p.id === phraseId)
        if (found) return found
      }
    }
    return undefined
  }

  const selectedWitness = currentScenario.witnesses.find(w => w.id === selectedWitnessId) ?? currentScenario.witnesses[0]

  return (
    <Modal
      title="I · Whisper Network"
      eyebrow="SHIELD PRACTICE · IDENTIFY THE INFLUENCE"
      className="whisper-modal wide"
      onClose={onClose}
    >
      <div className="whisper-container">
        {/* Scenario Header & Selector */}
        <div className="whisper-top-bar">
          <div className="whisper-scenario-picker">
            <span className="picker-label">Investigation Case:</span>
            <button
              type="button"
              className={`case-pill ${scenarioId === 'snack-dare' ? 'active' : ''}`}
              onClick={() => switchScenario('snack-dare')}
            >
              Case 1: Snack Dare (Minimart)
            </button>
            <button
              type="button"
              className={`case-pill ${scenarioId === 'fast-cash' ? 'active' : ''}`}
              onClick={() => switchScenario('fast-cash')}
            >
              Case 2: Fast-Cash Scheme
            </button>
          </div>

          <div className="whisper-tabs">
            <button
              type="button"
              className={`whisper-tab ${activeTab === 'interviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('interviews')}
            >
              <Users size={15} /> Witness Interviews
            </button>
            <button
              type="button"
              className={`whisper-tab ${activeTab === 'board' ? 'active' : ''}`}
              onClick={() => setActiveTab('board')}
            >
              <Network size={15} /> Influence Board ({connections.length})
            </button>
            {result && (
              <button
                type="button"
                className={`whisper-tab ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => setActiveTab('review')}
              >
                <ShieldCheck size={15} /> Case Report ({result.score}/100)
              </button>
            )}
          </div>
        </div>

        {/* Case Brief Banner */}
        <div className="whisper-brief-card">
          <div className="brief-content">
            <h3>{currentScenario.title}</h3>
            <p className="brief-incident">{currentScenario.incidentSummary}</p>
            <span className="brief-goal">
              <strong>Objective:</strong> {currentScenario.learningGoal}
            </span>
          </div>
        </div>

        {/* TAB 1: Witness Interviews */}
        {activeTab === 'interviews' && (
          <div className="whisper-interviews-view">
            {/* Witness Sidebar */}
            <div className="witness-roster">
              <span className="roster-title">Estate Witnesses</span>
              {currentScenario.witnesses.map(w => {
                const isSelected = w.id === selectedWitnessId
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`witness-card-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedWitnessId(w.id)}
                  >
                    <div className="witness-avatar-box">
                      <AvatarSprite avatar={w.avatar} />
                    </div>
                    <div className="witness-info">
                      <strong>{w.name}</strong>
                      <small>{w.title} · {w.location}</small>
                    </div>
                    <ChevronRight size={16} className="witness-chevron" />
                  </button>
                )
              })}
            </div>

            {/* Transcript Area */}
            <div className="witness-transcript-pane">
              <div className="transcript-header">
                <div className="transcript-speaker-meta">
                  <h3>{selectedWitness.name} ({selectedWitness.title})</h3>
                  <p>{selectedWitness.background}</p>
                </div>
                <div className="transcript-instructions">
                  <Sparkles size={14} className="text-gold" />
                  <span>Click highlighted dialogue chips to pin them to the Influence Board!</span>
                </div>
              </div>

              <div className="transcript-dialogue-list">
                {selectedWitness.transcript.map((line, idx) => (
                  <div key={idx} className="transcript-entry">
                    <span className="speaker-tag">{line.speaker}:</span>
                    <div className="dialogue-line-content">
                      <p className="raw-text">{line.line}</p>

                      {/* Interactive Extractable Phrases */}
                      {line.phrases.length > 0 && (
                        <div className="phrase-chips-bank">
                          {line.phrases.map(phrase => {
                            const isPinned = connections.some(c => c.phraseId === phrase.id)
                            return (
                              <div
                                key={phrase.id}
                                className={`phrase-chip-card ${phrase.isManipulative ? 'manipulative' : 'factual'} ${isPinned ? 'pinned' : ''}`}
                              >
                                <div className="chip-header">
                                  <span className={`chip-badge ${phrase.isManipulative ? 'tag-danger' : 'tag-neutral'}`}>
                                    {phrase.isManipulative ? '⚠️ Manipulative Tactic' : 'ℹ️ Factual Truth'}
                                  </span>
                                  {phrase.associatedTactic && (
                                    <span className="tactic-hint">
                                      {INFLUENCE_TACTICS[phrase.associatedTactic].icon} {INFLUENCE_TACTICS[phrase.associatedTactic].name}
                                    </span>
                                  )}
                                </div>

                                <blockquote className="chip-quote">{phrase.text}</blockquote>
                                <p className="chip-explanation">{phrase.explanation}</p>

                                <button
                                  type="button"
                                  className={`button ${isPinned ? 'secondary' : 'primary'} chip-action-btn`}
                                  onClick={() => addOrToggleQuoteToBoard(phrase, selectedWitness.id)}
                                >
                                  {isPinned ? <><Check size={14} /> Pinned to Board</> : <><Link2 size={14} /> Pin to Influence Board</>}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Influence Board */}
        {activeTab === 'board' && (
          <div className="whisper-board-view">
            <div className="board-header-bar">
              <div>
                <h3>Interactive Deduction Board</h3>
                <p>
                  Map out the statements you extracted. Tag each manipulative phrase with its true psychological tactic
                  and identify the rumour’s innocent origin.
                </p>
              </div>

              <div className="board-quick-actions">
                <Button className="secondary" onClick={() => setActiveTab('interviews')}>
                  <Users size={15} /> Find More Quotes
                </Button>
                <Button
                  className="primary"
                  disabled={connections.length === 0}
                  onClick={handleVerifyDeductions}
                >
                  <ShieldCheck size={16} /> Verify Influence Network
                </Button>
              </div>
            </div>

            {/* Empty State */}
            {connections.length === 0 ? (
              <div className="board-empty-state">
                <Network size={48} className="empty-icon" />
                <h4>No statements pinned to the board yet!</h4>
                <p>Go to Witness Interviews, read what each character said, and click "Pin to Influence Board".</p>
                <Button className="primary" onClick={() => setActiveTab('interviews')}>
                  <Users size={16} /> Go to Witness Interviews
                </Button>
              </div>
            ) : (
              <div className="board-active-grid">
                {/* Connections List / Node Mapper */}
                <div className="connections-column">
                  <h4>Mapped Influence Chains ({connections.length})</h4>
                  <div className="connections-list">
                    {connections.map((conn, idx) => {
                      const phrase = findPhrase(conn.phraseId)
                      const speaker = currentScenario.witnesses.find(w => w.id === conn.speakerId)
                      if (!phrase) return null

                      return (
                        <div key={conn.id} className="connection-node-card">
                          <div className="node-top">
                            <span className="node-number">#{idx + 1}</span>
                            <span className="node-speaker">
                              Source: <strong>{speaker?.name ?? conn.speakerId}</strong>
                            </span>
                            <button
                              type="button"
                              className="node-remove-btn"
                              title="Remove connection"
                              onClick={() => removeConnection(conn.id)}
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <blockquote className="node-quote">{phrase.text}</blockquote>

                          <div className="node-mapping-row">
                            <div className="mapping-field">
                              <label>Assigned Influence Tactic:</label>
                              <select
                                value={conn.tacticId}
                                onChange={e => updateConnectionTactic(conn.id, e.target.value as TacticId)}
                              >
                                {(Object.keys(INFLUENCE_TACTICS) as TacticId[]).map(tId => (
                                  <option key={tId} value={tId}>
                                    {INFLUENCE_TACTICS[tId].icon} {INFLUENCE_TACTICS[tId].name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="mapping-field">
                              <label>Target of Pressure:</label>
                              <select
                                value={conn.targetId}
                                onChange={e => updateConnectionTarget(conn.id, e.target.value)}
                              >
                                <option value="player">You (Player)</option>
                                <option value="jun">Jun</option>
                                <option value="amir">Amir</option>
                                <option value="crowd">Estate Crowd / Students</option>
                              </select>
                            </div>
                          </div>

                          <div className="node-tactic-def">
                            <small>
                              <strong>Tactic Insight:</strong> {INFLUENCE_TACTICS[conn.tacticId].description}
                            </small>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Rumour Origin & Distortion Investigator */}
                <div className="distortion-column">
                  <h4>Pinpoint the Rumour Origin</h4>
                  <div className="distortion-card">
                    <p className="distortion-question">
                      A critical part of identifying influence is tracing where a rumour started.
                      <strong> Which witness made an innocent, factual remark that was twisted into an excuse for peer pressure?</strong>
                    </p>

                    <div className="distortion-options">
                      {currentScenario.witnesses.map(w => {
                        const isChosen = selectedTwistedSpeaker === w.id
                        return (
                          <label key={w.id} className={`distortion-label ${isChosen ? 'chosen' : ''}`}>
                            <input
                              type="radio"
                              name="twisted-origin"
                              value={w.id}
                              checked={isChosen}
                              onChange={() => setSelectedTwistedSpeaker(w.id)}
                            />
                            <span>
                              <strong>{w.name}</strong> ({w.title})
                            </span>
                          </label>
                        )
                      })}
                    </div>

                    <div className="distortion-hint-box">
                      <HelpCircle size={15} />
                      <small>Hint: Look for the witness who gave a completely normal explanation (like traffic or police advisories) before others twisted it.</small>
                    </div>
                  </div>

                  {/* Tactics Cheat Sheet */}
                  <div className="tactics-reference-card">
                    <h4>Tactics Quick Reference</h4>
                    <ul className="tactics-mini-list">
                      {(Object.keys(INFLUENCE_TACTICS) as TacticId[]).map(tId => {
                        const t = INFLUENCE_TACTICS[tId]
                        return (
                          <li key={tId}>
                            <span>{t.icon} <strong>{t.name}:</strong></span> {t.shortDef}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Case Review & Result */}
        {activeTab === 'review' && result && (
          <div className="whisper-review-view">
            <div className={`whisper-score-banner ${result.passed ? 'passed' : 'failed'}`}>
              <div className="score-badge-col">
                {result.passed ? <ShieldCheck size={52} className="success" /> : <ShieldAlert size={52} className="warning" />}
                <span className="score-number">{result.score}/100</span>
                <span className="rank-title">{result.detectiveRank}</span>
              </div>
              <div className="score-details-col">
                <h2>{result.passed ? 'Influence Network Fully Unmasked!' : 'Investigation Incomplete: Further Deduction Needed'}</h2>
                <p>
                  You identified <strong>{result.correctConnectionsCount} of {result.totalTargetConnections}</strong> critical
                  influence tactics correctly.
                </p>
                {result.identifiedTwistedFact ? (
                  <p className="distortion-success">
                    ✅ <strong>Rumour Origin Spotted:</strong> You successfully discovered how innocent facts were weaponized by peer groups!
                  </p>
                ) : (
                  <p className="distortion-fail">
                    ⚠️ <strong>Rumour Origin Missed:</strong> Look closely at who told an ordinary truth before the group chats changed the narrative.
                  </p>
                )}
              </div>
            </div>

            <div className="feedback-breakdown-card">
              <h3>Deduction Breakdown</h3>
              <ul className="feedback-items-list">
                {result.feedbackMessages.map((msg, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className="text-teal" /> {msg}
                  </li>
                ))}
              </ul>
            </div>

            <div className="whisper-actions-footer">
              <Button className="secondary" onClick={resetDeductionBoard}>
                <RotateCcw size={16} /> Replay This Case
              </Button>
              <Button
                className="secondary"
                onClick={() => switchScenario(scenarioId === 'snack-dare' ? 'fast-cash' : 'snack-dare')}
              >
                <ArrowRight size={16} /> Play {scenarioId === 'snack-dare' ? 'Case 2' : 'Case 1'}
              </Button>
              <Button className="primary" onClick={onClose}>
                <Shield size={16} /> Finish & Return to Estate
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
