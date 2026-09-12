import {
  ArrowRight,
  Compass,
  Eye,
  MessageSquare,
  School,
  ShieldCheck,
  Sparkles,
  Split,
  TimerReset,
} from 'lucide-react';

import { DISTRICTS, TRACK } from '../game/board.ts';
import { fallbackCell } from '../game/geometry.ts';
import { COMPETENCY_MEANING, GUARDIANS, guardianArt } from '../game/content/guardians.ts';
import { COMPETENCY_LABEL, COMPETENCY_LETTER } from '../game/types.ts';
import { Callout, Section, SectionHeading, SiteButton, Stat } from './parts.tsx';

const SPF_SCAM = 'Singapore Police Force, Annual Scam and Cybercrime Brief 2025';
const SPF_CRIME = 'Singapore Police Force, Annual Crime Brief 2025';

/* ------------------------------------------------------------------ */
/* Board preview                                                       */
/* ------------------------------------------------------------------ */

/**
 * A picture of the actual board, built from the actual board.
 *
 * Drawn from `TRACK` and the same `fallbackCell` geometry the flat board uses,
 * so it cannot drift out of date the way a screenshot or a hand-drawn mock
 * would. Purely decorative — every space it shows is described in words in the
 * sections below, and it is hidden from assistive technology.
 */
function BoardPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-md select-none"
      style={{ perspective: '1100px' }}
    >
      <div
        className="grid aspect-square gap-1 rounded-[var(--radius-panel)] border border-[var(--color-navy-800)] p-3 shadow-[var(--sq-shadow-float)]"
        style={{
          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
          background:
            'radial-gradient(80% 70% at 50% 18%, #14345c, transparent 70%), var(--color-navy-950)',
          transform: 'rotateX(24deg) rotateZ(-6deg)',
        }}
      >
        {TRACK.map((space) => {
          const cell = fallbackCell(space.index);
          return (
            <div
              key={space.id}
              className="rounded-[4px] border border-white/10 bg-white/90"
              style={{
                gridColumn: cell.col,
                gridRow: cell.row,
                borderTop: `3px solid ${DISTRICTS[space.districtId].colour}`,
              }}
            />
          );
        })}

        <div
          className="grid place-content-center rounded-[var(--radius-card)] text-center"
          style={{ gridColumn: '2 / 8', gridRow: '2 / 8' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-navy-200)]">
            ShieldQuest City
          </p>
          <p className="mt-1 text-3xl font-black text-white">28</p>
          <p className="text-[10px] font-semibold text-[var(--color-navy-200)]">spaces</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {Object.values(DISTRICTS).map((district) => (
          <span
            key={district.id}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--sq-ink-muted)]"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: district.colour }} />
            {district.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/**
 * The headline works on two readers at once: a 15-year-old deciding whether
 * this is worth their time, and a school or grant assessor deciding whether it
 * is a serious programme. So the promise is concrete rather than either playful
 * or bureaucratic, and the proof sits beside it as a picture of the real board.
 */
export function Hero({ onPlay, onEnquiry }: { onPlay: () => void; onEnquiry: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--sq-line)] bg-[var(--sq-surface)] py-14 sm:py-20">
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
              message offering easy money, the friend saying “just try once”. They choose, live with
              the consequence, and talk it through with their squad.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SiteButton onClick={onPlay}>
                <Sparkles className="h-4 w-4" />
                Try ShieldQuest
                <ArrowRight className="h-4 w-4" />
              </SiteButton>
              <SiteButton variant="secondary" onClick={onEnquiry}>
                <School className="h-4 w-4 text-[var(--sq-action-text)]" />
                Bring it to your school
              </SiteButton>
            </div>

            {/* The three facts that answer a facilitator's first three
                objections: how long, what do I install, what data do you take. */}
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

/* ------------------------------------------------------------------ */
/* Why now                                                             */
/* ------------------------------------------------------------------ */

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
        <div className="rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 lg:col-span-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--sq-action-text)]">
            Where youths are most exposed
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
            Youths aged 19 and below made up 5.6% of scam victims. Within that group, 36.6% fell
            prey to e-commerce scams, 15.1% to phishing and 12.8% to job scams — three tactics that
            all work by making a bad decision feel urgent and ordinary.
          </p>
          <p className="mt-3 border-t border-[var(--sq-line)] pt-2.5 text-[11px] font-medium text-[var(--sq-ink-muted)] opacity-75">
            {SPF_SCAM}
          </p>
        </div>

        <Callout title="What follows from it">
          Prevention has to build judgement and resistance to persuasion — not just awareness of
          warning signs. That means practising decisions, not memorising them.
        </Callout>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* The loop                                                            */
/* ------------------------------------------------------------------ */

const STAGES = [
  {
    icon: Compass,
    action: 'Explore',
    player: 'Roll, move, and navigate the interactive city board.',
    learning: 'Puts risk in places youths recognise',
  },
  {
    icon: Eye,
    action: 'Investigate',
    player: 'Inspect chats, images and environmental clues.',
    learning: 'Builds observation — Spot the Risk',
  },
  {
    icon: MessageSquare,
    action: 'Discuss',
    player: 'Vote privately, then compare with the squad.',
    learning: 'Surfaces peer norms and reasoning',
  },
  {
    icon: Split,
    action: 'Decide',
    player: 'Choose a response while the pressure is on.',
    learning: 'Practises judgement — Hold Before Acting',
  },
  {
    icon: TimerReset,
    action: 'Experience',
    player: 'Live with the immediate and the delayed result.',
    learning: 'Makes the trade-off memorable',
  },
  {
    icon: ShieldCheck,
    action: 'Protect',
    player: 'Apply it for someone else in Peer Shield Mode.',
    learning: 'Builds confidence to step in',
  },
];

export function LearningLoop() {
  return (
    <Section id="how-it-works" tone="surface">
      <SectionHeading
        eyebrow="How it works"
        title="Six stages, run as a loop"
        lede="A mission takes a few minutes. The loop is what does the teaching — players come back round with sharper judgement each time."
      />

      <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAGES.map((stage, index) => (
          <li
            key={stage.action}
            className="rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-[var(--sq-shadow-flat)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-civic-50)] text-[var(--sq-action-text)]">
                <stage.icon className="h-5 w-5" />
              </span>
              <span
                aria-hidden="true"
                className="text-2xl font-black tabular-nums text-[var(--sq-line-strong)]"
              >
                {index + 1}
              </span>
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[var(--sq-ink)]">{stage.action}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
              {stage.player}
            </p>
            <p className="mt-3 border-t border-[var(--sq-line)] pt-3 text-xs font-bold uppercase tracking-wide text-[var(--sq-peer)]">
              {stage.learning}
            </p>
          </li>
        ))}
      </ol>

      {/* The two mechanics the proposal names as the distinctive hook. They
          earn their own callout because they are what a reviewer remembers. */}
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Callout tone="risk" title="The Delayed Consequence Engine">
          Take the easy money and you are paid immediately — the reward is real, because in life it
          is. Turns later the reversal arrives: trust falls, risk climbs, the account gets flagged.
          Short-term gain and safety come apart where a player can feel it.
        </Callout>
        <Callout tone="peer" title="Peer Shield Mode">
          The risk is often to a friend, not to you. Peer Shield hands players the harder job —
          stepping in and redirecting someone else without shaming them, which is the skill that
          actually prevents the offence.
        </Callout>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* The framework                                                       */
/* ------------------------------------------------------------------ */

/**
 * Rendered from the same constants the game reads.
 *
 * In v1 this section, the player's skills panel and the type definitions each
 * carried their own wording, and they had drifted far enough that two
 * Guardians' abilities were swapped relative to the proposal. A participant who
 * reads one description here and a different one in the app has been shown two
 * frameworks.
 */
export function Framework() {
  return (
    <Section id="framework" tone="inverse">
      <SectionHeading
        inverse
        eyebrow="The framework"
        title="One decision process, reinforced by every scenario"
        lede="Scam tactics change constantly, so we do not teach tactics. We teach a sequence young people can run on a situation nobody has warned them about yet."
      />

      <ol className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GUARDIANS.map((guardian) => (
          <li
            key={guardian.competency}
            className="row-span-3 grid grid-rows-subgrid gap-0 rounded-[var(--radius-card)] border border-[var(--color-navy-800)] bg-[var(--color-navy-900)] p-5"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-content-center rounded-[var(--radius-control)] bg-[var(--color-civic-600)] text-base font-black text-white"
              >
                {COMPETENCY_LETTER[guardian.competency]}
              </span>
              <h3 className="text-base font-extrabold text-white">
                {COMPETENCY_LABEL[guardian.competency]}
              </h3>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[var(--color-navy-200)]">
              {COMPETENCY_MEANING[guardian.competency]}
            </p>

            <p className="mt-3 flex items-center gap-2 border-t border-[var(--color-navy-800)] pt-3 text-xs text-[var(--color-navy-200)]">
              <img src={guardianArt(guardian.id)} alt="" aria-hidden="true" className="h-7 w-7" />
              <span>
                <strong className="text-[var(--color-amber-400)]">{guardian.name}</strong> ·{' '}
                {guardian.ability}
              </span>
            </p>
          </li>
        ))}
      </ol>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-[var(--color-navy-200)]">
        Guardians are earned by demonstrating the matching skill in a decision — never bought, never
        randomised, never awarded by a dice roll. A Guardian that grew from unrelated play would
        stop being evidence of anything.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Scenarios                                                           */
/* ------------------------------------------------------------------ */

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

/**
 * Scenarios are described by the offender's tactic, not the victim's mistake.
 * That is the project's stated safeguard against victim-blaming framings, and
 * it applies to the marketing copy as much as to the in-game feedback.
 */
const FEATURED = [
  {
    title: 'Easy Money?',
    tactic: 'Money-mule recruitment',
    body: 'A message offers S$200 to receive funds and pass them on. The sender insists it is legal, urgent and risk-free. A friend adds, “just try once — everyone does side hustles now.”',
    skill: 'Evaluate the Consequences',
  },
  {
    title: 'Too Cheap To Be Real',
    tactic: 'E-commerce scam',
    body: 'A listing is less than half price, the seller wants to be paid outside the app, and there are three other buyers waiting. The queue is the cheapest pressure there is to invent.',
    skill: 'Spot the Risk',
  },
  {
    title: 'Jayden’s Offer',
    tactic: 'Peer pressure and bystander choice',
    body: 'Someone in the group chat is about to hand over their account number. You are not the target — you are the person who could stop it, if you know how.',
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
            className="flex flex-col rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-risk)]">
              {mission.tactic}
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-[var(--sq-ink)]">{mission.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
              {mission.body}
            </p>
            <p className="mt-4 border-t border-[var(--sq-line)] pt-3 text-xs font-bold uppercase tracking-wide text-[var(--sq-action-text)]">
              Practises {mission.skill}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sq-action-text)]">
          Content bands
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {BANDS.map((band) => (
            <div
              key={band.age}
              className="rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-sm font-extrabold text-[var(--sq-ink)]">{band.band}</h4>
                <span className="shrink-0 rounded-full bg-[var(--color-civic-50)] px-2.5 py-1 text-xs font-black text-[var(--color-civic-700)]">
                  {band.age}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
                {band.design}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {band.themes.map((theme) => (
                  <li
                    key={theme}
                    className="rounded-[var(--radius-inset)] bg-[var(--sq-surface-sunk)] px-2 py-1 text-[11px] font-semibold text-[var(--sq-ink-muted)]"
                  >
                    {theme}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[var(--sq-ink-muted)]">
        Educators select the band for their group, and the app will not serve a scenario outside it.
        A Scenario Management Portal lets reviewed content be updated as tactics change, and youth
        participants can submit fictionalised, non-identifying mission ideas for educator approval
        before anything is published.
      </p>
    </Section>
  );
}
