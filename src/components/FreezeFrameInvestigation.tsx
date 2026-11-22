import { useState } from 'react'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
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
  Sliders,
  Sparkles,
  Tv,
  X,
  XCircle,
  ZoomIn,
} from 'lucide-react'
import {
  CCTV_CHANNELS,
  CLARIFICATION_QUESTIONS,
  FREEZE_DECISIONS,
  FREEZE_HOTSPOTS,
  STORE_MANIFESTS,
  calculateFreezeScore,
  saveFreezeFrameRecord,
  type FreezeDecisionId,
  type FreezeFrameResult,
  type FreezeHotspotId,
  type ManifestItem,
} from '../state/freezeFrame'
import { ResidentPortrait } from './AvatarSprite'
import { Button, Modal } from './ui'
import { sound } from '../game/audio'

/**
 * Environmental Puzzle 1: Interactive CCTV Observation Console
 */
export function CCTVConsoleModal({
  onClose,
  onRecordClue,
  alreadyRecorded,
}: {
  onClose: () => void
  onRecordClue: (clueText: string) => void
  alreadyRecorded: boolean
}) {
  const [activeCam, setActiveCam] = useState<'cam-01' | 'cam-02' | 'cam-03'>('cam-02')
  const [selectedStage, setSelectedStage] = useState<number>(3)
  const [isZoomed, setIsZoomed] = useState<boolean>(false)
  const [enhanceFilter, setEnhanceFilter] = useState<boolean>(false)

  const feeds = CCTV_CHANNELS['snack-dare-device'] || []
  const currentFeed = feeds.find(f => f.id === activeCam)
  const currentAngle = currentFeed?.angles.find(a => a.stage === selectedStage)

  return (
    <Modal title="CCTV Security Monitor · Sunshine Minimart" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Camera Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {feeds.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                sound.playBlip()
                setActiveCam(f.id as typeof activeCam)
              }}
              style={{
                flex: '1 1 140px',
                padding: '8px 10px',
                borderRadius: '6px',
                border: `2px solid ${activeCam === f.id ? '#0284c7' : '#cbd5e1'}`,
                background: activeCam === f.id ? '#0f172a' : '#f8fafc',
                color: activeCam === f.id ? '#38bdf8' : '#334155',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              <Camera size={14} /> {f.name}
            </button>
          ))}
        </div>

        {/* CRT CCTV Viewport */}
        <div
          style={{
            position: 'relative',
            background: enhanceFilter ? '#022c22' : '#090d16',
            borderRadius: '10px',
            border: '3px solid #1e293b',
            padding: '14px',
            color: enhanceFilter ? '#6ee7b7' : '#e2e8f0',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
            minHeight: '170px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header Overlay */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'monospace' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
              ● REC · {activeCam.toUpperCase()}
            </span>
            <span>TIMECODE 00:0{selectedStage}:14 · SPEED 1.0X</span>
          </div>

          {/* Center Observation Text & Zoom Visual */}
          <div style={{ margin: '14px 0', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px dashed #334155' }}>
            <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '6px' }}>
              👁 <strong>Observation:</strong> {currentAngle?.observationText}
            </div>
            <div
              style={{
                fontSize: isZoomed ? '13px' : '12px',
                color: enhanceFilter ? '#a7f3d0' : '#7dd3fc',
                background: isZoomed ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
                padding: isZoomed ? '8px' : '0',
                borderRadius: '4px',
                borderLeft: isZoomed ? '3px solid #38bdf8' : 'none',
              }}
            >
              {isZoomed ? (
                <>
                  🔍 <strong>HIGH-RES ENHANCED DETAIL:</strong> {currentAngle?.zoomDetail}
                </>
              ) : (
                <span style={{ fontStyle: 'italic', opacity: 0.85 }}>Click [Zoom In] below to inspect focal details.</span>
              )}
            </div>
          </div>

          {/* Key Clue Banner */}
          {currentAngle?.keyClue && isZoomed && (
            <div
              style={{
                background: '#047857',
                color: '#ecfdf5',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} /> {currentAngle.keyClue}
            </div>
          )}
        </div>

        {/* Video Scrubber & Camera Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              Scrub Timeline (Stages 1 – 5):
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    sound.playBlip()
                    setSelectedStage(st)
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: selectedStage === st ? '#0284c7' : '#f1f5f9',
                    color: selectedStage === st ? '#fff' : '#334155',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Stage {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  sound.playBlip()
                  setIsZoomed(!isZoomed)
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #94a3b8',
                  background: isZoomed ? '#e0f2fe' : '#ffffff',
                  color: isZoomed ? '#0369a1' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ZoomIn size={14} /> {isZoomed ? 'Zoom 2.0x (Active)' : 'Zoom In (1.0x)'}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playBlip()
                  setEnhanceFilter(!enhanceFilter)
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #94a3b8',
                  background: enhanceFilter ? '#d1fae5' : '#ffffff',
                  color: enhanceFilter ? '#065f46' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sliders size={14} /> {enhanceFilter ? 'Night Vision (ON)' : 'Enhance Filter'}
              </button>
            </div>

            <Button
              className="primary"
              onClick={() => {
                sound.playClueDiscovered()
                onRecordClue(currentAngle?.keyClue || currentAngle?.zoomDetail || 'CCTV observation verified.')
                onClose()
              }}
            >
              {alreadyRecorded ? '✓ Clue Logged in Ledger' : '✓ Log CCTV Clue to Ledger'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/**
 * Environmental Puzzle 2: Store Manifest & Receipt Discrepancy Verifier
 */
export function ManifestVerifierModal({
  onClose,
  onRecordClue,
  alreadyRecorded,
}: {
  onClose: () => void
  onRecordClue: (fact: string) => void
  alreadyRecorded: boolean
}) {
  const [selectedItem, setSelectedItem] = useState<ManifestItem | null>(null)
  const [discrepancyFound, setDiscrepancyFound] = useState<boolean>(false)
  const items = STORE_MANIFESTS['snack-dare-device'] || []

  function checkItem(item: ManifestItem) {
    sound.playBlip()
    setSelectedItem(item)
    if (item.isDiscrepancy) {
      sound.playClueDiscovered()
      setDiscrepancyFound(true)
    }
  }

  return (
    <Modal title="Delivery Manifest & Inventory Comparison" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
          Compare the counter’s official daily delivery manifest with the receipt in Jun’s pocket to verify what was legitimately purchased.
        </p>

        {/* Jun's pocket receipt card */}
        <div style={{ padding: '10px 12px', background: '#fefce8', border: '1px dashed #ca8a04', borderRadius: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#854d0e', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            🧾 Jun’s Pocket Receipt (Earlier Morning Purchase):
          </strong>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#713f12' }}>
            <span>1x Alkaline AA Batteries (4-pk) [SN-0491]</span>
            <strong>$4.50 (PAID)</strong>
          </div>
        </div>

        {/* Counter Manifest Table */}
        <div>
          <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
            Official Counter Inventory Manifest (Click an item to audit):
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map(item => {
              const isSelected = selectedItem?.serial === item.serial
              return (
                <div
                  key={item.serial}
                  onClick={() => checkItem(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isSelected ? (item.isDiscrepancy ? '#ef4444' : '#0284c7') : '#cbd5e1'}`,
                    background: isSelected ? (item.isDiscrepancy ? '#fef2f2' : '#f0f9ff') : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {item.name} <span style={{ fontSize: '11px', color: '#64748b' }}>({item.serial})</span>
                    </div>
                    <div style={{ fontSize: '11px', color: item.status === 'CUSTOMER_RESERVE' ? '#b45309' : '#059669' }}>
                      {item.customer}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.price}</div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: item.status === 'PAID' ? '#dcfce7' : '#fef3c7',
                        color: item.status === 'PAID' ? '#15803d' : '#b45309',
                      }}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Discrepancy Alert */}
        {discrepancyFound && (
          <div style={{ padding: '10px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#b91c1c' }}>
              <AlertTriangle size={15} /> Critical Discrepancy Uncovered:
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', lineHeight: 1.45, color: '#991b1b' }}>
              The 10,000mAh Powerbank ($45.00) in Jun’s backpack was NEVER paid for! It is marked as reserved for Mr. Lim and has not been cleared by the cashier.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button className="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            className="primary"
            disabled={!discrepancyFound}
            onClick={() => {
              sound.playClueDiscovered()
              onRecordClue('Inventory Audit Verified: $45.00 Powerbank in backpack is unpaid reserve stock.')
              onClose()
            }}
          >
            {alreadyRecorded ? '✓ Discrepancy Already Logged' : '✓ Log Discrepancy Evidence'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

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
              sound.playClueDiscovered()
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
            <ResidentPortrait id={speaker} />
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
                    sound.playBlip()
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
  onExecuteBranch?: (branch: 'calm-refusal' | 'comply-lookout' | 'public-accusation' | 'staff-inquiry') => void
}

export function FreezeDecisionModal({
  paused,
  inspectedHotspots,
  askedQuestions,
  onReturnToHouse,
  onClose,
  onExecuteBranch,
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

    // Trigger visible in-world branch consequence in Phaser!
    if (onExecuteBranch) {
      const branchMapping: Record<FreezeDecisionId, 'calm-refusal' | 'comply-lookout' | 'public-accusation' | 'staff-inquiry'> = {
        'calm-refusal': 'calm-refusal',
        'comply-lookout': 'comply-lookout',
        'public-accusation': 'public-accusation',
        'flee-store': 'public-accusation',
      }
      onExecuteBranch(branchMapping[decisionId])
    }
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
                onClick={() => {
                  sound.playBlip()
                  setSelectedDecision(d.id)
                }}
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
