import { MetricCard } from './AdminChrome';
import type { EngagementMetric } from '../../../types/admin.js';

export function EngagementPanel({ metrics }: { metrics: EngagementMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          note={metric.note}
        />
      ))}
    </div>
  );
}
