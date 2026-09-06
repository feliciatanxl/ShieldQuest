import {
  ClipboardCheck,
  Minus,
  PencilLine,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { REVIEW_THRESHOLD, STATUS_STYLES } from './ScenarioTable';
import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
} from '../../../types/guardians.js';
import type { AdminScenarioRow } from '../../../types/admin.js';

const OBJECTIVES: Record<string, string> = {
  'Money Mule Recruitment':
    'Recognise that being paid to receive and forward money makes you responsible for it, and disengage rather than negotiate.',
  'Shop Theft & Peer Pressure':
    'Identify when a dare has shifted the decision to the group, and separate the social cost from the legal one.',
  'Account Sharing':
    'Understand that a shared login stays in your name, whatever the other person then does with it.',
  'E-Commerce Scam':
    'Check a seller through a channel you already trust before any money moves.',
  'Peer Shield · Money Mule':
    'Intervene with a friend privately, name the risk without shaming, and give them a next step.',
  'Peer Shield · Shop Theft':
    'Decline to provide cover, and recognise that corroborating a story makes it partly yours.',
  'Job Scam':
    'Test an offer against what a real employer would actually need from you.',
  'Vape Possession':
    'Recognise that holding something for someone else transfers the consequence, not just the item.',
  'Phishing QR':
    'Treat an unexpected payment prompt as unverified until checked through the official channel.',
  'Account Takeover':
    'Refuse third-party login prompts for in-game rewards, however routine they look.',
  'Unlicensed Moneylending':
    'Recognise runner recruitment, and understand that the errand is the offence.',
  Impersonation:
    'Verify identity through a second, independent channel before acting on an urgent request.',
};

const FALLBACK_OBJECTIVE =
  'Recognise the pressure being applied, pause before acting, and choose the response that still holds up afterwards.';

function Trend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 || current === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-ink-soft">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        No previous cycle to compare
      </span>
    );
  }
  const diff = current - previous;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-soft">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        No change since last cycle
      </span>
    );
  }
  const up = diff > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[13px] font-bold tabular-nums ${
        up ? 'text-leaf-700' : 'text-coral-700'
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {up ? '+' : ''}
      {diff} pts since last cycle
    </span>
  );
}

export function ScenarioDetailPanel({
  row,
  onClose,
}: {
  row: AdminScenarioRow;
  onClose: () => void;
}) {
  const needsReview =
    row.status === 'LIVE' &&
    row.responses > 0 &&
    row.safeDecisionRate < REVIEW_THRESHOLD;

  const objective = OBJECTIVES[row.category] ?? FALLBACK_OBJECTIVE;

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="border-b border-line bg-surface-sunk px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[row.status]}`}
          >
            {row.status}
          </span>
          {row.isFlashMission && (
            <span className="inline-flex items-center gap-1 rounded-md border border-civic-200 bg-civic-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-700">
              <Zap className="h-2.5 w-2.5" aria-hidden="true" />
              Flash Mission
            </span>
          )}
        </div>
        <h2
          id="scenario-detail-title"
          className="mt-2 text-[19px] font-extrabold tracking-tight text-navy-900"
        >
          {row.title}
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-muted">
          {row.category} · {row.targetGroup}
        </p>
      </header>

      <div className="thin-scroll flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {row.status === 'LIVE' && row.responses > 0 && (
          <section className="rounded-xl border border-line bg-surface-sunk p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              Safe decision rate
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span
                className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                  needsReview ? 'text-amber-700' : 'text-navy-900'
                }`}
              >
                {row.safeDecisionRate}%
              </span>
              <Trend
                current={row.safeDecisionRate}
                previous={row.previousSafeDecisionRate}
              />
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              Based on{' '}
              <strong className="font-bold text-navy-900">
                {row.responses.toLocaleString()}
              </strong>{' '}
              simulated responses across cohorts.
            </p>
            {needsReview && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[12px] leading-relaxed text-amber-700">
                Below the {REVIEW_THRESHOLD}% review threshold. Review the
                situation wording and debrief guidance.
              </p>
            )}
          </section>
        )}

        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Intended learning objective
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
            {objective}
          </p>
        </section>

        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            S.H.I.E.L.D. competencies practised
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {row.competencies.map((comp) => (
              <li
                key={comp}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-sunk px-2.5 py-1 text-[12px] font-bold text-navy-900"
              >
                <span
                  aria-hidden="true"
                  className="grid h-4 w-4 place-items-center rounded bg-navy-900 text-[9px] font-extrabold text-white"
                >
                  {COMPETENCY_LETTER[comp]}
                </span>
                {COMPETENCY_LABEL[comp]}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2 border-t border-line pt-4 text-[12.5px] text-ink-muted">
          <div className="flex justify-between">
            <span>Target cohort:</span>
            <span className="font-semibold text-navy-900">{row.targetGroup}</span>
          </div>
          <div className="flex justify-between">
            <span>Last updated:</span>
            <span className="font-semibold text-navy-900">{row.updatedOn}</span>
          </div>
          <div className="flex justify-between">
            <span>Author / Editor:</span>
            <span className="font-semibold text-navy-900">{row.updatedBy}</span>
          </div>
        </section>

        <section className="space-y-2 border-t border-line pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Facilitator actions (simulated)
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-line px-4 text-[13px] font-bold text-ink-muted transition hover:border-civic-300 hover:text-civic-700"
            >
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              Edit scenario draft
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-line px-4 text-[13px] font-bold text-ink-muted transition hover:border-civic-300 hover:text-civic-700"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Flag for peer review
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
