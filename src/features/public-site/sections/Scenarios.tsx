import { Section, SectionHeading } from '../../../design-system/DesignSystem';

/**
 * Sample missions, banded by age.
 *
 * Showing the age banding here is deliberate: the first question a teacher
 * asks is whether the content suits their class, and the proposal commits to
 * three bands with genuinely different material (§4). Scenarios are described
 * in terms of the offender's tactic rather than the victim's mistake — the
 * project's stated safeguard against victim-blaming framings.
 */
const BANDS = [
  {
    band: 'Primary / early secondary',
    age: '10–13',
    design: 'Simpler language, visual clues, 2–3 clear choices with guidance.',
    themes: ['Stranger approaches', 'Game and in-app scams', 'Cyberbullying'],
  },
  {
    band: 'Secondary',
    age: '14–16',
    design: 'Squad voting, branching outcomes, rising social pressure.',
    themes: ['Shop theft dares', 'Phishing', 'Harassment', 'Peer pressure'],
  },
  {
    band: 'Post-secondary / tertiary',
    age: '17–24',
    design: 'Ambiguous evidence, competing priorities, real financial stakes.',
    themes: ['Job scams', 'Money-mule recruitment', 'Account misuse'],
  },
];

const FEATURED = [
  {
    title: 'The Easy Money Offer',
    tactic: 'Money-mule recruitment',
    body: 'A message offers S$200 to receive funds and pass them on. The sender insists it is legal, urgent and risk-free. A friend adds, "just try once — everyone does side hustles now."',
    skill: 'Evaluate the Consequences',
  },
  {
    title: 'Urgent Account Alert',
    tactic: 'Phishing and impersonation',
    body: 'A security warning demands an immediate login to stop an account being frozen. The page looks right, the pressure is real, and the link is not.',
    skill: 'Spot the Risk',
  },
  {
    title: 'A Friend in Trouble',
    tactic: 'Peer pressure and bystander choice',
    body: 'Someone in the group is being egged into lending out their bank account. You are not the target — you are the person who could stop it, if you know how.',
    skill: 'Defend Your Community',
  },
];

export function Scenarios() {
  return (
    <Section id="scenarios" tone="sunk">
      <SectionHeading
        eyebrow="The missions"
        title="Situations they will actually meet"
        lede="Around 30–40 reviewed scenarios by the end of the project, each written for a specific age band and checked before it reaches a participant."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {FEATURED.map((mission) => (
          <article
            key={mission.title}
            className="flex flex-col rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-6 shadow-[var(--sq-shadow-flat)]"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-risk)]">
              {mission.tactic}
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-[var(--sq-ink)]">{mission.title}</h3>
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
              {mission.body}
            </p>
            <p className="mt-4 border-t border-[var(--sq-line)] pt-3 text-xs font-bold text-[var(--sq-peer)]">
              Practises: {mission.skill}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)]">
        <div className="border-b border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] px-6 py-3.5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--sq-ink)]">
            Content bands
          </h3>
        </div>
        <div className="grid grid-cols-1 divide-y divide-[var(--sq-line)] md:grid-cols-3 md:divide-x md:divide-y-0">
          {BANDS.map((band) => (
            <div key={band.band} className="p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-extrabold text-[var(--sq-ink)]">{band.band}</span>
                <span className="rounded-full bg-[var(--color-civic-50)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-civic-700)]">
                  {band.age}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
                {band.design}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {band.themes.map((theme) => (
                  <li
                    key={theme}
                    className="rounded-full border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--sq-ink-muted)]"
                  >
                    {theme}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-[var(--sq-ink-muted)]">
        Participants can submit their own fictionalised, non-identifying scenario ideas through the
        Scenario Portal. An educator reviews and approves every submission before it is published.
      </p>
    </Section>
  );
}
