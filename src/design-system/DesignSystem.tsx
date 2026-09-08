import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export * from './Button';
export * from './Card';
export * from './PageHeader';
export * from './PageContainer';
export * from './BrandMark';
export * from './Section';

export type StatusKind =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'needs_changes'
  | 'high_risk'
  | 'medium_risk'
  | 'low_risk'
  | 'info';

/**
 * Status vocabulary for the facilitator portal.
 *
 * Each entry is a translucent tint of a semantic role rather than a light
 * `-50` tint of a raw ramp. That matters because `StatusBadge` is a shared
 * primitive: a fixed `bg-amber-50` renders as a near-white blob on the dark
 * game skin, whereas `--sq-earned` at 15% sits correctly on either ground.
 *
 * Every entry pairs its colour with BOTH an icon and a text label, so status
 * is never carried by colour alone.
 */
export const STATUS_CONFIG: Record<
  StatusKind,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-[var(--sq-surface-sunk)]',
    text: 'text-[var(--sq-ink-muted)]',
    border: 'border-[var(--sq-line-strong)]',
    icon: FileText,
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-[var(--sq-earned)]/15',
    text: 'text-[var(--sq-earned-text)]',
    border: 'border-[var(--sq-earned)]/40',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    bg: 'bg-[var(--sq-peer)]/15',
    text: 'text-[var(--sq-peer)]',
    border: 'border-[var(--sq-peer)]/40',
    icon: ShieldCheck,
  },
  published: {
    label: 'Published',
    bg: 'bg-[var(--sq-safe)]/15',
    text: 'text-[var(--sq-safe)]',
    border: 'border-[var(--sq-safe)]/40',
    icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    bg: 'bg-[var(--sq-surface-sunk)]',
    text: 'text-[var(--sq-ink-muted)]',
    border: 'border-[var(--sq-line)]',
    icon: XCircle,
  },
  needs_changes: {
    label: 'Needs Changes',
    bg: 'bg-[var(--sq-risk)]/15',
    text: 'text-[var(--sq-risk)]',
    border: 'border-[var(--sq-risk)]/40',
    icon: AlertTriangle,
  },
  high_risk: {
    label: 'High Risk',
    bg: 'bg-[var(--sq-risk)]/15',
    text: 'text-[var(--sq-risk)]',
    border: 'border-[var(--sq-risk)]/40',
    icon: ShieldAlert,
  },
  medium_risk: {
    label: 'Medium Risk',
    bg: 'bg-[var(--sq-earned)]/15',
    text: 'text-[var(--sq-earned-text)]',
    border: 'border-[var(--sq-earned)]/40',
    icon: AlertTriangle,
  },
  low_risk: {
    label: 'Low Risk',
    bg: 'bg-[var(--sq-safe)]/15',
    text: 'text-[var(--sq-safe)]',
    border: 'border-[var(--sq-safe)]/40',
    icon: Shield,
  },
  info: {
    label: 'Information',
    bg: 'bg-[var(--sq-action)]/15',
    text: 'text-[var(--sq-action-text)]',
    border: 'border-[var(--sq-action)]/40',
    icon: Info,
  },
};

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: {
  status: StatusKind;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1'
      : size === 'lg'
        ? 'text-xs px-3 py-1 gap-1.5'
        : 'text-[11px] px-2.5 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  trend = 'neutral',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="flex flex-col justify-between rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-[var(--sq-shadow-flat)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
          {title}
        </span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sq-action)]/15 text-[var(--sq-action-text)]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-black tracking-tight text-[var(--sq-ink)] sm:text-3xl">
          {value}
        </div>
        {(subtitle || change) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {change && (
              <span
                className={`font-extrabold ${
                  trend === 'up'
                    ? 'text-[var(--sq-safe)]'
                    : trend === 'down'
                      ? 'text-[var(--sq-risk)]'
                      : 'text-[var(--sq-ink-muted)]'
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-[var(--sq-ink-muted)]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function PrototypeNotice({ text }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--sq-earned-text)]">
      <Info className="h-3 w-3" />
      <span>{text ?? 'Illustrative Demonstration Data'}</span>
    </div>
  );
}

/**
 * A single headline figure with its source.
 *
 * Used for the crime and scam statistics that carry the "why now" of the
 * proposal (SPF Annual Crime Brief 2025 / Annual Scam and Cybercrime Brief
 * 2025). Attribution is a required prop, not an optional one: an unsourced
 * figure on a crime-prevention site is a liability, and evaluators check.
 */
export function Stat({
  value,
  label,
  source,
  inverse = false,
}: {
  value: string;
  label: string;
  source?: string;
  inverse?: boolean;
}) {
  return (
    <div
      className={`rounded-[16px] border p-5 ${
        inverse
          ? 'border-[var(--color-navy-800)] bg-[var(--color-navy-900)]'
          : 'border-[var(--sq-line)] bg-[var(--sq-surface)]'
      }`}
    >
      <div
        className={`text-3xl font-black tracking-tight sm:text-4xl ${
          inverse ? 'text-white' : 'text-[var(--sq-ink)]'
        }`}
      >
        {value}
      </div>
      <p
        className={`mt-1.5 text-sm font-semibold leading-snug ${
          inverse ? 'text-[var(--color-navy-200)]' : 'text-[var(--sq-ink-muted)]'
        }`}
      >
        {label}
      </p>
      {source && (
        <p
          className={`mt-3 border-t pt-2.5 text-[11px] font-medium ${
            inverse
              ? 'border-[var(--color-navy-800)] text-[var(--color-navy-200)]/70'
              : 'border-[var(--sq-line)] text-[var(--sq-ink-muted)]/75'
          }`}
        >
          {source}
        </p>
      )}
    </div>
  );
}
