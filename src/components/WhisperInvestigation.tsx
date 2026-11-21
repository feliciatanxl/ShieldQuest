import { useState } from 'react'
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  HelpCircle,
  MessageSquare,
  Network,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import {
  INFLUENCE_TACTICS,
  WHISPER_SCENARIOS,
  evaluateWhisperBoard,
  saveWhisperRecord,
  type TacticId,
  type WhisperConnection,
  type WhisperNetworkResult,
} from '../state/whisperNetwork'
import { residents } from '../game/residentData'
import { sound } from '../game/audio'
import { AvatarSprite } from './AvatarSprite'
import { Button, Modal } from './ui'

interface WhisperInterviewModalProps {
  witnessId: 'amir' | 'may' | 'jun'
  collectedPhrases: string[]
  onCollectPhrase: (phraseId: string) => void
  onOpenBoard: () => void
  onClose: () => void
}

export function WhisperInterviewModal({
  witnessId,
  collectedPhrases,
  onCollectPhrase,
  onOpenBoard,
  onClose,
}: WhisperInterviewModalProps) {
  const scenario = WHISPER_SCENARIOS['snack-dare']
  const witness = scenario.witnesses.find(w => w.id === witnessId)
  const resident = residents[witnessId === 'may' ? 'may' : witnessId === 'jun' ? 'jun' : 'amir']

  if (!witness) return null

  return (
    <Modal title={`Witness Interview · ${witness.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ width: 44, height: 44, overflow: 'hidden' }}>
            <AvatarSprite avatar={resident} facing="front" />
          </div>
          <div>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{witness.name} · {witness.title}</strong>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{witness.background}</p>
          </div>
        </div>

        <div>
          <strong style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>
            Interview Testimony & Statements:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {witness.transcript.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: 1.5, color: '#1e293b' }}>
                  “{item.line}”
                </p>

                {item.phrases.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {item.phrases.map(phrase => {
                      const isCollected = collectedPhrases.includes(phrase.id)
                      return (
                        <div
                          key={phrase.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 10px',
                            background: isCollected ? '#ecfdf5' : '#f8fafc',
                            border: `1px dashed ${isCollected ? '#10b981' : '#cbd5e1'}`,
                            borderRadius: '6px',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#334155', flex: 1, marginRight: '10px' }}>
                            {phrase.text}
                          </span>
                          <Button
                            className={isCollected ? 'secondary' : 'primary'}
                            onClick={() => onCollectPhrase(phrase.id)}
                            style={{ fontSize: '12px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                          >
                            {isCollected ? '✓ In Journal' : '📌 Collect Quote'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Collected: <strong>{collectedPhrases.length}</strong> statements
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button className="secondary" onClick={onClose}>Done</Button>
            <Button className="primary" onClick={() => { onClose(); onOpenBoard() }}>
              Open Influence Board →
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

interface WhisperTerminalModalProps {
  collectedPhrases: string[]
  onCollectPhrase: (phraseId: string) => void
  onClose: () => void
}

export function WhisperTerminalModal({
  collectedPhrases,
  onCollectPhrase,
  onClose,
}: WhisperTerminalModalProps) {
  const forwardedMessages = [
    {
      id: 'sd-phrase-1',
      sender: 'Forwarded from Block 12 Senior',
      text: '“The seniors said the back camera is down, prove you’re not a coward by grabbing the spicy chips.”',
    },
    {
      id: 'sd-phrase-3',
      sender: 'Telegram Channel · Sunshine Chat',
      text: '“Everyone is doing it! A whole group already grabbed their packs without getting caught!”',
    },
    {
      id: 'sd-phrase-4',
      sender: 'Direct Message to Jun',
      text: '“If you’re really my bro, you’ll back me up on this. Don’t snake me now.”',
    },
  ]

  return (
    <Modal title="Chat Log Archive & Audio Terminal" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
          Review forwarded chat screenshots and messages extracted from the neighbourhood student channels.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {forwardedMessages.map(msg => {
            const isCollected = collectedPhrases.includes(msg.id)
            return (
              <div
                key={msg.id}
                style={{
                  padding: '12px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                  📱 {msg.sender}
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontStyle: 'italic', color: '#1e293b' }}>
                  {msg.text}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    className={isCollected ? 'secondary' : 'primary'}
                    onClick={() => onCollectPhrase(msg.id)}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {isCollected ? '✓ In Journal' : '📌 Collect to Evidence Journal'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <Button className="primary" onClick={onClose}>Close Terminal</Button>
        </div>
      </div>
    </Modal>
  )
}

interface WhisperBoardModalProps {
  collectedPhrases: string[]
  onClose: () => void
  onCaseSolved?: () => void
}

interface RumourStep {
  id: string
  speaker: string
  text: string
  isCorrectOrder: number // 1 to 5
}

const DEFAULT_RUMOUR_STEPS: RumourStep[] = [
  { id: 'step-1', speaker: 'Mr. Tan (Minimart Cashier)', text: '“Delivery truck arrived late today; the new stock isn’t checked in yet.”', isCorrectOrder: 1 },
  { id: 'step-2', speaker: 'Auntie May (Kopi Regular)', text: '“The minimart inventory system is completely broken and down today!”', isCorrectOrder: 2 },
  { id: 'step-3', speaker: 'Amir (Classmate)', text: '“System crashed, they don’t even know what items are in the store!”', isCorrectOrder: 3 },
  { id: 'step-4', speaker: 'GhostRider_99 (Chat Influencer)', text: '“Bet no one has the guts to grab the snacks right now!”', isCorrectOrder: 4 },
  { id: 'step-5', speaker: 'Jun (Targeted Student)', text: '“They dared me to do it... said I was chicken if I refused.”', isCorrectOrder: 5 },
]

export function WhisperBoardModal({ collectedPhrases, onClose, onCaseSolved }: WhisperBoardModalProps) {
  const [selectedCase, setSelectedCase] = useState<'snack-dare' | 'fast-cash'>('snack-dare')
  const scenario = WHISPER_SCENARIOS[selectedCase]
  const [connections, setConnections] = useState<WhisperConnection[]>([])
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string>('senior')
  const [selectedTactic, setSelectedTactic] = useState<TacticId | null>(null)
  const [result, setResult] = useState<WhisperNetworkResult | null>(null)
  const [identifiedTruth, setIdentifiedTruth] = useState(false)
  const [rumourOrder, setRumourOrder] = useState<RumourStep[]>([
    DEFAULT_RUMOUR_STEPS[2],
    DEFAULT_RUMOUR_STEPS[0],
    DEFAULT_RUMOUR_STEPS[4],
    DEFAULT_RUMOUR_STEPS[1],
    DEFAULT_RUMOUR_STEPS[3],
  ])

  // Find phrases
  const allPhrases = scenario.witnesses.flatMap(w => w.transcript.flatMap(t => t.phrases))
  const availablePhrases = allPhrases.filter(p => collectedPhrases.includes(p.id) || p.isManipulative)

  function addConnection() {
    if (!selectedPhrase || !selectedTactic) return
    sound.playStringConnected()
    const newConn: WhisperConnection = {
      id: `conn-${Date.now()}`,
      phraseId: selectedPhrase,
      speakerId: selectedTarget,
      tacticId: selectedTactic,
      targetId: selectedTarget === 'senior' ? 'jun' : 'amir',
    }
    setConnections(prev => [...prev.filter(c => c.phraseId !== selectedPhrase), newConn])
    setSelectedPhrase(null)
    setSelectedTactic(null)
  }

  function removeConnection(connId: string) {
    sound.playBlip()
    setConnections(prev => prev.filter(c => c.id !== connId))
  }

  function moveRumourStep(fromIndex: number, toIndex: number) {
    sound.playBlip()
    if (toIndex < 0 || toIndex >= rumourOrder.length) return
    const updated = [...rumourOrder]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setRumourOrder(updated)
  }

  function submitDeduction() {
    const isTimelineCorrect = rumourOrder.every((step, idx) => step.isCorrectOrder === idx + 1)
    const res = evaluateWhisperBoard({
      scenarioId: selectedCase,
      connections,
      selectedTwistedSpeakerId: identifiedTruth || isTimelineCorrect ? 'auntie-may' : undefined,
    })
    setResult(res)
    saveWhisperRecord(res)

    if (res.passed) {
      sound.playSuccessFanfare()
      if (onCaseSolved) onCaseSolved()
    } else {
      sound.playAlarm()
    }
  }

  if (result) {
    return (
      <Modal title="Influence Board · Detective Analysis" onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: result.passed ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${result.passed ? '#86efac' : '#fca5a5'}`,
              textAlign: 'center',
            }}
          >
            <ShieldCheck size={42} color={result.passed ? '#16a34a' : '#dc2626'} />
            <h3 style={{ margin: '8px 0 4px', fontSize: '18px', color: result.passed ? '#15803d' : '#b91c1c' }}>
              Detective Rank: {result.detectiveRank}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
              Final Investigation Score: <strong style={{ fontSize: '18px', color: result.passed ? '#15803d' : '#b91c1c' }}>{result.score} / 100</strong>
            </p>
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Findings Breakdown:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.5, color: '#475569' }}>
              {result.feedbackMessages.map((msg, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{msg}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button className="secondary" onClick={() => setResult(null)}>
              Adjust Pins & Replay
            </Button>
            <Button className="primary" onClick={onClose}>
              Done · Return to Room
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Interactive Pinboard · Map Rumours & Influence Tactics" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '320px' }}>
        {/* Case Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button
              className={selectedCase === 'snack-dare' ? 'primary' : 'secondary'}
              onClick={() => {
                sound.playBlip()
                setSelectedCase('snack-dare')
                setConnections([])
              }}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Case 1: The Minimart Snack Dare
            </Button>
            <Button
              className={selectedCase === 'fast-cash' ? 'primary' : 'secondary'}
              onClick={() => {
                sound.playBlip()
                setSelectedCase('fast-cash')
                setConnections([])
              }}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Case 2: The Fast-Cash Scheme
            </Button>
          </div>
        </div>

        {/* Cork Pinboard Canvas */}
        <div
          style={{
            background: '#c29b6c',
            border: '6px solid #582f0e',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Rumour Mutation Timeline Arranger */}
          <div
            style={{
              background: '#fef3c7',
              border: '2px dashed #b45309',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: '#78350f', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                Rumour Propagation Sequence (Arrange 1 to 5):
              </strong>
              <small style={{ fontSize: '11px', color: '#92400e' }}>
                Reconstruct the path from Truth ➔ Distortion ➔ Dare
              </small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {rumourOrder.map((step, idx) => (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d97706',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#b45309',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>{step.speaker}</div>
                    <div style={{ fontSize: '12px', color: '#1e293b', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {step.text}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveRumourStep(idx, idx - 1)}
                      style={{ padding: '2px 6px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === rumourOrder.length - 1}
                      onClick={() => moveRumourStep(idx, idx + 1)}
                      style={{ padding: '2px 6px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suspect Polaroid Pins */}
          <div>
            <strong style={{ fontSize: '12px', color: '#451a03', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
              Suspect & Witness Nodes:
            </strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { id: 'senior', name: 'GhostRider_99', role: 'Anonymous Dare Prompter', note: 'Telegram Group Leader' },
                { id: 'may', name: 'Auntie May', role: 'Kopi Corner Regular', note: 'Heard inventory rumour' },
                { id: 'amir', name: 'Amir', role: 'Classmate', note: 'Exaggerated chat message' },
                { id: 'jun', name: 'Jun', role: 'Targeted Student', note: 'Felt pressured into corner' },
              ].map(s => {
                const isSelected = selectedTarget === s.id
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      sound.playBlip()
                      setSelectedTarget(s.id)
                    }}
                    style={{
                      background: '#fffdfa',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `2px solid ${isSelected ? '#dc2626' : '#d1d5db'}`,
                      boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      position: 'relative',
                      textAlign: 'center',
                    }}
                  >
                    {/* Pushpin at top of polaroid */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: isSelected ? '#dc2626' : '#94a3b8',
                        border: '1.5px solid #ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                    <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginTop: '4px' }}>
                      {s.name}
                    </strong>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{s.role}</span>
                    <span style={{ fontSize: '9px', color: '#b45309', fontStyle: 'italic' }}>{s.note}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Evidence Quotes Tray & String Pins */}
          <div>
            <strong style={{ fontSize: '12px', color: '#451a03', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Step 1 · Pick Discovered Statement:
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
              {availablePhrases.map(p => {
                const isSelected = selectedPhrase === p.id
                const hasConn = connections.some(c => c.phraseId === p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      sound.playBlip()
                      setSelectedPhrase(p.id)
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isSelected ? '#dc2626' : hasConn ? '#16a34a' : '#d1d5db'}`,
                      background: isSelected ? '#fef2f2' : hasConn ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontStyle: 'italic', color: '#1e293b' }}>“{p.text}”</span>
                    {hasConn && <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>🧶 Pinned</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Influence Tactic Pins */}
          <div>
            <strong style={{ fontSize: '12px', color: '#451a03', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#9333ea', display: 'inline-block' }} />
              Step 2 · Pick Psychological Tactic Pin:
            </strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px' }}>
              {Object.values(INFLUENCE_TACTICS).map(t => {
                const isSelected = selectedTactic === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      sound.playBlip()
                      setSelectedTactic(t.id)
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isSelected ? '#9333ea' : '#e2e8f0'}`,
                      background: isSelected ? '#faf5ff' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{t.icon}</span>
                    <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#7e22ce' : '#334155' }}>
                      {t.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action: Connect string button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button
              className="primary"
              disabled={!selectedPhrase || !selectedTactic}
              onClick={addConnection}
            >
              🧶 Pin & Connect Red Yarn String
            </Button>
          </div>

          {/* Active Yarn String Connections */}
          {connections.length > 0 && (
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.92)', borderRadius: '8px', border: '1px solid #d97706' }}>
              <strong style={{ fontSize: '12px', color: '#78350f', display: 'block', marginBottom: '6px' }}>
                Active Yarn Connections ({connections.length}):
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {connections.map(c => {
                  const phrase = allPhrases.find(p => p.id === c.phraseId)
                  const tactic = INFLUENCE_TACTICS[c.tacticId]
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        background: '#ffffff',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        borderLeft: '4px solid #dc2626',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ color: '#1e293b' }}>
                        “{phrase?.text.slice(0, 36)}...” ➔ <strong>{tactic?.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeConnection(c.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit Deduction Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <Button className="secondary" onClick={onClose}>
            Back to Room
          </Button>
          <Button
            className="primary"
            disabled={connections.length === 0}
            onClick={submitDeduction}
          >
            Submit Deduction & Analyze
          </Button>
        </div>
      </div>
    </Modal>
  )
}
