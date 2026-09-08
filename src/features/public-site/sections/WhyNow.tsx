import { Section, SectionHeading, Stat } from '../../../design-system/DesignSystem';

const SPF_SCAM = 'Singapore Police Force, Annual Scam and Cybercrime Brief 2025';
const SPF_CRIME = 'Singapore Police Force, Annual Crime Brief 2025';

/**
 * The evidence section.
 *
 * Every figure is sourced on the card itself. Assessors check numbers, and an
 * unattributed crime statistic on a crime-prevention site does more harm than
 * leaving it out. The closing line is the actual argument: the gap is not
 * knowledge, it is judgement under pressure — which is what the product trains.
 */
export function WhyNow() {
  return (
    <Section id="why-now" tone="sunk">
      <SectionHeading
        eyebrow="Why this, now"
        title="Young people already know the rules. The hard part is the moment."
        lede="Risk has moved into group chats and marketplaces, where pressure is social and the consequence arrives late — long after the choice feels harmless."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          value="41,974"
          label="Scam and cybercrime cases recorded in Singapore in 2025"
          source={SPF_SCAM}
        />
        <Stat value="S$913.1m" label="Total reported scam losses in 2025" source={SPF_SCAM} />
        <Stat
          value="81.8%"
          label="Of scam cases involved self-effected transfers — victims were manipulated into paying"
          source={SPF_SCAM}
        />
        <Stat
          value="4,109"
          label="Shop theft cases, still among the top offences for arrested youths"
          source={SPF_CRIME}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 lg:col-span-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--sq-action-text)]">
            Where youths are most exposed
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
            Youths aged 19 and below made up 5.6% of scam victims. Within that group, 36.6% fell
            prey to e-commerce scams, 15.1% to phishing and 12.8% to job scams — three tactics that
            all work by making a bad decision feel urgent and ordinary.
          </p>
          <p className="mt-3 border-t border-[var(--sq-line)] pt-2.5 text-[11px] font-medium text-[var(--sq-ink-muted)]/75">
            {SPF_SCAM}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--sq-action)]/25 bg-[var(--color-civic-50)] p-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-civic-700)]">
            What follows from it
          </h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--color-civic-900)]">
            Prevention has to build judgement and resistance to persuasion — not just awareness of
            warning signs. That means practising decisions, not memorising them.
          </p>
        </div>
      </div>
    </Section>
  );
}
