import { Lock } from 'lucide-react';
import {
  TARGET_GROUP_AGE,
  type GroupDecisionSignal,
} from '../../../types/admin.js';

function SummaryTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{note}</p>
    </div>
  );
}

export function GroupDecisionSignalPanel({
  signals,
}: {
  signals: GroupDecisionSignal[];
}) {
  const reconsideredAverage = signals.length
    ? Math.round(
        signals.reduce((sum, s) => sum + s.reconsideredPct, 0) / signals.length,
      )
    : 0;

  return (
    <div className="space-y-3">
      <p className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Simulated facilitated sessions · no live multiplayer exists
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Reconsidered after discussion"
          value={`${reconsideredAverage}%`}
          note="Average across the simulated questions below. A question nobody moves on is usually too obvious to be worth asking."
        />
        <SummaryTile
          label="Questions run"
          value={signals.length}
          note="Facilitated Think · Vote · Explain questions in the demonstration set."
        />
        <SummaryTile
          label="Participant records held"
          value="0"
          note="Aggregate only. No individual response, history or profile is stored or displayed."
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-sunk text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th scope="col" className="px-4 py-3">Question</th>
                <th scope="col" className="px-4 py-3">Audience</th>
                <th scope="col" className="px-4 py-3 text-right">Responses</th>
                <th scope="col" className="px-4 py-3 text-center">Initial safe</th>
                <th scope="col" className="px-4 py-3 text-center">Final safe</th>
                <th scope="col" className="px-4 py-3 text-center">Reconsidered</th>
                <th scope="col" className="px-4 py-3">Top factor cited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-[13px]">
              {signals.map((signal) => {
                const delta = signal.finalSafePct - signal.initialSafePct;
                return (
                  <tr key={signal.id} className="hover:bg-surface-sunk">
                    <td className="px-4 py-3 font-semibold text-navy-900">
                      {signal.question}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {signal.band}{' '}
                      <span className="text-[11.5px] text-ink-soft">
                        {TARGET_GROUP_AGE[signal.band]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                      {signal.responses.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-ink-muted">
                      {signal.initialSafePct}%
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-bold text-leaf-700">
                      {signal.finalSafePct}%{' '}
                      {delta > 0 && (
                        <span className="text-[11px] font-semibold text-leaf-600">
                          (+{delta})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-bold text-civic-700">
                      {signal.reconsideredPct}%
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-ink-muted">
                      “{signal.topFactor}”
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
