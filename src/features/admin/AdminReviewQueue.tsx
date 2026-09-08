import {
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { REVIEW_THRESHOLD } from './ScenarioTable';
import type { AdminScenarioRow } from '../../../types/admin.js';

function reasonFor(row: AdminScenarioRow): string {
  const diff = row.safeDecisionRate - row.previousSafeDecisionRate;
  if (row.previousSafeDecisionRate > 0 && diff < 0) {
    return `Safe decision rate has fallen ${Math.abs(diff)} points and is below the ${REVIEW_THRESHOLD}% content-review threshold.`;
  }
  if (row.previousSafeDecisionRate > 0 && diff === 0) {
    return `Safe decision rate has not moved since the last cycle and remains below the ${REVIEW_THRESHOLD}% content-review threshold.`;
  }
  return `Safe decision rate is below the ${REVIEW_THRESHOLD}% content-review threshold.`;
}

export function AdminReviewQueue({
  rows,
  onInspect,
  onReview,
}: {
  rows: AdminScenarioRow[];
  /** Opens the aggregate response data — where is this losing people? */
  onInspect: (row: AdminScenarioRow) => void;
  /** Opens the editorial review — which sentence do I change? */
  onReview: (row: AdminScenarioRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[10px] border border-leaf-200 bg-leaf-50 px-5 py-10 text-center">
        <CheckCircle2
          className="mx-auto h-6 w-6 text-leaf-700"
          aria-hidden="true"
        />
        <p className="mt-2 text-[15px] font-bold text-leaf-700">
          Nothing is awaiting review
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          No live scenario is currently below the {REVIEW_THRESHOLD}% threshold.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const diff = row.safeDecisionRate - row.previousSafeDecisionRate;
        const hasPrevious = row.previousSafeDecisionRate > 0;
        const Icon = !hasPrevious || diff === 0 ? Minus : diff > 0 ? TrendingUp : TrendingDown;

        return (
          <li
            key={row.id}
            className="overflow-hidden rounded-[16px] border border-amber-200 bg-surface"
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-[6px] bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                      Needs review
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      {row.category} · {row.targetGroup}
                    </span>
                  </div>
                  <h3 className="mt-1 text-[17px] font-extrabold text-navy-900">
                    {row.title}
                  </h3>
                </div>

                <div className="flex items-baseline gap-3 rounded-[6px] border border-line bg-surface-sunk px-3 py-1.5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      Safe rate
                    </span>
                    <p className="text-xl font-extrabold text-amber-700 tabular-nums">
                      {row.safeDecisionRate}%
                    </p>
                  </div>
                  <div className="border-l border-line pl-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                      Change
                    </span>
                    <p
                      className={`flex items-center gap-0.5 text-[13px] font-bold tabular-nums ${
                        !hasPrevious || diff === 0
                          ? 'text-ink-soft'
                          : diff > 0
                            ? 'text-leaf-700'
                            : 'text-coral-700'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {!hasPrevious
                        ? 'New'
                        : diff === 0
                          ? '0'
                          : `${diff > 0 ? '+' : ''}${diff}`}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
                {reasonFor(row)}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-[12px] text-ink-soft">
                  {row.responses.toLocaleString()} responses recorded across cohorts
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onInspect(row)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] border border-line px-3 text-[13px] font-bold text-ink-muted transition hover:border-civic-300 hover:text-civic-700"
                  >
                    <FileBarChart className="h-4 w-4" aria-hidden="true" />
                    Inspect responses
                  </button>
                  <button
                    type="button"
                    onClick={() => onReview(row)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] bg-navy-900 px-3.5 text-[13px] font-bold text-white transition hover:bg-navy-800"
                  >
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    Review content
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
