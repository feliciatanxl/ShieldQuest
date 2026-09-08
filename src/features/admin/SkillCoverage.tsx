import {
  COMPETENCY_LABEL,
  COMPETENCY_LETTER,
} from '../../../types/guardians.js';
import type { SkillCoverage } from '../../../types/admin.js';

export function SkillCoverageChart({ rows }: { rows: SkillCoverage[] }) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-4">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.competency}>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] bg-navy-900 text-[11px] font-extrabold text-white"
              >
                {COMPETENCY_LETTER[row.competency]}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                {COMPETENCY_LABEL[row.competency]}
              </span>
              <span className="shrink-0 text-[13px] font-bold tabular-nums text-navy-900">
                {row.coverage}%
              </span>
              <span className="hidden w-[92px] shrink-0 text-right text-[12px] tabular-nums text-ink-soft sm:block">
                {row.scenarios} scenario{row.scenarios === 1 ? '' : 's'}
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line"
              aria-hidden="true"
            >
              <div
                className={`h-full rounded-full ${
                  row.coverage >= 75
                    ? 'bg-leaf-600'
                    : row.coverage >= 60
                      ? 'bg-civic-600'
                      : 'bg-amber-500'
                }`}
                style={{ width: `${row.coverage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-muted">
        Skill coverage measures how thoroughly our published scenarios teach each
        prevention competency. Aggregated across content only.
      </p>
    </div>
  );
}
