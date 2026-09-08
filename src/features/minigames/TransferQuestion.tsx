import { useState } from 'react';
import { Check, Lightbulb, X } from 'lucide-react';
import { SectionLabel } from '../../components/SkillBadges';
import type { TransferQuestion as Question } from '../../../types/minigames';

/**
 * The step that makes a mini-game worth playing.
 *
 * Finding words in a grid is recognition. This asks the player to place the
 * pattern back into a situation they have actually played, which is the only
 * part of a mini-game that transfers to a real decision.
 *
 * Options are styled identically until one is chosen — the same rule the
 * scenario engine follows, for the same reason.
 */
export function TransferQuestionCard({
  question,
  onAnswered,
}: {
  question: Question;
  /** Fired once, whichever option was chosen. Being wrong still teaches. */
  onAnswered: () => void;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const correct = chosen === question.answerIndex;

  const choose = (i: number) => {
    if (answered) return;
    setChosen(i);
    onAnswered();
  };

  return (
    <section className="rounded-[16px] border border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 p-4">
      <SectionLabel>Connect it back</SectionLabel>
      <h2 className="mt-1.5 text-[15px] font-extrabold leading-snug text-[var(--sq-ink)]">
        {question.prompt}
      </h2>

      <ul className="mt-3 space-y-2">
        {question.options.map((option, i) => {
          const isChosen = chosen === i;
          const isAnswer = i === question.answerIndex;

          // Before answering every option looks the same. After answering the
          // correct one is marked whether or not the player picked it.
          const style = !answered
            ? 'border-line bg-surface hover:border-civic-500 hover:bg-white'
            : isAnswer
              ? 'border-leaf-600 bg-[var(--sq-safe)]/15'
              : isChosen
                ? 'border-coral-600 bg-[var(--sq-risk)]/15'
                : 'border-line bg-surface opacity-70';

          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                aria-pressed={isChosen}
                className={`flex min-h-[52px] w-full items-center gap-2.5 rounded-[10px] border-2 px-3.5 py-2.5 text-left text-[14px] font-semibold text-[var(--sq-ink)] transition disabled:cursor-default ${style}`}
              >
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] border border-line-strong bg-surface-sunk text-[12px] font-extrabold text-ink-muted"
                >
                  {answered && isAnswer ? (
                    <Check className="h-3.5 w-3.5 text-[var(--sq-safe)]" strokeWidth={3} />
                  ) : answered && isChosen ? (
                    <X className="h-3.5 w-3.5 text-[var(--sq-risk)]" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="flex-1">{option}</span>
                {answered && isAnswer && (
                  <span className="sr-only">correct answer</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div
          className="animate-rise mt-3 rounded-[16px] border border-line bg-surface p-3.5"
          aria-live="polite"
        >
          <p className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-[var(--sq-ink)]">
            <Lightbulb className="h-4 w-4 text-[var(--sq-earned-text)]" aria-hidden="true" />
            {correct ? 'That is the one' : 'Close — here is the signal'}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
            {question.explanation}
          </p>
        </div>
      )}
    </section>
  );
}
