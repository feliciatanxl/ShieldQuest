import { useState } from 'react';
import { Check, ChevronDown, Info, RotateCcw, Sparkles, X } from 'lucide-react';
import type { AdminScenarioRow } from '../../../types/admin.js';

/**
 * AI drafting assistant for scenario content.
 *
 * WHY THIS SHAPE
 *
 * Writing 30–40 reviewed scenarios by hand is the slowest part of the project,
 * and a facilitator staring at an empty "situation prompt" field is the point
 * where content stalls. So the assistant drafts — it does not decide.
 *
 * Three constraints are built into the interaction rather than written in a
 * policy note, because a policy note is not enforcement:
 *
 *  1. NO PUBLISH PATH. Nothing here can set a scenario live. Accepting every
 *     suggestion still leaves a DRAFT that goes through the same educator
 *     review as anything else. The proposal commits to mandatory approval
 *     before publication and this must not become the exception.
 *
 *  2. FIELD BY FIELD. Suggestions are accepted one at a time, never as a
 *     block. A single "use all" button is how unreviewed text reaches a
 *     participant — the reviewer has to have looked at each piece to accept it.
 *
 *  3. PROVENANCE STICKS. Any accepted suggestion marks the scenario
 *     AI-assisted for the rest of its life, so the reviewer downstream knows
 *     which sentences were not written by a person.
 *
 * It also refuses two things outright, surfaced in the UI so the author knows
 * not to ask: it will not produce statistics or cite sources (every figure in
 * this product traces to a named SPF brief), and it will not write outcome
 * feedback that blames the participant.
 *
 * IMPLEMENTATION NOTE: `draftSuggestions` below is a local, deterministic
 * stand-in. There is no model wired up — this is the interaction design and
 * the guardrails, ready for a real endpoint to be dropped into that one
 * function. Nothing about the surrounding UI changes when it is.
 */

export type AiField = 'title' | 'prompt' | 'choices' | 'warnings' | 'debrief';

export interface AiSuggestion {
  field: AiField;
  label: string;
  /** What a reviewer specifically has to judge about this field. */
  check: string;
  value: string;
}

const FIELD_ORDER: AiField[] = ['title', 'prompt', 'choices', 'warnings', 'debrief'];

/**
 * Deterministic stand-in for a model call.
 *
 * Keyed off the scenario's own category and band so the output is coherent
 * with what the author is already working on, rather than generic filler.
 */
function draftSuggestions(row: Pick<AdminScenarioRow, 'category' | 'targetGroup'>): AiSuggestion[] {
  const tertiary = row.targetGroup.startsWith('Post-Secondary');

  return [
    {
      field: 'title',
      label: 'Title',
      check: 'Does it name the situation without giving away the answer?',
      value: tertiary ? 'The Commission That Needed My Account' : 'The Favour That Cost Me',
    },
    {
      field: 'prompt',
      label: 'Situation prompt',
      check: 'Is the warning sign findable here, rather than only in the debrief?',
      value: tertiary
        ? 'A contact from a group chat offers you a cut for receiving a payment and forwarding it on the same day. They have answered every question so far and say the company handles the paperwork. They need your account details before close of business.'
        : 'Someone you know asks you to hold something in your bag until after school. They say it is nothing, they are in a rush, and they will explain later. Two other people are watching.',
    },
    {
      field: 'choices',
      label: 'Response options',
      check: 'Is the safer option reachable without already knowing the answer?',
      value: [
        'A — Agree. It is quick and it settles the situation.',
        'B — Ask more questions, but stay in the conversation.',
        'C — Decline, and check with someone you already trust.',
      ].join('\n'),
    },
    {
      field: 'warnings',
      label: 'Warning signs',
      check: 'Are these observable in the prompt above, not just true in general?',
      value: [
        'Payment or a favour offered before anything is verified',
        'Pressure tied to a deadline that only the other person set',
        'A request that routes something through you rather than around you',
      ].join('\n'),
    },
    {
      field: 'debrief',
      label: 'Debrief note',
      check: 'Does it describe the tactic used, rather than the participant’s mistake?',
      value: tertiary
        ? 'Being paid to receive and pass on money makes you responsible for it, whatever you were told. The tactic here is patience — every question gets a reasonable answer, so the deadline does the work instead of the pressure.'
        : 'Holding something for someone transfers the consequence to you, not just the item. The tactic here is the audience: it is much harder to decline with people watching, which is exactly why the moment was chosen.',
    },
  ];
}

