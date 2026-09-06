import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { ProgressView } from './ProgressView';

export function Assessment() {
  const [phase, setPhase] = useState<'pre' | 'post'>('pre');
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-6">
      <ProgressView />

      <section className="surface padded assessment mx-auto w-full md:max-w-[820px] lg:max-w-[1024px] xl:max-w-[1480px]">
        <div className="section-icon">
          <ClipboardCheck />
        </div>
        <span className="eyebrow">A MOMENT TO REFLECT</span>
        <h2>How confident do you feel?</h2>
      <p>
        A short check-in before and after the adventure helps educators understand what’s working.
      </p>
      <div className="segmented">
        {(['pre', 'post'] as const).map((value) => (
          <button
            key={value}
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
      >
        <fieldset disabled={saved}>
          <legend>How confident are you in spotting a suspicious online message?</legend>
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
        <button className="primary-button full" disabled={!answer || saved}>
          Save preview response
        </button>
      </form>
      {saved && (
        <div className="note" role="status">
          Thanks for reflecting. This response is held only on this screen and has not been
          submitted.
        </div>
      )}
      <p className="small-label">
        Sample question only. Assessment storage and KPI reporting are planned. No names or contact
        details are collected.
      </p>
    </section>
  </div>
);
}
