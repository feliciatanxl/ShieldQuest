import { Info, Lock } from 'lucide-react';
import { bandBreakdown, choiceBreakdown } from './scenario-insights';
import { REVIEW_THRESHOLD } from './ScenarioTable';
import type { AdminScenarioRow } from '../../../types/admin.js';

/**
 * "Inspect responses" — the DATA half of a content review.
 *
 * Answers one question: where is this scenario losing people? Nothing here is
 * editorial; the wording lives under Review content. The two used to be the
 * same view behind two buttons that both called `onSelect(row)`, which is why
 * neither answered its own question well.
 *
 * Every figure is a cohort aggregate. There is no per-participant row here and
 * no way to reach one — see the note at the foot of the panel, which states
 * that plainly to the facilitator rather than leaving it implied.
 */

function Stat({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'neutral' | 'attention';
}) {
  return (
    <div
      className={`rounded-[10px] border p-3.5 ${
        tone === 'attention'
          ? 'border-amber-200 bg-amber-50'
          : 'border-line bg-surface-sunk'
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-[22px] font-black tabular-nums leading-none text-navy-900">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[12px] leading-snug text-ink-muted">{sub}</p>}
    </div>
  );
}

export function ScenarioResponsesPanel({ row }: { row: AdminScenarioRow }) {
  const choices = choiceBreakdown(row);
  const bands = bandBreakdown(row);
  const diff = row.safeDecisionRate - row.previousSafeDecisionRate;
  const hasPrevious = row.previousSafeDecisionRate > 0;

  // The distractor that pulled hardest is the actionable finding: it tells a
  // reviewer which sentence is doing the damage.
  const topDistractor = choices
    .filter((c) => !c.safe)
    .sort((a, b) => b.share - a.share)[0];

  const weakestBand = [...bands].sort((a, b) => a.safeRate - b.safeRate)[0];

  return (
    <div className="space-y-5">
      {/* Headline figures */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Safe decision rate"
          value={`${row.safeDecisionRate}%`}
          sub={`Review threshold ${REVIEW_THRESHOLD}%`}
          tone={row.safeDecisionRate < REVIEW_THRESHOLD ? 'attention' : 'neutral'}
        />
        <Stat
          label="Direction"
          value={hasPrevious ? `${diff > 0 ? '+' : ''}${diff} pts` : '—'}
          sub={hasPrevious ? 'Since the last review cycle' : 'No previous cycle to compare'}
        />
        <Stat
          label="Responses"
          value={row.responses.toLocaleString()}
          sub="Aggregated across all cohorts"
        />
        <Stat
          label="Hardest band"
          value={`${weakestBand.safeRate}%`}
          sub={weakestBand.band}
          tone={weakestBand.safeRate < REVIEW_THRESHOLD ? 'attention' : 'neutral'}
        />
      </div>

      {/* Where the responses actually went */}
      <section>
        <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
          Where responses went
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          Two unsafe options rather than one, because the useful question is not how many chose
          wrongly but <em>which</em> wrong answer was attractive.
        </p>

        <ul className="mt-4 space-y-3.5">
          {choices.map((choice) => (
            <li key={choice.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-[13px] font-bold text-ink">
                  <span className="text-ink-muted">{choice.key}.</span> {choice.label}
                  {choice.safe && (
                    <span className="ml-2 rounded-[6px] bg-leaf-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-leaf-700">
                      Safer
                    </span>
                  )}
                </span>
                <span
                  className={`text-[13px] font-black tabular-nums ${
                    choice.safe ? 'text-leaf-700' : 'text-coral-700'
                  }`}
                >
                  {choice.share}%
                  <span className="ml-1.5 font-bold text-ink-soft">
                    {choice.count.toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-sunk">
                <div
                  className={`h-full rounded-full ${
                    choice.safe ? 'bg-leaf-600' : 'bg-coral-600'
                  }`}
                  style={{ width: `${choice.share}%` }}
                />
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">{choice.pull}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The one sentence a reviewer can act on */}
      {topDistractor && topDistractor.share >= 25 && (
        <div className="flex gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-amber-800">
            <strong className="font-bold">
              {topDistractor.share}% chose “{topDistractor.label}”.
            </strong>{' '}
            When one unsafe option pulls this hard, the fix is usually in how that option is
            worded — not in adding another warning sign. Open <em>Review content</em> to see it in
            context.
          </p>
        </div>
      )}

      {/* Per-band split */}
      <section>
        <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
          By learner band
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          A single overall rate hides whether a scenario is simply pitched at the wrong age. This
          one is authored for <strong className="font-bold text-ink">{row.targetGroup}</strong>.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-[13px]">
            <caption className="sr-only">
              Safe decision rate and response count by learner band
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-line pb-2 pr-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft"
                >
                  Band
                </th>
                <th
                  scope="col"
                  className="border-b border-line pb-2 pr-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-soft"
                >
                  Safe rate
                </th>
                <th
                  scope="col"
                  className="border-b border-line pb-2 text-right text-[11px] font-bold uppercase tracking-wider text-ink-soft"
                >
                  Responses
                </th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => {
                const authored = band.band === row.targetGroup;
                const below = band.safeRate < REVIEW_THRESHOLD;
                return (
                  <tr key={band.band}>
                    <th
                      scope="row"
                      className="border-b border-line py-2.5 pr-3 text-left font-semibold text-ink"
                    >
                      {band.band}
                      {authored && (
                        <span className="ml-2 rounded-[6px] bg-civic-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-civic-700">
                          Authored for
                        </span>
                      )}
                    </th>
                    <td className="border-b border-line py-2.5 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-20 shrink-0 overflow-hidden rounded-full bg-surface-sunk">
                          <span
                            className={`block h-full rounded-full ${
                              below ? 'bg-amber-500' : 'bg-leaf-600'
                            }`}
                            style={{ width: `${band.safeRate}%` }}
                          />
                        </span>
                        <span
                          className={`font-black tabular-nums ${
                            below ? 'text-amber-700' : 'text-ink'
                          }`}
                        >
                          {band.safeRate}%
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-line py-2.5 text-right tabular-nums text-ink-muted">
                      {band.responses.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stated, not implied. */}
      <p className="flex items-start gap-2 rounded-[10px] border border-line bg-surface-sunk p-3.5 text-[12px] leading-relaxed text-ink-muted">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Every figure on this panel is a cohort total. There is no individual response, no
          participant identifier and no way to reach one from here — by design, not by policy
          alone. Simulated session data.
        </span>
      </p>
    </div>
  );
}