export function AiAssist({
  row,
  onAccept,
}: {
  row: Pick<AdminScenarioRow, 'category' | 'targetGroup'>;
  /** Called with a field the author accepted. The caller records provenance. */
  onAccept: (suggestion: AiSuggestion) => void;
}) {
  const [open, setOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [drafted, setDrafted] = useState<AiSuggestion[] | null>(null);
  const [working, setWorking] = useState(false);
  const [accepted, setAccepted] = useState<AiField[]>([]);
  const [dismissed, setDismissed] = useState<AiField[]>([]);

  const generate = () => {
    setWorking(true);
    setDismissed([]);
    // Stands in for the round trip. Kept visible because a draft that appears
    // instantly reads as canned rather than considered.
    setTimeout(() => {
      setDrafted(draftSuggestions(row));
      setWorking(false);
    }, 550);
  };

  const visible = (drafted ?? []).filter(
    (s) => !dismissed.includes(s.field) && !accepted.includes(s.field),
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[6px] border border-civic-200 bg-civic-50 px-3 text-[13px] font-bold text-civic-700 transition hover:border-civic-300 hover:bg-civic-100"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Draft with AI
      </button>
    );
  }

  return (
    <section
      aria-label="AI drafting assistant"
      className="rounded-[16px] border border-civic-200 bg-civic-50/60 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-civic-600 text-white"
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-[14px] font-extrabold text-navy-900">Draft with AI</h3>
            {/* The context is READ from the scenario, not typed again. Asking an
              * author to restate the category they already set is how the two
              * drift apart. */}
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              Drafting for{' '}
              <strong className="font-bold text-ink">{row.category}</strong> ·{' '}
              <strong className="font-bold text-ink">{row.targetGroup}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close AI assistant"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] text-ink-muted transition hover:bg-surface hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Limits, stated up front and collapsible. An author who knows what it
        * refuses stops asking for it. */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setLimitsOpen((v) => !v)}
          aria-expanded={limitsOpen}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-civic-700 hover:underline"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          What this will and will not do
          <ChevronDown
            className={`h-3.5 w-3.5 transition ${limitsOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {limitsOpen && (
          <ul className="mt-2.5 space-y-1.5 rounded-[10px] border border-line bg-surface p-3.5 text-[12px] leading-relaxed text-ink-muted">
            <li>
              <strong className="font-bold text-ink">Produces a draft only.</strong> It cannot
              publish, schedule or set anything live. Accepted text still goes through the same
              educator review as every other scenario.
            </li>
            <li>
              <strong className="font-bold text-ink">Accepted one field at a time.</strong> There
              is no "use everything" — you have to have read a suggestion to take it.
            </li>
            <li>
              <strong className="font-bold text-ink">Marks what it wrote.</strong> Any accepted
              suggestion flags the scenario as AI-assisted for the reviewer after you.
            </li>
            <li>
              <strong className="font-bold text-ink">Will not write statistics or cite
              sources.</strong> Every figure in this product traces to a named Singapore Police
              Force brief, added by a person.
            </li>
            <li>
              <strong className="font-bold text-ink">Will not blame the participant.</strong>{' '}
              Outcome feedback describes the tactic that was used, never what someone should have
              known.
            </li>
          </ul>
        )}
      </div>

      {/* Generate / regenerate */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={working}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[6px] bg-civic-600 px-4 text-[13px] font-bold text-white transition hover:bg-civic-700 disabled:opacity-60"
        >
          {working ? (
            'Drafting…'
          ) : drafted ? (
            <>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Draft again
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Draft suggestions
            </>
          )}
        </button>
        {accepted.length > 0 && (
          <span className="text-[12px] font-bold text-leaf-700">
            {accepted.length} of {FIELD_ORDER.length} fields taken
          </span>
        )}
      </div>

      {/* Suggestions */}
      {drafted && (
        <div aria-live="polite" className="mt-4 space-y-2.5">
          {visible.length === 0 ? (
            <p className="rounded-[10px] border border-line bg-surface p-3.5 text-[13px] leading-relaxed text-ink-muted">
              {accepted.length > 0
                ? 'Every suggestion has been taken or dismissed. The scenario is still a draft — it needs a review before it can go live.'
                : 'All suggestions dismissed. Draft again for a different angle.'}
            </p>
          ) : (
            visible.map((s) => (
              <article
                key={s.field}
                className="rounded-[10px] border border-line bg-surface p-3.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                    {s.label}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDismissed((prev) => [...prev, s.field]);
                      }}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-[6px] px-2 text-[12px] font-bold text-ink-muted transition hover:bg-surface-sunk hover:text-ink"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAccept(s);
                        setAccepted((prev) => [...prev, s.field]);
                      }}
                      className="inline-flex min-h-[32px] items-center gap-1 rounded-[6px] border border-leaf-200 bg-leaf-50 px-2.5 text-[12px] font-bold text-leaf-700 transition hover:bg-leaf-100"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Use this
                    </button>
                  </div>
                </div>

                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink">
                  {s.value}
                </p>

                {/* The reviewer's job for this specific field, not a generic
                  * "please review" — that gets skipped. */}
                <p className="mt-2.5 border-t border-line pt-2 text-[12px] leading-snug text-ink-soft">
                  <strong className="font-bold text-ink-muted">Check:</strong> {s.check}
                </p>
              </article>
            ))
          )}
        </div>
      )}

      <p className="mt-3.5 text-[11px] leading-relaxed text-ink-soft">
        Interaction design with a local stand-in for the model. No content leaves this browser and
        no participant data is ever sent to a model.
      </p>
    </section>
  );
}

/** Badge shown wherever an AI-assisted scenario appears, including the queue. */
export function AiAssistedBadge({ fields }: { fields: AiField[] }) {
  if (fields.length === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[6px] border border-civic-200 bg-civic-50 px-2 py-0.5 text-[11px] font-bold text-civic-700"
      title={`AI-drafted: ${fields.join(', ')}. Needs human review.`}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      AI-assisted · needs review
    </span>
  );
}
