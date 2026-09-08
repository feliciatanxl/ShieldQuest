import { Zap } from 'lucide-react';
import { STATUS_STYLES } from './ScenarioTable';
import type { AdminScenarioRow } from '../../../types/admin.js';

export function AdminRecentContent({
  rows,
  onSelect,
  highlightId,
}: {
  rows: AdminScenarioRow[];
  onSelect: (row: AdminScenarioRow) => void;
  highlightId?: string | null;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[10px] border border-line bg-surface px-4 py-8 text-center">
        <p className="text-[14px] font-semibold text-ink-muted">
          No content yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row)}
              className={`flex min-h-[44px] w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left transition hover:bg-surface-sunk ${
                row.id === highlightId ? 'bg-civic-50' : ''
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-[14px] font-bold text-navy-900">
                  {row.title}
                </span>
                {row.isFlashMission && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-[6px] border border-civic-200 bg-civic-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-civic-700">
                    <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                    Flash
                  </span>
                )}
              </span>
              <span className="text-[12px] text-ink-muted">{row.category}</span>
              <span
                className={`inline-block rounded-[6px] border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${STATUS_STYLES[row.status]}`}
              >
                {row.status}
              </span>
              <span className="text-[12px] text-ink-soft">{row.updatedOn}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
