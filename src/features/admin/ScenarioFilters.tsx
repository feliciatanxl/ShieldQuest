import { Search, X } from 'lucide-react';
import {
  COMPETENCY_LABEL,
  type Competency,
} from '../../../types/guardians.js';
import type {
  AdminScenarioRow,
  AdminScenarioStatus,
} from '../../../types/admin.js';

export interface ScenarioFilterState {
  query: string;
  status: AdminScenarioStatus | '';
  category: string;
  audience: string;
  skill: Competency | '';
}

export const EMPTY_FILTERS: ScenarioFilterState = {
  query: '',
  status: '',
  category: '',
  audience: '',
  skill: '',
};

const STATUSES: AdminScenarioStatus[] = ['LIVE', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];
const SKILLS = Object.keys(COMPETENCY_LABEL) as Competency[];

const selectCls =
  'min-h-[44px] rounded-lg border border-line-strong bg-surface px-3 py-2 text-[13px] text-ink outline-none transition focus:border-civic-500';
const labelCls =
  'block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft';

export function ScenarioFilters({
  filters,
  onChange,
  categories,
  audiences,
  shown,
  total,
}: {
  filters: ScenarioFilterState;
  onChange: (next: ScenarioFilterState) => void;
  categories: string[];
  audiences: string[];
  shown: number;
  total: number;
}) {
  const set = <K extends keyof ScenarioFilterState>(
    key: K,
    value: ScenarioFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  const active =
    filters.query !== '' ||
    filters.status !== '' ||
    filters.category !== '' ||
    filters.audience !== '' ||
    filters.skill !== '';

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="lib-search" className={labelCls}>
            Search scenarios
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
            <input
              id="lib-search"
              type="search"
              value={filters.query}
              onChange={(e) => set('query', e.target.value)}
              placeholder="Title, category or audience"
              className="min-h-[44px] w-full rounded-lg border border-line-strong bg-surface py-2 pl-9 pr-3 text-[14px] outline-none transition placeholder:text-ink-soft focus:border-civic-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lib-status" className={labelCls}>
            Status
          </label>
          <select
            id="lib-status"
            value={filters.status}
            onChange={(e) => set('status', e.target.value as AdminScenarioStatus | '')}
            className={`mt-1.5 ${selectCls}`}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lib-category" className={labelCls}>
            Category
          </label>
          <select
            id="lib-category"
            value={filters.category}
            onChange={(e) => set('category', e.target.value)}
            className={`mt-1.5 ${selectCls}`}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lib-audience" className={labelCls}>
            Audience
          </label>
          <select
            id="lib-audience"
            value={filters.audience}
            onChange={(e) => set('audience', e.target.value)}
            className={`mt-1.5 ${selectCls}`}
          >
            <option value="">All audiences</option>
            {audiences.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lib-skill" className={labelCls}>
            Skill
          </label>
          <select
            id="lib-skill"
            value={filters.skill}
            onChange={(e) => set('skill', e.target.value as Competency | '')}
            className={`mt-1.5 ${selectCls}`}
          >
            <option value="">All S.H.I.E.L.D. skills</option>
            {SKILLS.map((k) => (
              <option key={k} value={k}>
                {COMPETENCY_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[13px] text-ink-muted">
        <p>
          Showing <strong className="font-bold text-navy-900">{shown}</strong> of{' '}
          <strong className="font-bold text-navy-900">{total}</strong> scenarios
        </p>
        {active && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="inline-flex min-h-[44px] items-center gap-1 text-[12px] font-semibold text-civic-700 underline underline-offset-2"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export function applyScenarioFilters(
  rows: AdminScenarioRow[],
  f: ScenarioFilterState,
): AdminScenarioRow[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((r) => {
    if (q && !`${r.title} ${r.category} ${r.targetGroup}`.toLowerCase().includes(q)) {
      return false;
    }
    if (f.status && r.status !== f.status) return false;
    if (f.category && r.category !== f.category) return false;
    if (f.audience && r.targetGroup !== f.audience) return false;
    if (f.skill && !r.competencies.includes(f.skill)) return false;
    return true;
  });
}
