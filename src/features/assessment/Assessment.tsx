import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { ProgressView } from './ProgressView';
import { Card } from '../../design-system/Card';

export function Assessment() {
  const [phase, setPhase] = useState<'pre' | 'post'>('pre');
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <ProgressView />

      <Card padding="lg" className="assessment mx-auto w-full md:max-w-[820px] lg:max-w-[1024px] xl:max-w-[1480px]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--sq-action)]/15 text-[var(--sq-action-text)] border border-[var(--sq-action)]/40 shadow-sm">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sq-action-text)]">
              A MOMENT TO REFLECT
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--sq-ink)]">
              How confident do you feel?
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--sq-ink-muted)] leading-relaxed">
          A short check-in before and after the adventure helps educators understand what’s working.
        </p>

        <div className="segmented">
          {(['pre', 'post'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={phase === value}
              className={phase === value ? 'active' : ''}
              onClick={() => {
                setPhase(value);
                setAnswer('');
                setSaved(false);
              }}
            >
              {value === 'pre' ? 'Before the quest' : 'After the quest'}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
          className="space-y-4"
        >
          <fieldset disabled={saved} className="space-y-2">
            <legend className="text-sm font-extrabold text-[var(--sq-ink)] mb-3">
              How confident are you in spotting a suspicious online message?
            </legend>
            {['Not confident yet', 'A little confident', 'Quite confident', 'Very confident'].map(
              (label) => (
                <label className={`choice ${answer === label ? 'active' : ''}`} key={label}>
                  <input
                    type="radio"
                    name="confidence"
                    required
                    checked={answer === label}
                    onChange={() => setAnswer(label)}
                  />
                  <span>{label}</span>
                </label>
              ),
            )}
          </fieldset>

          <button
            type="submit"
            className="primary-button full w-full min-h-[44px] rounded-[10px] bg-civic-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-civic-700 transition disabled:opacity-50"
            disabled={!answer || saved}
          >
            Save preview response
          </button>
        </form>

        {saved && (
          <div role="status" className="mt-4 rounded-[16px] border border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 p-3.5 text-xs text-[var(--sq-action-text)] leading-relaxed">
            Thanks for reflecting. This response is held only on this screen and has not been
            submitted.
          </div>
        )}

        <p className="small-label mt-4 text-[11px] text-[var(--sq-ink-muted)]">
          Sample question only. Assessment storage and KPI reporting are planned. No names or contact
          details are collected.
        </p>
      </Card>
    </div>
  );
}
