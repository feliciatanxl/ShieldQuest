import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileWarning,
  LayoutDashboard,
  ListChecks,
  Lock,
  PlusCircle,
  Radio,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sprout,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  AdminSection as SectionId,
  Insight,
  PortalSummary,
} from '../../../types/admin.js';

export const ADMIN_NAV: {
  id: SectionId;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sessions', label: 'Live Sessions', icon: Radio },
  { id: 'library', label: 'Scenario Library', icon: ListChecks },
  { id: 'builder', label: 'Scenario Builder', icon: PlusCircle },
  { id: 'review', label: 'Content Review', icon: ClipboardCheck },
  { id: 'youth', label: 'Youth-Created Missions', icon: Sprout },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];

export function AdminSidebar({
  active,
  onSelect,
  reviewCount,
  youthCount,
}: {
  active: SectionId;
  onSelect: (section: SectionId) => void;
  reviewCount: number;
  /** Youth submissions still awaiting a reviewer decision. */
  youthCount: number;
}) {
  return (
    <aside className="shrink-0 border-b border-line bg-surface lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-[272px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="hidden items-center gap-2.5 px-5 py-5 lg:flex">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 shadow-sm"
        >
          <Shield className="h-4.5 w-4.5 text-amber-400" />
        </span>
        <div>
          <p className="text-[13px] font-black uppercase tracking-tight text-navy-950">
            Shield<span className="text-civic-600">Quest</span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Admin Portal
          </p>
        </div>
      </div>

      <nav aria-label="Portal sections" className="px-3 py-3 lg:py-0">
        <ul className="flex gap-1.5 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
          {ADMIN_NAV.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[14px] font-semibold transition ${
                    isActive
                      ? 'bg-civic-50 text-civic-700 ring-1 ring-civic-200'
                      : 'text-ink-muted hover:bg-canvas hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-left">{label}</span>
                  {id === 'review' && reviewCount > 0 && (
                    <span className="ml-auto shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 tabular-nums">
                      {reviewCount}
                    </span>
                  )}
                  {id === 'youth' && youthCount > 0 && (
                    <span className="ml-auto shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 tabular-nums">
                      {youthCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden px-5 pb-5 pt-6 lg:block">
        <DataSafeguardCard compact />
      </div>
    </aside>
  );
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  note: string;
  icon?: LucideIcon;
  tone?: 'neutral' | 'attention';
}) {
  const isAttention = tone === 'attention';
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-surface p-4 transition ${
        isAttention ? 'border-amber-200' : 'border-line'
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isAttention ? 'bg-amber-500' : 'bg-transparent'
        }`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </p>
        {Icon && (
          <span
            aria-hidden="true"
            className={`grid h-8 w-8 place-items-center rounded-lg ${
              isAttention
                ? 'bg-amber-50 text-amber-700'
                : 'bg-surface-sunk text-ink-soft'
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p
        className={`mt-2 text-2xl font-extrabold tracking-tight tabular-nums ${
          isAttention ? 'text-amber-700' : 'text-navy-900'
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{note}</p>
    </div>
  );
}

export function PortalSummaryRow({ summary }: { summary: PortalSummary }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Active scenarios"
        value={summary.activeScenarios}
        note="Published and in circulation across cohorts."
        icon={ListChecks}
      />
      <MetricCard
        label="Demonstration participants"
        value={summary.participants.toLocaleString()}
        note="Youth in the pilot cohort (simulated)."
        icon={Users}
      />
      <MetricCard
        label="Average safe decision rate"
        value={`${summary.averageSafeDecisionRate}%`}
        note="Across all live scored content (simulated)."
        icon={ShieldCheck}
      />
      <MetricCard
        label="Content needing review"
        value={summary.needsReview}
        note="Scoring below 60% safe decision rate."
        icon={FileWarning}
        tone={summary.needsReview > 0 ? 'attention' : 'neutral'}
      />
    </div>
  );
}

export function AdminSection({
  title,
  description,
  badge,
  action,
  children,
}: {
  title: string;
  description?: string;
  badge?: { value: number; tone?: 'neutral' | 'attention' };
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-extrabold tracking-tight text-navy-900">
              {title}
            </h2>
            {badge && (
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                  badge.tone === 'attention'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-surface-sunk text-ink-muted'
                }`}
              >
                {badge.value}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  const tone =
    insight.kind === 'SUPPORT'
      ? 'border-amber-200 bg-amber-50/50'
      : insight.kind === 'IMPROVED'
        ? 'border-leaf-200 bg-leaf-50/50'
        : 'border-civic-200 bg-civic-50/50';

  const badgeTone =
    insight.kind === 'SUPPORT'
      ? 'bg-amber-100 text-amber-700'
      : insight.kind === 'IMPROVED'
        ? 'bg-leaf-100 text-leaf-700'
        : 'bg-civic-100 text-civic-700';

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <span
        className={`inline-block rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${badgeTone}`}
      >
        {insight.label}
      </span>
      <h3 className="mt-2 text-[15px] font-bold text-navy-900">
        {insight.subject}
      </h3>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 tabular-nums">
        {insight.value}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
        {insight.note}
      </p>
    </div>
  );
}

export function SimulatedDataNote({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      <p className="text-[12.5px] leading-relaxed text-amber-700">
        {children ?? (
          <>
            <strong className="font-bold">Prototype / simulated data.</strong>{' '}
            Content analytics only — no individual responses, participants or risk
            scores are shown anywhere in this portal.
          </>
        )}
      </p>
    </div>
  );
}

export function DataSafeguardCard({
  items,
  compact = false,
  onResetDemo,
}: {
  items?: string[];
  compact?: boolean;
  onResetDemo?: () => void;
}) {
  const defaultItems = [
    'Aggregate learning analytics only',
    'No crime prediction',
    'No individual youth profiling',
    'Simulated scenario data',
    'Youth submissions reviewed before drafting',
  ];
  const list = items ?? defaultItems;

  if (compact) {
    return (
      <div className="rounded-xl border border-line bg-surface-sunk p-3.5">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-civic-700">
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          Safeguards in place
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
          Aggregate analytics only. No personal data or crime prediction.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h3 className="text-[15px] font-extrabold text-navy-900">
            Data safeguards &amp; ethics
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            How Project SHIELD handles information and why this build is safe to
            explore.
          </p>
        </div>
        {onResetDemo && (
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] font-semibold text-ink-muted transition hover:border-coral-200 hover:text-coral-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset demo storage
          </button>
        )}
      </div>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {list.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[13px] text-ink-muted"
          >
            <span
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-600"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
