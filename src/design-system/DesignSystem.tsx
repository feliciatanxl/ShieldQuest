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

export const STATUS_CONFIG: Record<
  StatusKind,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: FileText,
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300',
    icon: ShieldCheck,
  },
  published: {
    label: 'Published',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
    icon: XCircle,
  },
  needs_changes: {
    label: 'Needs Changes',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: AlertTriangle,
  },
  high_risk: {
    label: 'High Risk',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
    icon: ShieldAlert,
  },
  medium_risk: {
    label: 'Medium Risk',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: AlertTriangle,
  },
  low_risk: {
    label: 'Low Risk',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: Shield,
  },
  info: {
    label: 'Information',
    bg: 'bg-civic-50',
    text: 'text-civic-700',
    border: 'border-civic-200',
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
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-civic-50 text-civic-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </div>
        {(subtitle || change) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {change && (
              <span
                className={`font-extrabold ${
                  trend === 'up'
                    ? 'text-emerald-600'
                    : trend === 'down'
                      ? 'text-rose-600'
                      : 'text-slate-500'
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function PrototypeNotice({ text }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">
      <Info className="h-3 w-3 text-amber-700" />
      <span>{text ?? 'Illustrative Demonstration Data'}</span>
    </div>
  );
}
