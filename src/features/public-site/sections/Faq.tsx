import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Section, SectionHeading } from '../../../design-system/DesignSystem';

/**
 * Questions, as a native disclosure list.
 *
 * Uses `<details>`/`<summary>` rather than a hand-rolled accordion: it is
 * keyboard-operable, announced correctly, and findable by in-page search even
 * while collapsed. The previous implementation tracked an open index in state
 * and rendered plain `div`s, so collapsed answers were invisible to Ctrl+F and
 * to assistive technology.
 */
const FAQS = [
  {
    q: 'Who is ShieldQuest for?',
    a: 'Youths aged roughly 10–24, split into three content bands. The initial pilot prioritises secondary and post-secondary cohorts, with expansion to younger groups depending on partner suitability and safeguarding requirements.',
  },
  {
    q: 'Does anyone need to install an app or make an account?',
    a: 'No. ShieldQuest is a progressive web app. Participants scan a QR code or enter a session code and it opens in the browser they already have. There are no accounts and nothing to download.',
  },
  {
    q: 'What data is collected about participants?',
    a: 'No names, NRIC numbers, phone numbers or banking details. Where pre and post responses need comparing, participants are given a random pseudonymous session code. All reporting is aggregated.',
  },
  {
    q: 'How long is a session, and can we run a shorter one?',
    a: 'The standard workshop is 90 minutes: 15 onboarding, 45 gameplay, 20 debrief, 10 evaluation. The gameplay segment covers two scenarios with a third if time allows, so it can compress if your period is shorter.',
  },
  {
    q: 'Can our own staff facilitate it?',
    a: 'Yes — that is the intended model. Educators, counsellors, student development officers and youth workers use the facilitator portal to create a session, follow live squad decisions, and work from a structured debrief guide.',
  },
  {
    q: 'What if we have no reliable devices or Wi-Fi?',
    a: 'The app is built for low-bandwidth access, and the project includes a printable offline board-game kit so a session can still run in a low-tech setting.',
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
            className="group rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] open:shadow-[var(--sq-shadow-flat)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-extrabold text-[var(--sq-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sq-focus)] [&::-webkit-details-marker]:hidden">
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

      {!showAll && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-[10px] px-4 py-2 text-sm font-bold text-[var(--sq-action-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sq-focus)]"
          >
            Show {FAQS.length - visible.length} more questions
          </button>
        </div>
      )}
    </Section>
  );
}
