import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Plus,
  Shield,
  Zap,
} from 'lucide-react';
import {
  AdminSection as Section,
  AdminSidebar,
  DataSafeguardCard,
  InsightCard,
  PortalSummaryRow,
  SimulatedDataNote,
} from './AdminChrome';
import { AdminNeedsAttention } from './AdminNeedsAttention';
import { AdminRecentContent } from './AdminRecentContent';
import { AdminReviewQueue } from './AdminReviewQueue';
import { EngagementPanel } from './EngagementPanel';
import { FlashMissionPanel } from './FlashMissionPanel';
import { GroupDecisionSignalPanel } from './GroupDecisionSignals';
import { PilotEvaluationFramework } from './PilotEvaluationFramework';
import { ScenarioDetailPanel } from './ScenarioDetailPanel';
import {
  applyScenarioFilters,
  EMPTY_FILTERS,
  ScenarioFilters,
  type ScenarioFilterState,
} from './ScenarioFilters';
import {
  REVIEW_THRESHOLD,
  ScenarioTable,
} from './ScenarioTable';
import { SkillCoverageChart } from './SkillCoverage';
import { YouthMissionPanel } from './YouthMissionPanel';
import { YouthMissionQueue } from './YouthMissionQueue';
import { SessionManager } from './SessionManager';
import { ScenarioBuilderWizard } from './ScenarioBuilderWizard';
import { FacilitatorResources } from './FacilitatorResources';
import { Modal } from '../../components/PlayerModal';
import { api } from '../../lib/api';
import {
  derivePortalSummary,
  ENGAGEMENT_METRICS,
  MOCK_ADMIN_SCENARIOS,
  MOCK_GROUP_DECISION_SIGNALS,
  MOCK_INSIGHTS,
  MOCK_SKILL_COVERAGE,
  MOCK_YOUTH_SUBMISSIONS,
  PILOT_KPIS,
  RETENTION_LIMITATION,
  SAFEGUARDS,
} from './data';
import {
  TARGET_GROUPS,
  type AdminScenarioRow,
  type AdminSection as SectionId,
  type FlashMissionDraft,
  type GroupDecisionSignal,
  type Insight,
  type PortalSummary,
  type SkillCoverage,
  type TargetGroup,
  type YouthMissionDecision,
  type YouthMissionSubmission,
} from '../../../types/admin.js';

const YOUTH_PIPELINE: [string, string][] = [
  [
    'Submitted',
    'A young person proposes a situation they have actually met. Pseudonym and band only.',
  ],
  [
    'Reviewed',
    'A reviewer weighs the safeguarding points listed on the submission before anything else.',
  ],
  [
    'Drafted',
    'Converting produces a DRAFT scenario. It still has to be written, checked and scheduled.',
  ],
  [
    'Published',
    'Only through the same review every other scenario goes through. There is no shortcut from this queue.',
  ],
];

interface LocalDraft {
  id: string;
  title: string;
  district?: string;
  status: string;
}

