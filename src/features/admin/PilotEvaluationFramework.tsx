import { CircleDashed, FlaskConical, ShieldCheck } from 'lucide-react';
import {
  KPI_STATUS_LABEL,
  type KpiStatus,
  type PilotKpi,
} from '../../../types/admin.js';

const STATUS_STYLE: Record<
  KpiStatus,
  { skin: string; Icon: typeof ShieldCheck }
> = {
  DEMONSTRATED: {
    skin: 'border-leaf-200 bg-leaf-50 text-leaf-700',
    Icon: ShieldCheck,
  },
  SIMULATED: {
    skin: 'border-amber-200 bg-amber-50 text-amber-700',
    Icon: FlaskConical,
  },
  PLANNED: {
    skin: 'border-line-strong bg-surface-sunk text-ink-soft',
    Icon: CircleDashed,
  },
};

export function KpiStatusBadge({ status }: { status: KpiStatus }) {
  const { skin, Icon } = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${skin}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {KPI_STATUS_LABEL[status]}
    </span>
  );
}

export function PilotEvaluationFramework({ kpis }: { kpis: PilotKpi[] }) {
  return (
    <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <li
          key={kpi.id}
          className="flex h-full flex-col rounded-[16px] border border-line bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-civic-700">
              KPI {kpi.number}
            </span>
            <KpiStatusBadge status={kpi.status} />
          </div>

          <h3 className="mt-2 text-[15px] font-bold text-navy-900">
            {kpi.name}
          </h3>

          <p className="mt-1 text-[13px] leading-relaxed text-ink">
            {kpi.measures}
          </p>

          <div className="mt-auto border-t border-line pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              Measurement method
            </span>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              {kpi.method}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
