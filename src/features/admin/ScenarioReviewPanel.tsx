import { useState } from 'react';
import { CheckCircle2, ClipboardCheck, MessageSquareWarning, PencilLine } from 'lucide-react';
import { AiAssist, AiAssistedBadge, type AiField, type AiSuggestion } from './AiAssist';
import { reviewChecklist } from './scenario-insights';
import { REVIEW_THRESHOLD } from './ScenarioTable';
import type { AdminScenarioRow } from '../../../types/admin.js';

/**
 * "Review content" — the EDITORIAL half of a content review.
 *
 * Answers a different question from the Responses panel: not where people went
 * wrong, but which sentence to change. So it leads with the reviewer's
 * checklist rather than with numbers, because a reviewer who opens this
 * already knows the rate is low — what they need is the order to look in.
 *
 * The checklist is the point of the screen. A "Review content" button that
 * opens a read-only page teaches reviewers that review means reading, and the
 * project's safeguards (risk must be discoverable, safer option reachable,
 * feedback never victim-blaming) then depend on someone remembering them.
 * Here they are the interface.
 */

type Decision = 'none' | 'changes' | 'keep';

export function ScenarioReviewPanel({ row }: { row: AdminScenarioRow }) {
  const checks = reviewChecklist(row);
  const [done, setDone] = useState<string[]>([]);
  const [decision, setDecision] = useState<Decision>('none');
  const [note, setNote] = useState('');
  const [aiFields, setAiFields] = useState<AiField[]>([]);
  const [aiTaken, setAiTaken] = useState<AiSuggestion[]>([]);

  const allChecked = done.length === checks.length;

  const toggle = (id: string) =>
    setDone((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const acceptAi = (s: AiSuggestion) => {
    setAiFields((prev) => (prev.includes(s.field) ? prev : [...prev, s.field]));
    setAiTaken((prev) => [...prev.filter((p) => p.field !== s.field), s]);
  };

  return (
    <div className="space-y-5">
      {/* Why this is in the queue, in one sentence */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
        <p className="text-[13px] leading-relaxed text-amber-800">
          <strong className="font-bold">
            {row.safeDecisionRate}% safe, below the {REVIEW_THRESHOLD}% threshold.
          </strong>{' '}
          This reflects how clearly the content teaches — not the young people who answered it.
        </p>
        {aiFields.length > 0 && <AiAssistedBadge fields={aiFields} />}
      </div>

      {/* THE CHECKLIST — the actual work of a review */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
            Reviewer checklist
          </h3>
          <span
            className={`text-[12px] font-bold tabular-nums ${
              allChecked ? 'text-leaf-700' : 'text-ink-muted'
            }`}
          >
            {done.length} of {checks.length}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          In this order — it catches the most common problems first.
        </p>

        <ul className="mt-4 space-y-2">
          {checks.map((check) => {
            const isDone = done.includes(check.id);
            return (
              <li key={check.id}>
                <label
                  className={`flex cursor-pointer gap-3 rounded-[10px] border p-3.5 transition ${
                    isDone
                      ? 'border-leaf-200 bg-leaf-50'
                      : 'border-line bg-surface hover:border-line-strong'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggle(check.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--sq-safe-fill)]"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-[13px] font-bold ${
                        isDone ? 'text-leaf-800' : 'text-ink'
                      }`}
                    >
                      {check.question}
                    </span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-ink-soft">
                      {check.why}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Rewriting help, sitting exactly where the reviewer decides to rewrite */}
      <section className="border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
            Rewrite
          </h3>
        </div>
        <p className="mt-1 max-w-[70ch] text-[13px] leading-relaxed text-ink-muted">
          If the checklist points at the wording, draft a replacement here. Suggestions are taken
          one field at a time and anything you accept stays a draft.
        </p>
        <div className="mt-3">
          <AiAssist row={row} onAccept={acceptAi} />
        </div>

        {aiTaken.length > 0 && (
          <div className="mt-4 rounded-[10px] border border-line bg-surface-sunk p-3.5">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
              Staged for this scenario
            </h4>
            <dl className="mt-2 space-y-2.5">
              {aiTaken.map((s) => (
                <div key={s.field}>
                  <dt className="text-[12px] font-bold text-ink">{s.label}</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 border-t border-line pt-2.5 text-[12px] leading-relaxed text-ink-soft">
              Staged only. Saving records a new DRAFT version — the live scenario participants see
              does not change until it is approved.
            </p>
          </div>
        )}
      </section>

      {/* Decision */}
      <section className="border-t border-line pt-5">
        <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-navy-900">
          Decision
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDecision('changes')}
            aria-pressed={decision === 'changes'}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-[6px] border px-3.5 text-[13px] font-bold transition ${
              decision === 'changes'
                ? 'border-amber-400 bg-amber-50 text-amber-800'
                : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />
            Request changes
          </button>
          <button
            type="button"
            onClick={() => setDecision('keep')}
            aria-pressed={decision === 'keep'}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-[6px] border px-3.5 text-[13px] font-bold transition ${
              decision === 'keep'
                ? 'border-leaf-400 bg-leaf-50 text-leaf-800'
                : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Keep live, reviewed
          </button>
        </div>

        {decision !== 'none' && (
          <div className="mt-3.5">
            <label
              htmlFor="review-note"
              className="block text-[12px] font-bold uppercase tracking-wider text-ink-muted"
            >
              {decision === 'changes'
                ? 'What needs to change'
                : 'Why it is right to keep this live'}
            </label>
            <textarea
              id="review-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                decision === 'changes'
                  ? 'e.g. Option B reads as the cautious answer. Make staying in the conversation clearly costly.'
                  : 'e.g. Rate is low because the scenario is genuinely hard, and the debrief lands. Recheck next cycle.'
              }
              className="mt-1.5 w-full rounded-[6px] border border-line-strong bg-surface p-3 text-[13px] leading-relaxed text-ink outline-none transition placeholder:text-ink-soft focus:border-civic-500"
            />

            {/* The gate, stated where the decision is made. */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-[52ch] text-[12px] leading-relaxed text-ink-soft">
                {allChecked
                  ? 'Checklist complete.'
                  : `${checks.length - done.length} checklist item${
                      checks.length - done.length === 1 ? '' : 's'
                    } still open.`}{' '}
                A decision is recorded against your name and this review cycle.
              </p>
              <button
                type="button"
                disabled={!allChecked || note.trim().length === 0}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] bg-navy-900 px-4 text-[13px] font-bold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Record decision
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
        <PencilLine className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Recording a decision does not change what participants see. Publishing a revised
          scenario is a separate, deliberate step. Simulated session data.
        </span>
      </p>
    </div>
  );
}
