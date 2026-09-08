import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { REVIEW_THRESHOLD } from './ScenarioTable';
import type { AdminScenarioRow } from '../../../types/admin.js';

export function AdminNeedsAttention({
  rows,
  onOpenReview,
  onSelect,
}: {
  rows: AdminScenarioRow[];
  onOpenReview: () => void;
  onSelect: (row: AdminScenarioRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[16px] border border-leaf-200 bg-leaf-50 p-4">
        <p className="flex items-center gap-2 text-[14px] font-bold text-leaf-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          No content is below the review threshold
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          Every live scenario is teaching at or above {REVIEW_THRESHOLD}%.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-amber-200 bg-surface">
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-amber-50"
            >
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-navy-900">
                  {row.title}
                </span>
                <span className="block text-[12px] text-ink-muted">
                  {row.category} · {row.targetGroup}
                </span>
              </div>
              <span className="shrink-0 rounded-[6px] bg-amber-100 px-2 py-0.5 text-[12px] font-bold tabular-nums text-amber-700">
                {row.safeDecisionRate}% safe
              </span>
              <span className="hidden shrink-0 text-[12px] text-ink-soft sm:block">
                {row.responses.toLocaleString()} responses
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-line bg-surface-sunk px-4 py-2.5 text-right">
        <button
          type="button"
          onClick={onOpenReview}
          className="inline-flex min-h-[40px] items-center gap-1 text-[13px] font-bold text-civic-700 underline underline-offset-2"
        >
          Open Content Review queue
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
