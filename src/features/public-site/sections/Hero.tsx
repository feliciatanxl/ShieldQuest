import { ArrowRight, School, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../../design-system/DesignSystem';
import { BoardPreview } from './BoardPreview';

/**
 * Landing hero.
 *
 * The headline has to work on two readers at once: a 15-year-old deciding
 * whether this looks worth their time, and a school or grant assessor deciding
 * whether it looks like a serious programme. So the promise is concrete rather
 * than either playful or bureaucratic, and the proof sits immediately beside it
 * as a picture of the actual board — evaluators consistently want to see the
 * thing before they read about it.
 */
export function Hero({
  onPlay,
  onSchoolsEnquiry,
}: {
  onPlay: () => void;
  onSchoolsEnquiry: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--sq-line)] bg-[var(--sq-surface)] py-14 sm:py-20">
      {/* A single soft wash behind the hero. The page had two competing
       * gradients here before; one is enough to lift the fold off the canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[var(--color-civic-50)] to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-civic-200)] bg-[var(--color-civic-50)] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-civic-700)]">
              <ShieldCheck className="h-4 w-4" />
              <span>Crime prevention &amp; scam awareness</span>
            </p>

            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-[var(--sq-ink)] sm:text-5xl lg:text-[3.4rem]">
              Practise the hard choice{' '}
              <span className="text-[var(--sq-action-text)]">before it costs anything.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--sq-ink-muted)] sm:text-lg">
              ShieldQuest puts young people inside the moment a decision actually happens — the
              message offering easy money, the friend saying "just try once". They choose, live with
              the consequence, and talk it through with their squad.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={onPlay}
                leftIcon={<Sparkles className="h-4 w-4" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Try ShieldQuest
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={onSchoolsEnquiry}
                leftIcon={<School className="h-4 w-4 text-[var(--sq-action-text)]" />}
              >
                Bring it to your school
              </Button>
            </div>

            {/* The three facts that answer a facilitator's first three
             * objections: how long, what do I install, what data do you take. */}
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--sq-line)] pt-6">
              {[
                { term: '90 min', desc: 'Facilitated workshop' },
                { term: 'No install', desc: 'Opens from a QR code' },
                { term: 'No NRIC', desc: 'Anonymous by design' },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="text-lg font-black tracking-tight text-[var(--sq-ink)]">
                    {item.term}
                  </dt>
                  <dd className="mt-0.5 text-xs font-semibold leading-snug text-[var(--sq-ink-muted)]">
                    {item.desc}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">
            <BoardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
