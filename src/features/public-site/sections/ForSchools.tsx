import { ArrowRight, ClipboardList, MonitorSmartphone, QrCode, Users } from 'lucide-react';
import { Button, Section, SectionHeading } from '../../../design-system/DesignSystem';

/**
 * The facilitator-facing section.
 *
 * This is the conversion point for the audience that actually books a session,
 * so it answers logistics rather than selling the concept again: how the 90
 * minutes breaks down, what a room needs, and what the facilitator gets back.
 * The run-sheet is the proposal's session structure verbatim, because a teacher
 * reading this is deciding whether it fits a period.
 */
const RUN_SHEET = [
  {
    minutes: '15',
    title: 'Onboarding & briefing',
    detail:
      'Introduce the framework, form squads of 4–5, join by QR code, and complete a short baseline assessment.',
  },
  {
    minutes: '45',
    title: 'Core gameplay',
    detail:
      'Squads work through two scenarios — a third if time allows — using Think–Vote–Explain on their own devices.',
  },
  {
    minutes: '20',
    title: 'Facilitated debrief',
    detail:
      'Review outcomes together and discuss why choices were safer or riskier, focusing on how to redirect a friend at risk.',
  },
  {
    minutes: '10',
    title: 'Evaluation',
    detail:
      'A short post-session assessment and feedback form, comparable against the baseline at cohort level.',
  },
];

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

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
            Session run-sheet
          </h3>
          <ol className="mt-4">
            {RUN_SHEET.map((segment, index) => (
              <li
                key={segment.title}
                className="flex gap-4 border-b border-[var(--sq-line)] py-4 last:border-b-0"
              >
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-[var(--color-civic-50)] leading-none">
                  <span className="text-sm font-black text-[var(--color-civic-700)]">
                    {segment.minutes}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-[var(--color-civic-700)]/70">
                    min
                  </span>
                </span>
                <div>
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

        <div className="lg:col-span-5">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
            What a room needs
          </h3>
          <div className="mt-4 space-y-3">
            {REQUIREMENTS.map((item) => (
              <div
                key={item.title}
                className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] p-4"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 shrink-0 text-[var(--sq-action-text)]" />
                  <h4 className="text-sm font-extrabold text-[var(--sq-ink)]">{item.title}</h4>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[16px] border border-[var(--sq-action)]/25 bg-[var(--color-civic-50)] p-5">
            <h4 className="text-sm font-extrabold text-[var(--color-civic-900)]">
              Interested in hosting a pilot session?
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-civic-900)]/80">
              Tell us your learner band and rough group size and we will come back with dates and
              what the room needs.
            </p>
            <Button
              className="mt-4"
              fullWidth
              onClick={onEnquiry}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Request a session
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
