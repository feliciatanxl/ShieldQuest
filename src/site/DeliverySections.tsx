import { useState } from 'react';
import {
  Accessibility,
  ArrowRight,
  ChevronDown,
  ClipboardList,
  EyeOff,
  HeartHandshake,
  MonitorSmartphone,
  QrCode,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { Section, SectionHeading, SiteButton } from './parts.tsx';

/* ------------------------------------------------------------------ */
/* For schools                                                         */
/* ------------------------------------------------------------------ */

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

const TOTAL_MINUTES = RUN_SHEET.reduce((sum, segment) => sum + segment.minutes, 0);

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
      'Participants scan a QR code or open the link. No app store, no accounts, no sign-ups to chase.',
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

/**
 * The facilitator-facing section — the conversion point for the audience that
 * actually books a session, so it answers logistics rather than selling the
 * concept again. Stacked bands rather than columns, in the order a teacher
 * evaluates it: what happens in the 90 minutes, what the room needs, the ask.
 */
export function ForSchools({ onEnquiry }: { onEnquiry: () => void }) {
  return (
    <Section id="schools" tone="surface">
      <SectionHeading
        eyebrow="For schools & partners"
        title="Built to run inside a single period"
        lede="A 90-minute facilitated workshop that a teacher or youth worker can lead without specialist training."
      />

      <div className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
            Session run-sheet
          </h3>
          <span className="text-xs font-bold text-[var(--sq-ink-muted)]">
            {TOTAL_MINUTES} minutes total
          </span>
        </div>

        {/* Proportional bar: the shape of the workshop is legible before a word
            is read — gameplay is half of it, and the debrief is longer than the
            briefing. Decorative, because the same proportions are stated as
            minutes in the list below. */}
        <div aria-hidden="true" className="mt-3 flex h-2 w-full gap-1 overflow-hidden rounded-full">
          {RUN_SHEET.map((segment, index) => (
            <div
              key={segment.title}
              className={`h-full rounded-full ${
                index === 1 ? 'bg-[var(--sq-action)]' : 'bg-[var(--color-civic-200)]'
              }`}
              style={{ width: `${(segment.minutes / TOTAL_MINUTES) * 100}%` }}
            />
          ))}
        </div>

        <ol className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {RUN_SHEET.map((segment, index) => (
            <li key={segment.title} className="flex gap-3.5">
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-civic-50)] leading-none">
                <span className="text-sm font-black tabular-nums text-[var(--color-civic-700)]">
                  {segment.minutes}
                </span>
                <span className="text-[9px] font-bold uppercase text-[var(--color-civic-700)] opacity-70">
                  min
                </span>
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[var(--sq-ink)]">
                  <span className="text-[var(--sq-ink-muted)]">{index + 1}.</span> {segment.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
                  {segment.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-14 border-t border-[var(--sq-line)] pt-10">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
          What a room needs
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {REQUIREMENTS.map((item) => (
            <div key={item.title}>
              <item.icon className="h-5 w-5 text-[var(--sq-action-text)]" aria-hidden="true" />
              <h4 className="mt-3 text-sm font-extrabold text-[var(--sq-ink)]">{item.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-card)] border p-6 sm:flex-row sm:items-center sm:gap-8"
        style={{
          borderColor: 'color-mix(in oklab, var(--sq-action) 28%, transparent)',
          background: 'var(--color-civic-50)',
        }}
      >
        <div>
          <h3 className="text-base font-extrabold text-[var(--color-civic-900)]">
            Interested in hosting a pilot session?
          </h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--color-civic-900)] opacity-80">
            Tell us your learner band and rough group size, and we will come back with dates and
            what the room needs.
          </p>
        </div>
        <SiteButton className="shrink-0" onClick={onEnquiry}>
          Request a session
          <ArrowRight className="h-4 w-4" />
        </SiteButton>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Safety                                                              */
/* ------------------------------------------------------------------ */

/**
 * Safety, privacy and safeguarding.
 *
 * Near the end on purpose: by this point a school reader has decided they like
 * the idea and has started worrying about data, consent, and whether the
 * content could hurt someone. These are commitments the project has actually
 * made, phrased as what is NOT collected — the only form of privacy claim a
 * reader can verify.
 */
const COMMITMENTS = [
  {
    icon: EyeOff,
    title: 'We do not ask who you are',
    points: [
      'No names, NRIC numbers, phone numbers or banking details.',
      'Participation is anonymous or pseudonymous throughout.',
      'Pre and post responses are linked by a random session code, never by a name.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Reporting stays aggregated',
    points: [
      'Facilitators see squad-level patterns, not individual profiles.',
      'Evaluation and reporting use aggregated results only.',
      'Aligned with the PDPA; no real Singpass or banking data is ever requested.',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'Nobody has to disclose anything',
    points: [
      'No requirement to share personal experience of victimisation or offending.',
      'No competitive scoring based on personal disclosures.',
      'Scenarios centre the offender’s manipulation — feedback never implies a victim deserved harm.',
    ],
  },
  {
    icon: Accessibility,
    title: 'Designed to be usable',
    points: [
      'Readable language, keyboard operation, and captions where multimedia is used.',
      'Status is never signalled by colour alone.',
      'Runs on common phones, tablets and laptops, with a low-bandwidth board for weak connections.',
    ],
  },
];

export function Safety() {
  return (
    <Section id="safety" tone="inverse">
      <SectionHeading
        inverse
        eyebrow="Safety, privacy & safeguarding"
        title="A crime-prevention tool should collect less, not more"
        lede="Youth participants are asked to think about risky situations. That only works if the tool itself is demonstrably safe to use."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        {COMMITMENTS.map((block) => (
          <div
            key={block.title}
            className="rounded-[var(--radius-card)] border border-[var(--color-navy-800)] bg-[var(--color-navy-900)] p-6"
          >
            <div className="flex items-center gap-2.5">
              <block.icon className="h-5 w-5 shrink-0 text-[var(--color-teal-400)]" />
              <h3 className="text-base font-extrabold text-white">{block.title}</h3>
            </div>
            <ul className="mt-3.5 space-y-2">
              {block.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-navy-200)]"
                >
                  <span aria-hidden="true" className="mt-1.5 text-[var(--color-teal-400)]">
                    —
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-[var(--color-navy-200)]">
        Where a scenario touches something a participant may need help with, the app points towards
        a trusted adult and reviewed official support channels — not towards a score.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: 'Who is ShieldQuest for?',
    a: 'Youths aged roughly 10–24, split into three content bands. The initial pilot prioritises secondary and post-secondary cohorts, with expansion to younger groups depending on partner suitability and safeguarding requirements.',
  },
  {
    q: 'Does anyone need to install an app or make an account?',
    a: 'No. ShieldQuest is a progressive web app. Participants scan a QR code and it opens in the browser they already have. There are no accounts and nothing to download.',
  },
  {
    q: 'What data is collected about participants?',
    a: 'No names, NRIC numbers, phone numbers or banking details. Where pre and post responses need comparing, participants are given a random pseudonymous session code. All reporting is aggregated.',
  },
  {
    q: 'How long is a session, and can we run a shorter one?',
    a: 'The standard workshop is 90 minutes: 15 onboarding, 45 gameplay, 20 debrief, 10 evaluation. The game also offers a shorter 12-turn run, so the gameplay segment can compress if your period is shorter.',
  },
  {
    q: 'Can our own staff facilitate it?',
    a: 'Yes — that is the intended model. Educators, counsellors, student development officers and youth workers run the session and work from a structured debrief guide. It is not designed for, or limited to, police officers.',
  },
  {
    q: 'What if we have no reliable devices or Wi-Fi?',
    a: 'The app works offline once it has loaded, and automatically switches to a lighter flat board on devices without 3D support or in data-saver mode. The project also includes a printable offline board-game kit so a session can run with no devices at all.',
  },
  {
    q: 'Is the content reviewed before students see it?',
    a: 'Yes. Scenarios are reviewed before publication, and any scenario submitted by participants goes through mandatory educator approval first. Submissions are template-based and must be fictionalised and non-identifying.',
  },
  {
    q: 'How do you know whether it works?',
    a: 'Pre and post assessments measure risk recognition, decision accuracy, consequence awareness and peer-intervention confidence, alongside engagement measures. Where feasible a 2–4 week follow-up checks retention.',
  },
];

/**
 * Native `<details>` rather than a hand-rolled accordion: keyboard-operable,
 * announced correctly, and findable by in-page search even while collapsed.
 */
export function Faq() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? FAQS : FAQS.slice(0, 5);

  return (
    <Section id="faq" tone="sunk">
      <SectionHeading
        eyebrow="Questions"
        title="What schools and partners ask first"
        lede="If your question is not here, the session request form is the fastest way to reach us."
      />

      <div className="mx-auto mt-10 max-w-3xl space-y-2.5">
        {visible.map((item) => (
          <details
            key={item.q}
            className="group rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-extrabold text-[var(--sq-ink)] [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[var(--sq-ink-muted)] transition group-open:rotate-180"
              />
            </summary>
            <p className="border-t border-[var(--sq-line)] px-5 py-4 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      {!showAll ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm font-bold text-[var(--sq-action-text)] hover:underline"
          >
            Show {FAQS.length - visible.length} more questions
          </button>
        </div>
      ) : null}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing                                                             */
/* ------------------------------------------------------------------ */

/**
 * The proposal's own closing argument, because it is the sharpest sentence in
 * the document and it frames what the product is for: prevention happens at the
 * moment of the decision, not in the assembly hall afterwards.
 */
export function ClosingCta({ onPlay, onEnquiry }: { onPlay: () => void; onEnquiry: () => void }) {
  return (
    <section className="bg-[var(--color-navy-950)] py-20 text-center">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-amber-400)]">
          Choose right. Protect together.
        </p>

        <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          Crime prevention happens before an offence takes place.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-navy-200)]">
          It happens at the exact moment a young person decides whether to follow a dare, accept
          suspicious money, lend an account, or step in when a friend is walking into something.
          ShieldQuest is where they get to practise that moment first.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <SiteButton variant="gold" onClick={onPlay}>
            <Sparkles className="h-4 w-4" />
            Try ShieldQuest
            <ArrowRight className="h-4 w-4" />
          </SiteButton>
          <SiteButton variant="secondary" onClick={onEnquiry}>
            <School className="h-4 w-4" />
            Request a session
          </SiteButton>
        </div>

        <p className="mt-8 text-sm font-semibold text-[var(--color-navy-200)] opacity-70">
          Recognise the risk. Make the choice. Protect your people.
        </p>
      </div>
    </section>
  );
}