export function ScenarioPortal({
  initialSection = 'overview',
  onReturnToGame,
}: {
  initialSection?: SectionId;
  onReturnToGame?: () => void;
}) {
  const [section, setSection] = useState<SectionId>(initialSection);
  useEffect(() => {
    if (initialSection) {
      setSection(initialSection);
    }
  }, [initialSection]);
  const [rows, setRows] = useState<AdminScenarioRow[]>(MOCK_ADMIN_SCENARIOS);
  const [summary, setSummary] = useState<PortalSummary>(() =>
    derivePortalSummary(MOCK_ADMIN_SCENARIOS),
  );
  const [insights] = useState<Insight[]>(MOCK_INSIGHTS);
  const [coverage] = useState<SkillCoverage[]>(MOCK_SKILL_COVERAGE);
  const [youthMissions, setYouthMissions] = useState<YouthMissionSubmission[]>(
    MOCK_YOUTH_SUBMISSIONS,
  );
  const [groupSignals] = useState<GroupDecisionSignal[]>(
    MOCK_GROUP_DECISION_SIGNALS,
  );
  const [youthDetail, setYouthDetail] =
    useState<YouthMissionSubmission | null>(null);
  const [filters, setFilters] = useState<ScenarioFilterState>(EMPTY_FILTERS);
  const [flashOpen, setFlashOpen] = useState(false);
  const [detail, setDetail] = useState<AdminScenarioRow | null>(null);
  const [deployed, setDeployed] = useState<AdminScenarioRow | null>(null);
  const [lastDeployed, setLastDeployed] = useState<AdminScenarioRow | null>(null);

  // Local drafts state for backward compatibility with preview.spec.ts
  const [editingLocalDraft, setEditingLocalDraft] = useState<LocalDraft | null>(
    null,
  );
  const [localDrafts, setLocalDrafts] = useState<LocalDraft[]>([]);

  // Attempt to integrate server scenarios if available
  useEffect(() => {
    let active = true;
    api.scenarios()
      .then((res) => {
        if (!active || !res?.data) return;
        const serverRows: AdminScenarioRow[] = res.data.map((s) => ({
          id: `api_${s.id}`,
          title: s.title,
          category: s.skill ?? 'Digital Safety',
          targetGroup: 'Secondary',
          status: 'LIVE',
          safeDecisionRate: 70,
          previousSafeDecisionRate: 65,
          responses: 120,
          competencies: ['SPOT', 'HOLD'],
          updatedBy: 'Server Sync',
          updatedOn: 'Today',
          isFlashMission: false,
        }));
        setRows((prev) => {
          const ids = new Set(prev.map((r) => r.id));
          const additions = serverRows.filter((r) => !ids.has(r.id));
          if (additions.length === 0) return prev;
          const merged = [...additions, ...prev];
          setSummary(derivePortalSummary(merged));
          return merged;
        });
      })
      .catch(() => {
        // Fallback gracefully to authored mock scenarios
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDeploy = useCallback(async (draft: FlashMissionDraft) => {
    const created: AdminScenarioRow = {
      id: `scn_flash_demo_${Date.now().toString(36)}`,
      title: draft.title,
      category: draft.category,
      targetGroup: draft.targetGroup,
      status: draft.status,
      safeDecisionRate: 0,
      previousSafeDecisionRate: 0,
      responses: 0,
      competencies: [draft.competency],
      updatedBy: 'You (Duty Officer)',
      updatedOn: 'Just now',
      isFlashMission: true,
    };
    setRows((prev) => {
      const next = [created, ...prev];
      setSummary(derivePortalSummary(next));
      return next;
    });
    setDeployed(created);
    setLastDeployed(created);
    setFilters(EMPTY_FILTERS);
  }, []);

  const closeFlashDrawer = useCallback(() => {
    setFlashOpen(false);
    setDeployed(null);
  }, []);

  const handleResetDemo = useCallback(() => {
    setRows(MOCK_ADMIN_SCENARIOS);
    setYouthMissions(MOCK_YOUTH_SUBMISSIONS);
    setSummary(derivePortalSummary(MOCK_ADMIN_SCENARIOS));
    setLocalDrafts([]);
    setLastDeployed(null);
    setFilters(EMPTY_FILTERS);
  }, []);

  const handleYouthDecision = useCallback(
    (id: string, decision: YouthMissionDecision, note: string) => {
      const submission = youthMissions.find((m) => m.id === id);
      setYouthMissions((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: decision,
                reviewNote: note || m.reviewNote,
                reviewedBy: 'You (Duty Officer)',
              }
            : m,
        ),
      );

      if (decision === 'CONVERTED' && submission) {
        const draftRow: AdminScenarioRow = {
          id: `scn_youth_${submission.id}`,
          title: submission.title,
          category: submission.category,
          targetGroup: submission.suggestedBand,
          status: 'DRAFT',
          safeDecisionRate: 0,
          previousSafeDecisionRate: 0,
          responses: 0,
          competencies: [submission.proposedCompetency],
          updatedBy: 'You (Duty Officer)',
          updatedOn: 'Just now',
          isFlashMission: false,
        };
        setRows((prev) =>
          prev.some((r) => r.id === draftRow.id) ? prev : [draftRow, ...prev],
        );
      }
    },
    [youthMissions],
  );

  const filtered = useMemo(
    () => applyScenarioFilters(rows, filters),
    [rows, filters],
  );

  const categories = useMemo(
    () => [...new Set(rows.map((r) => r.category))].sort(),
    [rows],
  );

  const audiences = useMemo(() => {
    const present = new Set(rows.map((r) => r.targetGroup));
    return TARGET_GROUPS.filter((band) => present.has(band)) as TargetGroup[];
  }, [rows]);

  const youthPending = useMemo(
    () => youthMissions.filter((m) => m.status === 'AWAITING_REVIEW'),
    [youthMissions],
  );

  const reviewRows = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            r.status === 'LIVE' &&
            r.responses > 0 &&
            r.safeDecisionRate < REVIEW_THRESHOLD,
        )
        .sort((a, b) => a.safeDecisionRate - b.safeDecisionRate),
    [rows],
  );

  const recentRows = useMemo(() => rows.slice(0, 5), [rows]);

  return (
    <div className="city-feature min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-surface lg:h-16">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 lg:h-full lg:flex-nowrap lg:py-0">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900"
            >
              <Shield className="h-4 w-4 text-amber-400" />
            </span>
            <div>
              <p className="text-[13px] font-extrabold text-navy-900">
                ShieldQuest
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-civic-700">
                Scenario Management Portal
              </p>
            </div>
          </div>

          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase leading-tight tracking-[0.12em] text-amber-700">
            Prototype admin view
            <span className="hidden sm:inline">
              {' '}
              · Demonstration environment · Simulated data
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {onReturnToGame && (
              <button
                type="button"
                onClick={onReturnToGame}
                aria-label="Open the youth app"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-semibold text-ink-muted transition hover:border-civic-200 hover:text-civic-700"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Youth app</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setEditingLocalDraft({
                  id: crypto.randomUUID(),
                  title: '',
                  district: 'school',
                  status: 'draft',
                });
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-bold text-ink transition hover:border-civic-300 hover:text-civic-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New draft
            </button>

            <button
              type="button"
              onClick={() => setFlashOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-civic-600 px-4 text-[14px] font-bold text-white shadow-sm transition hover:bg-civic-700"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              Deploy Flash Mission
            </button>
            <span
              aria-hidden="true"
              className="hidden h-9 w-9 place-items-center rounded-full bg-navy-100 text-[12px] font-bold text-navy-800 lg:grid"
            >
              DO
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <AdminSidebar
          active={section}
          onSelect={setSection}
          reviewCount={reviewRows.length}
          youthCount={youthPending.length}
        />

        <main
          id="main"
          className="mx-auto min-w-0 max-w-[1180px] flex-1 px-5 py-7 lg:px-8 xl:max-w-[1560px] 2xl:max-w-[1720px]"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-civic-700 lg:hidden">
              Project SHIELD
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 lg:mt-0">
              Scenario Management Portal
            </h1>
            <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
              Review how well prevention content is teaching, and update it as
              risks change — without rebuilding the application.
            </p>
          </div>

          {lastDeployed && (
            <div
              role="status"
              className="mt-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-leaf-200 bg-leaf-50 px-4 py-3"
            >
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-leaf-700"
                aria-hidden="true"
              />
              <p className="text-[14px] text-leaf-700">
                <span className="font-extrabold uppercase tracking-wide">
                  {lastDeployed.status === 'LIVE'
                    ? 'Flash Mission live'
                    : 'Flash Mission saved'}
                </span>{' '}
                — <span className="font-semibold">{lastDeployed.title}</span>{' '}
                {lastDeployed.status === 'LIVE'
                  ? `is now available to the ${lastDeployed.targetGroup} cohort.`
                  : 'has been saved as a draft.'}
              </p>
              <button
                type="button"
                onClick={() => setLastDeployed(null)}
                className="ml-auto inline-flex min-h-[44px] items-center px-2 text-[13px] font-semibold text-leaf-700 underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Local Drafts Shelf for backward compatibility with preview test */}
          {localDrafts.length > 0 && (
            <div className="mt-5 rounded-xl border border-civic-200 bg-civic-50/60 p-4">
              <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-civic-800">
                Active Local Drafts ({localDrafts.length})
              </h3>
              <ul className="mt-2 divide-y divide-civic-200">
                {localDrafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2"
                  >
                    <div>
                      <span className="font-bold text-navy-900">
                        {draft.title}
                      </span>
                      <span className="ml-2 text-[12px] text-ink-muted">
                        ({draft.status})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${draft.title}`}
                        onClick={() => setEditingLocalDraft(draft)}
                        className="inline-flex min-h-[36px] items-center rounded border border-line bg-surface px-2.5 text-[12px] font-semibold text-ink transition hover:border-civic-300"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-8">
            {section === 'overview' && (
              <>
                <Section
                  title="What is happening"
                  description="Aggregate performance of published prevention content."
                >
                  <PortalSummaryRow summary={summary} />
                </Section>

                <Section
                  title="Needs attention"
                  badge={{ value: reviewRows.length, tone: 'attention' }}
                  description={`Live scenarios teaching below the ${REVIEW_THRESHOLD}% threshold. This reflects the content, not the participants.`}
                >
                  <AdminNeedsAttention
                    rows={reviewRows}
                    onOpenReview={() => setSection('review')}
                    onSelect={setDetail}
                  />
                </Section>

                <Section
                  title="Recent content"
                  description="The most recently added or updated scenarios."
                  action={
                    <button
                      type="button"
                      onClick={() => setSection('library')}
                      className="inline-flex min-h-[44px] items-center text-[13px] font-bold text-civic-700 underline underline-offset-2"
                    >
                      Open Scenario Library
                    </button>
                  }
                >
                  <AdminRecentContent
                    rows={recentRows}
                    onSelect={setDetail}
                    highlightId={lastDeployed?.id}
                  />
                  <SimulatedDataNote />
                </Section>
              </>
            )}

            {section === 'sessions' && (
              <Section
                title="Live Session Operations"
                description="Manage active cohorts, classroom room codes, squad progress, and live voting debriefs."
              >
                <SessionManager />
              </Section>
            )}

            {section === 'builder' && (
              <Section
                title="Scenario Builder Wizard"
                description="Author multi-step interactive missions with red flags, choices, and delayed consequences."
              >
                <ScenarioBuilderWizard
                  onClose={() => setSection('library')}
                  onSaveScenario={(newSc: any) => {
                    const mappedRow: AdminScenarioRow = {
                      id: newSc.id,
                      title: newSc.title,
                      category: newSc.theme,
                      targetGroup: 'Secondary',
                      status: newSc.status === 'published' ? 'LIVE' : 'DRAFT',
                      safeDecisionRate: 0,
                      previousSafeDecisionRate: 0,
                      responses: 0,
                      competencies: [newSc.competency],
                      updatedBy: 'You (Facilitator)',
                      updatedOn: 'Just now',
                      isFlashMission: false,
                    };
                    setRows((prev) => [mappedRow, ...prev]);
                    setSummary(derivePortalSummary([mappedRow, ...rows]));
                    setSection('library');
                  }}
                />
              </Section>
            )}

            {section === 'resources' && (
              <Section
                title="Facilitator Resources & Printables"
                description="Download pedagogical guides, checklists, and printable emergency classroom backup forms."
              >
                <FacilitatorResources />
              </Section>
            )}

            {section === 'library' && (
              <Section
                title="Scenario Library"
                badge={{ value: rows.length, tone: 'neutral' }}
                description="All published, drafted and scheduled prevention content."
              >
                <ScenarioFilters
                  filters={filters}
                  onChange={setFilters}
                  categories={categories}
                  audiences={audiences}
                  shown={filtered.length}
                  total={rows.length}
                />
                <ScenarioTable
                  rows={filtered}
                  highlightId={lastDeployed?.id}
                  onSelect={setDetail}
                  caption="All scenarios with category, audience, status and safe decision rate"
                />
                <p className="max-w-[92ch] text-[12px] leading-relaxed text-ink-soft">
                  <strong className="font-bold text-ink-muted">
                    Safe decision rate
                  </strong>{' '}
                  measures how clearly a scenario teaches — which topics need
                  more support. It is not a measure of the young people who
                  answered it. Prototype / simulated data, aggregated only.
                </p>
              </Section>
            )}

            {section === 'review' && (
              <Section
                title="Content Review"
                badge={{ value: reviewRows.length, tone: 'attention' }}
                description="Scenarios that may require clearer teaching, updated content or further review."
              >
                <AdminReviewQueue rows={reviewRows} onSelect={setDetail} />
                <SimulatedDataNote>
                  Prototype / simulated data. Content analytics only — no
                  individual responses, participants or risk scores are shown
                  anywhere in this portal.
                </SimulatedDataNote>
              </Section>
            )}

            {section === 'youth' && (
              <>
                <Section
                  title="Youth-Created Missions"
                  badge={{ value: youthPending.length, tone: 'attention' }}
                  description="Mission ideas submitted by young people, waiting on a reviewer. Nothing here reaches a player without review, and the strongest decision available is a scenario draft."
                >
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-[13px] font-bold text-amber-700">
                      Prototype moderation pipeline · simulated submissions
                    </p>
                    <p className="mt-1 max-w-[92ch] text-[13px] leading-relaxed text-amber-700">
                      There is no submission service behind this queue and no
                      real young person behind any entry. Submitters are
                      represented by a programme pseudonym and a cohort band
                      and nothing else — no name, school, class or contact
                      detail. Decisions recorded here last for this session only.
                    </p>
                  </div>

                  <YouthMissionQueue
                    submissions={youthMissions}
                    onSelect={setYouthDetail}
                  />
                </Section>

                <Section
                  title="How a submission becomes content"
                  description="The route an idea takes, and where it can stop."
                >
                  <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {YOUTH_PIPELINE.map(([title, body], i) => (
                      <li
                        key={title}
                        className="rounded-xl border border-line bg-surface p-4"
                      >
                        <p className="text-[11px] font-bold tabular-nums text-civic-700">
                          0{i + 1}
                        </p>
                        <p className="mt-1.5 text-[14px] font-bold text-navy-900">
                          {title}
                        </p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                          {body}
                        </p>
                      </li>
                    ))}
                  </ol>
                </Section>
              </>
            )}

            {section === 'insights' && (
              <>
                <Section
                  title="Insights"
                  description="Aggregate learning signals across all cohorts."
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {insights.map((i) => (
                      <InsightCard key={i.id} insight={i} />
                    ))}
                  </div>
                </Section>

                <Section
                  title="Think · Vote · Explain"
                  description="How facilitated group questions behaved: where a room started, where it ended, and how many people moved after hearing each other."
                >
                  <GroupDecisionSignalPanel signals={groupSignals} />
                  <SimulatedDataNote>
                    Simulated prototype data from a demonstration flow — there
                    is no live multiplayer session behind it. Question-level
                    and aggregate only: no individual response, no participant
                    history and no risk score is produced or displayed.
                  </SimulatedDataNote>
                </Section>

                <Section
                  title="Engagement"
                  description="KPI 6. Whether the experience is completed, returned to and stayed with — across the programme, never per participant."
                >
                  <EngagementPanel metrics={ENGAGEMENT_METRICS} />
                  <SimulatedDataNote>
                    Simulated prototype data. These are authored demonstration
                    values, not pilot results — this build has no telemetry
                    pipeline, no cohort and no participant records behind them.
                  </SimulatedDataNote>
                </Section>

                <Section
                  title="Pilot evaluation framework"
                  description="The six KPIs the funded pilot would measure, and what this prototype can honestly show against each one."
                >
                  <PilotEvaluationFramework kpis={PILOT_KPIS} />
                  <div className="rounded-xl border border-line-strong bg-surface-sunk p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                      KPI 5 · Retention — planned for pilot
                    </p>
                    <p className="mt-1.5 max-w-[92ch] text-[13px] leading-relaxed text-ink-muted">
                      {RETENTION_LIMITATION}
                    </p>
                  </div>
                  <SimulatedDataNote>
                    An evaluation plan, not a set of results. ShieldQuest has
                    not completed the funded youth pilot, so no measured change
                    in risk recognition, decision accuracy, consequence
                    awareness or peer intervention confidence is claimed
                    anywhere in this build.
                  </SimulatedDataNote>
                </Section>

                <Section
                  title="S.H.I.E.L.D. skill coverage"
                  description="Which prevention skills the current content teaches well, and where more material is needed."
                >
                  <SkillCoverageChart rows={coverage} />
                  <SimulatedDataNote>
                    Simulated prototype data. Aggregated across content —
                    individual participant performance is not displayed.
                  </SimulatedDataNote>
                </Section>

                <Section title="Data &amp; safeguards">
                  <DataSafeguardCard
                    items={SAFEGUARDS}
                    onResetDemo={handleResetDemo}
                  />
                </Section>
              </>
            )}
          </div>

          <footer className="mt-10 border-t border-line pt-5">
            <p className="max-w-[92ch] text-[12px] leading-relaxed text-ink-soft">
              ShieldQuest is a concept prototype for Project SHIELD. It is not an
              official Singapore Police Force platform and carries no official
              endorsement. All figures shown are simulated.
            </p>
          </footer>
        </main>
      </div>

      {/* Deploy Flash Mission modal */}
      <Modal
        open={flashOpen}
        onClose={closeFlashDrawer}
        size="form"
        className="bg-surface"
        labelledBy="flash-mission-title"
      >
        <FlashMissionPanel
          deployed={deployed}
          onDeploy={handleDeploy}
          onCancel={closeFlashDrawer}
          onViewLibrary={() => {
            closeFlashDrawer();
            setSection('library');
          }}
          onDone={closeFlashDrawer}
        />
      </Modal>

      {/* Scenario detail drawer */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        placement="right"
        className="bg-surface"
        labelledBy="scenario-detail-title"
      >
        {detail && (
          <ScenarioDetailPanel row={detail} onClose={() => setDetail(null)} />
        )}
      </Modal>

      {/* Youth mission review drawer */}
      <Modal
        open={youthDetail !== null}
        onClose={() => setYouthDetail(null)}
        placement="right"
        className="bg-surface"
        labelledBy="youth-mission-title"
      >
        {youthDetail && (
          <YouthMissionPanel
            submission={youthDetail}
            onDecide={handleYouthDecision}
            onClose={() => setYouthDetail(null)}
          />
        )}
      </Modal>

      {/* Local Draft Modal for backward compatibility with preview.spec.ts */}
      <Modal
        open={editingLocalDraft !== null}
        onClose={() => setEditingLocalDraft(null)}
        size="default"
        className="bg-surface p-6"
        labelledBy="local-draft-title"
      >
        {editingLocalDraft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingLocalDraft.title.trim()) return;
              const title = editingLocalDraft.title.trim();
              setLocalDrafts((prev) => [
                ...prev.filter((d) => d.id !== editingLocalDraft.id),
                { ...editingLocalDraft, title },
              ]);
              setEditingLocalDraft(null);
            }}
            className="space-y-4"
          >
            <h2 id="local-draft-title" className="text-lg font-bold text-navy-900">
              {localDrafts.some((d) => d.id === editingLocalDraft.id)
                ? 'Edit scenario preview'
                : 'New scenario preview'}
            </h2>
            <div>
              <label htmlFor="local-draft-title-input" className="block text-[12px] font-bold text-ink-muted">
                Scenario title
              </label>
              <input
                id="local-draft-title-input"
                aria-label="Scenario title"
                value={editingLocalDraft.title}
                onChange={(e) =>
                  setEditingLocalDraft({ ...editingLocalDraft, title: e.target.value })
                }
                required
                maxLength={100}
                className="mt-1 w-full rounded-lg border border-line-strong bg-surface p-2.5 text-[14px] text-ink outline-none focus:border-civic-500"
              />
            </div>
            <div>
              <label htmlFor="local-draft-district-select" className="block text-[12px] font-bold text-ink-muted">
                District
              </label>
              <select
                id="local-draft-district-select"
                aria-label="District"
                value={editingLocalDraft.district ?? 'school'}
                onChange={(e) =>
                  setEditingLocalDraft({ ...editingLocalDraft, district: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-line-strong bg-surface p-2.5 text-[14px] text-ink outline-none focus:border-civic-500"
              >
                <option value="school">School Street</option>
                <option value="retail">Retail District</option>
                <option value="digi">Digi-District</option>
                <option value="community">Community Hub</option>
              </select>
            </div>
            <div>
              <label htmlFor="local-draft-status-select" className="block text-[12px] font-bold text-ink-muted">
                Preview status
              </label>
              <select
                id="local-draft-status-select"
                aria-label="Preview status"
                value={editingLocalDraft.status}
                onChange={(e) =>
                  setEditingLocalDraft({ ...editingLocalDraft, status: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-line-strong bg-surface p-2.5 text-[14px] text-ink outline-none focus:border-civic-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published (preview only)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-navy-900 px-4 text-[14px] font-bold text-white shadow-sm transition hover:bg-navy-800"
              >
                Save local preview
              </button>
            </div>
            {localDrafts.some((d) => d.id === editingLocalDraft.id) && (
              <button
                type="button"
                onClick={() => {
                  setLocalDrafts((prev) =>
                    prev.filter((d) => d.id !== editingLocalDraft.id),
                  );
                  setEditingLocalDraft(null);
                }}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg text-[13px] font-bold text-coral-700 transition hover:bg-coral-50"
              >
                Delete local preview
              </button>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}

export const AdminPortal = ScenarioPortal;
