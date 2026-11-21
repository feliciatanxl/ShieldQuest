import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  HelpCircle,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import {
  CLARIFICATION_QUESTIONS,
  FREEZE_DECISIONS,
  FREEZE_HOTSPOTS,
  calculateFreezeScore,
  saveFreezeFrameRecord,
  type FreezeDecisionId,
  type FreezeFrameResult,
  type FreezeHotspotId,
} from '../state/freezeFrame'
import { residents } from '../game/residentData'
import { AvatarSprite } from './AvatarSprite'
import { Button, Modal } from './ui'

interface FreezeInspectionModalProps {
  hotspotId: FreezeHotspotId
  onClose: () => void
  onAddFact: (id: FreezeHotspotId) => void
  alreadyAdded: boolean
}

export function FreezeInspectionModal({
  hotspotId,
  onClose,
  onAddFact,
  alreadyAdded,
}: FreezeInspectionModalProps) {
  const hotspot = FREEZE_HOTSPOTS[hotspotId]
  if (!hotspot) return null

  return (
    <Modal title={hotspot.magnifierTitle} onClose={onClose}>
      <div className="freeze-inspect-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: hotspot.category === 'physical-evidence' ? '#fee2e2' : '#e0f2fe',
              color: hotspot.category === 'physical-evidence' ? '#991b1b' : '#0369a1',
            }}
          >
            {hotspot.category === 'physical-evidence' ? 'Physical Clue' : 'Environment'}
          </span>
          {hotspot.criticalForVerification && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
              }}
            >
              ★ Key Verification Evidence
            </span>
          )}
        </div>

        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <strong style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
            Visual Observation:
          </strong>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#1e293b' }}>
            {hotspot.visualDescription}
          </p>
        </div>

        <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#065f46', marginBottom: '4px' }}>
            <CheckCircle2 size={15} /> Verified Objective Fact:
          </strong>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#047857', fontWeight: 600 }}>
            {hotspot.verifiedFact}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <Button
            className="primary"
            onClick={() => {
              onAddFact(hotspotId)
              onClose()
            }}
          >
            {alreadyAdded ? '✓ Fact Already in Ledger' : '✓ Record in Fact Ledger'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface FreezeDialogueModalProps {
  speaker: 'jun' | 'cashier'
  askedQuestions: string[]
  onAskQuestion: (qId: string) => void
  onOpenDecision: () => void
  onClose: () => void
}

export function FreezeDialogueModal({
  speaker,
  askedQuestions,
  onAskQuestion,
  onOpenDecision,
  onClose,
}: FreezeDialogueModalProps) {
  const resident = speaker === 'jun' ? residents.jun : residents.cashier
  const relevantQuestions = CLARIFICATION_QUESTIONS.filter(q => q.target === speaker)
  const [activeAnswer, setActiveAnswer] = useState<string | null>(null)

  return (
    <Modal
      title={speaker === 'jun' ? 'Conversation · Jun' : 'Inquiry · Cashier Mr. Tan'}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ width: 44, height: 44, overflow: 'hidden' }}>
            <AvatarSprite avatar={resident} facing="front" />
          </div>
          <div>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>
              {speaker === 'jun' ? 'Jun (Neighbourhood Friend)' : 'Mr. Tan (Minimart Cashier)'}
            </strong>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {speaker === 'jun'
                ? 'Looking nervous and clutching his half-zipped backpack.'
                : 'Working behind the counter, checking receipts.'}
            </p>
          </div>
        </div>

        <div>
          <strong style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>
            Ask a clarifying question:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {relevantQuestions.map(q => {
              const asked = askedQuestions.includes(q.id)
              return (
                <div
                  key={q.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: asked ? '#f1f5f9' : '#ffffff',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    onAskQuestion(q.id)
                    setActiveAnswer(q.id)
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      {q.prompt}
                    </span>
                    <span style={{ fontSize: '12px', color: asked ? '#059669' : '#64748b' }}>
                      {asked ? '✓ Asked' : 'Inquire →'}
                    </span>
                  </div>

                  {activeAnswer === q.id && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontStyle: 'italic', color: '#334155' }}>
                        {q.answer}
                      </p>
                      <div style={{ fontSize: '12px', color: '#0284c7', background: '#f0f9ff', padding: '6px 8px', borderRadius: '4px' }}>
                        💡 <strong>Insight:</strong> {q.insight}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {speaker === 'jun' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Ready to choose your response?</span>
            <Button className="primary" onClick={() => { onClose(); onOpenDecision() }}>
              ⚡ Take a Stand / Decide Response
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

interface FreezeDecisionModalProps {
  paused: boolean
  inspectedHotspots: FreezeHotspotId[]
  askedQuestions: string[]
  onReturnToHouse: () => void
  onClose: () => void
}

export function FreezeDecisionModal({
  paused,
  inspectedHotspots,
  askedQuestions,
  onReturnToHouse,
  onClose,
}: FreezeDecisionModalProps) {
  const [selectedDecision, setSelectedDecision] = useState<FreezeDecisionId | null>(null)
  const [result, setResult] = useState<FreezeFrameResult | null>(null)

  function submitDecision(decisionId: FreezeDecisionId) {
    const res = calculateFreezeScore({
      paused,
      timelinePositionsChecked: [1, 2, 3, 4, 5],
      inspectedHotspots,
      askedQuestionIds: askedQuestions,
      decision: decisionId,
    })
    setResult(res)
    saveFreezeFrameRecord(res)
  }

  if (result) {
    const isSuccess = result.passed
    return (
      <Modal title="Simulation Debrief · Hold Before Acting" onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: isSuccess ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${isSuccess ? '#86efac' : '#fca5a5'}`,
              textAlign: 'center',
            }}
          >
            {isSuccess ? <ShieldCheck size={42} color="#16a34a" /> : <ShieldAlert size={42} color="#dc2626" />}
            <h3 style={{ margin: '8px 0 4px', fontSize: '18px', color: isSuccess ? '#15803d' : '#b91c1c' }}>
              {isSuccess ? 'Competency Demonstrated: Hold Passed!' : 'Hold Competency Missed'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
              Final Competency Score: <strong style={{ fontSize: '18px', color: isSuccess ? '#15803d' : '#b91c1c' }}>{result.score} / 100</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Patience / Pause Rating</div>
              <strong style={{ fontSize: '15px', color: result.patienceRating === 'High' ? '#16a34a' : '#d97706' }}>
                {result.patienceRating}
              </strong>
            </div>
            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Evidence Rating</div>
              <strong style={{ fontSize: '15px', color: result.evidenceRating === 'Thorough' ? '#16a34a' : '#d97706' }}>
                {result.evidenceRating}
              </strong>
            </div>
          </div>

          <div>
            <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Investigative Summary:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.5, color: '#475569' }}>
              {result.summaryNotes.map((note, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{note}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button className="secondary" onClick={() => setResult(null)}>
              Replay / Try Other Response
            </Button>
            <Button className="primary" onClick={onReturnToHouse}>
              Leave Simulation · Return to House H
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Choose Your Response to Jun" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
          Jun is urgently asking you to stand by the entrance door and whistle if anyone comes. How do you respond?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.values(FREEZE_DECISIONS).map(d => {
            const isSelected = selectedDecision === d.id
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDecision(d.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                  background: isSelected ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>{d.title}</strong>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        d.rating === 'protective'
                          ? '#dcfce7'
                          : d.rating === 'risky'
                          ? '#fee2e2'
                          : d.rating === 'reckless'
                          ? '#ffedd5'
                          : '#f1f5f9',
                      color:
                        d.rating === 'protective'
                          ? '#15803d'
                          : d.rating === 'risky'
                          ? '#b91c1c'
                          : d.rating === 'reckless'
                          ? '#c2410c'
                          : '#475569',
                    }}
                  >
                    {d.rating.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontStyle: 'italic', color: '#334155' }}>
                  “{d.quote}”
                </p>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{d.description}</span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <Button className="secondary" onClick={onClose}>
            Resume Investigation First
          </Button>
          <Button
            className="primary"
            disabled={!selectedDecision}
            onClick={() => {
              if (selectedDecision) submitDecision(selectedDecision)
            }}
          >
            Confirm Response & Submit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
