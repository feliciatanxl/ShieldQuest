import { ArrowRight, ClipboardList, MonitorSmartphone, QrCode, Users } from 'lucide-react';
import { Button, Section, SectionHeading } from '../../../design-system/DesignSystem';

/**
 * The facilitator-facing section.
 *
 * This is the conversion point for the audience that actually books a session,
 * so it answers logistics rather than selling the concept again.
 *
 * Laid out as three stacked bands rather than two columns. The previous
 * side-by-side put a divider list next to a card stack — two different
 * densities, two different treatments, and two columns of unequal length that
 * left a ragged edge and no clear reading order. Stacked, the section reads
 * the way a teacher actually evaluates it: what happens in the 90 minutes,
 * then what the room needs, then the ask.
 */
const RUN_SHEET = [
  {
    minutes: 15,
    title: 'Onboarding & briefing',
    detail:
      'Introduce the framework, form squads of 4–5, join by QR code, and complete a short baseline assessment.',
  },
  {
    minutes: 45,
    title: 'Core gameplay',
    detail:
      'Squads work through two scenarios — a third if time allows — using Think–Vote–Explain on their own devices.',
  },
  {
    minutes: 20,
    title: 'Facilitated debrief',
    detail:
      'Review outcomes together and discuss why choices were safer or riskier, focusing on how to redirect a friend at risk.',
  },
  {
    minutes: 10,
    title: 'Evaluation',
    detail:
      'A short post-session assessment and feedback form, comparable against the baseline at cohort level.',
  },
];

const TOTAL_MINUTES = RUN_SHEET.reduce((sum, s) => sum + s.minutes, 0);

const REQUIREMENTS = [
  {
    icon: MonitorSmartphone,
    title: 'Devices they already have',
    detail:
      'Any phone, tablet, Chromebook or desktop with a modern browser. Runs in a classroom, a computer lab or a community hall.',
  },
  {
    icon: QrCode,
    title: 'Nothing to install',
    detail:
      'Participants scan a QR code or enter a session code. No app store, no accounts, no sign-ups to chase.',
  },
  {
    icon: Users,
    title: 'One facilitator',
    detail:
      'Designed for 20–30 participants per session with a single facilitator, and a toolkit that tells you what to say.',
  },
  {
    icon: ClipboardList,
    title: 'Evidence you can report',
    detail:
      'Aggregated, anonymous pre/post results across risk recognition, decision accuracy, consequence awareness and peer-intervention confidence.',
  },
];

export function ForSchools({ onEnquiry }: { onEnquiry: () => void }) {
  return (
    <Section id="schools" tone="surface">
      <SectionHeading
        eyebrow="For schools & partners"
        title="Built to run inside a single period"
        lede="A 90-minute facilitated workshop that a teacher or youth worker can lead without specialist training."
      />

      {/* ---- Band 1: the 90 minutes, as a proportional timeline -------------
        The bar widths are the actual share of the session, so the shape of the
        workshop is legible before a word is read: gameplay is half of it, and
        the debrief is longer than the briefing. Numbering is kept because this
        genuinely is a sequence a facilitator follows in order. */}
      <div className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
            Session run-sheet
          </h3>
          <span className="text-xs font-bold text-[var(--sq-ink-muted)]">
            {TOTAL_MINUTES} minutes total
          </span>
        </div>

        {/* Proportional bar. Decorative — the same proportions are stated as
          * minutes in the list below, so nothing depends on reading it. */}
        <div
          aria-hidden="true"
          className="mt-3 flex h-2 w-full gap-1 overflow-hidden rounded-full"
        >
          {RUN_SHEET.map((segment, index) => (
            <div
              key={segment.title}
              className={`h-full rounded-full ${
                index === 1 ? 'bg-[var(--sq-action)]' : 'bg-[var(--sq-action)]/30'
              }`}
              style={{ width: `${(segment.minutes / TOTAL_MINUTES) * 100}%` }}
            />
          ))}
        </div>

        <ol className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {RUN_SHEET.map((segment, index) => (
            <li key={segment.title} className="flex gap-3.5">
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-[var(--color-civic-50)] leading-none">
                <span className="text-sm font-black tabular-nums text-[var(--color-civic-700)]">
                  {segment.minutes}
                </span>
                <span className="text-[9px] font-bold uppercase text-[var(--color-civic-700)]/70">
                  min
                </span>
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[var(--sq-ink)]">
                  <span className="text-[var(--sq-ink-muted)]">{index + 1}.</span>{' '}
                  {segment.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
                  {segment.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ---- Band 2: what a room needs, four across ------------------------
        These are four parallel facts, not a sequence, so they get equal weight
        in one row rather than a numbered stack. Full width means each one has
        room for a real sentence instead of a squeezed column. */}
      <div className="mt-14 border-t border-[var(--sq-line)] pt-10">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
          What a room needs
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {REQUIREMENTS.map((item) => (
            <div key={item.title}>
              <item.icon
                className="h-5 w-5 text-[var(--sq-action-text)]"
                aria-hidden="true"
              />
              <h4 className="mt-3 text-sm font-extrabold text-[var(--sq-ink)]">
                {item.title}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Band 3: the ask ---------------------------------------------- */}
      <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[16px] border border-[var(--sq-action)]/25 bg-[var(--color-civic-50)] p-6 sm:flex-row sm:items-center sm:gap-8">
        <div>
          <h3 className="text-base font-extrabold text-[var(--color-civic-900)]">
            Interested in hosting a pilot session?
          </h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--color-civic-900)]/80">
            Tell us your learner band and rough group size, and we will come back with dates and
            what the room needs.
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0"
          onClick={onEnquiry}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Request a session
        </Button>
      </div>
    </Section>
  );
}
