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
}

export function WhisperBoardModal({ collectedPhrases, onClose }: WhisperBoardModalProps) {
  const scenario = WHISPER_SCENARIOS['snack-dare']
  const [connections, setConnections] = useState<WhisperConnection[]>([])
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string>('senior')
  const [selectedTactic, setSelectedTactic] = useState<TacticId | null>(null)
  const [result, setResult] = useState<WhisperNetworkResult | null>(null)
  const [identifiedTruth, setIdentifiedTruth] = useState(false)

  // Find phrases
  const allPhrases = scenario.witnesses.flatMap(w => w.transcript.flatMap(t => t.phrases))
  const availablePhrases = allPhrases.filter(p => collectedPhrases.includes(p.id) || p.isManipulative)

  function addConnection() {
    if (!selectedPhrase || !selectedTactic) return
    const newConn: WhisperConnection = {
      id: `conn-${Date.now()}`,
      phraseId: selectedPhrase,
      speakerId: 'senior',
      tacticId: selectedTactic,
      targetId: selectedTarget,
    }
    setConnections(prev => [...prev.filter(c => c.phraseId !== selectedPhrase), newConn])
    setSelectedPhrase(null)
    setSelectedTactic(null)
  }

  function removeConnection(connId: string) {
    setConnections(prev => prev.filter(c => c.id !== connId))
  }

  function submitDeduction() {
    const res = evaluateWhisperBoard({
      scenarioId: 'snack-dare',
      connections,
      selectedTwistedSpeakerId: identifiedTruth ? 'auntie-may' : undefined,
    })
    setResult(res)
    saveWhisperRecord(res)
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
    <Modal title="Interactive Influence Board · Map Evidence & Tactics" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '320px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Pin collected statements onto the board, connect them to suspects, and identify which manipulation tactic was used.
        </p>

        {/* 1. Evidence Statements Tray */}
        <div>
          <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
            Step 1 · Select Evidence Statement:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
            {availablePhrases.map(p => {
              const isSelected = selectedPhrase === p.id
              const hasConn = connections.some(c => c.phraseId === p.id)
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPhrase(p.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isSelected ? '#0284c7' : hasConn ? '#10b981' : '#cbd5e1'}`,
                    background: isSelected ? '#f0f9ff' : hasConn ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontStyle: 'italic', color: '#1e293b' }}>{p.text}</span>
                  {hasConn && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>✓ Pinned</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Target Suspect Selection */}
        <div>
          <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
            Step 2 · Connect to Suspect:
          </strong>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'senior', label: 'Block 12 Senior (Influencer)' },
              { id: 'amir', label: 'Amir (Target)' },
              { id: 'jun', label: 'Jun (Target)' },
            ].map(s => (
              <Button
                key={s.id}
                className={selectedTarget === s.id ? 'primary' : 'secondary'}
                onClick={() => setSelectedTarget(s.id)}
                style={{ fontSize: '12px', padding: '6px 10px' }}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 3. Tactic Selection */}
        <div>
          <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
            Step 3 · Connect Influence Tactic Pin:
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px' }}>
            {Object.values(INFLUENCE_TACTICS).map(t => {
              const isSelected = selectedTactic === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTactic(t.id)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isSelected ? '#b91c1c' : '#e2e8f0'}`,
                    background: isSelected ? '#fef2f2' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{t.icon}</span>
                  <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#991b1b' : '#334155' }}>
                    {t.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action: Connect string */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button
            className="primary"
            disabled={!selectedPhrase || !selectedTactic}
            onClick={addConnection}
          >
            🧶 Pin & Connect String
          </Button>
        </div>

        {/* 4. Active Yarn String Connections */}
        {connections.length > 0 && (
          <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' }}>
              Pinned Connections on Board ({connections.length}):
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
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ color: '#1e293b' }}>
                      “{phrase?.text.slice(0, 32)}...” ➔ <strong>{tactic?.name}</strong>
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

        {/* 5. Rumour Distortion Check */}
        <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#92400e', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={identifiedTruth}
              onChange={e => setIdentifiedTruth(e.target.checked)}
            />
            <span>Verify Rumour Distortion: Auntie May confirmed 3 full cartons in storeroom, exposing the artificial chip scarcity rumour.</span>
          </label>
        </div>

        {/* Submit */}
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
