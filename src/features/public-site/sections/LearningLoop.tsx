import { Compass, Eye, MessageSquare, ShieldCheck, Split, TimerReset } from 'lucide-react';
import { Section, SectionHeading } from '../../../design-system/DesignSystem';

/**
 * The six-stage gameplay loop (proposal §3.1).
 *
 * Each stage pairs the player's action with the learning function it serves —
 * that pairing is the whole pedagogical claim, so the two are never shown
 * apart. The numbering is load-bearing: it is a loop players run repeatedly,
 * not a list of features.
 */
const STAGES = [
  {
    icon: Compass,
    action: 'Explore',
    player: 'Navigate the interactive city board.',
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
            className="relative rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-[var(--sq-shadow-flat)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-civic-50)] text-[var(--sq-action-text)]">
                <stage.icon className="h-5 w-5" />
              </span>
              <span
                className="text-2xl font-black tabular-nums text-[var(--sq-line-strong)]"
                aria-hidden="true"
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
       * earn their own callout because they are what a reviewer remembers. */}
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[16px] border border-[var(--sq-risk)]/30 bg-[var(--color-coral-50)] p-6">
          <h3 className="text-base font-extrabold text-[var(--color-coral-800)]">
            The Delayed Consequence Engine
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-coral-800)]/85">
            Take the easy money and you are paid immediately — the reward is real, because in life
            it is. Later the reversal arrives: trust falls, risk climbs, the account gets flagged.
            Short-term gain and safety come apart where a player can feel it.
          </p>
        </div>
        <div className="rounded-[16px] border border-[var(--sq-peer)]/30 bg-[var(--color-teal-50)] p-6">
          <h3 className="text-base font-extrabold text-[var(--color-teal-800)]">
            Peer Shield Mode
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-teal-800)]/85">
            The risk is often to a friend, not to you. Peer Shield hands players the harder job —
            stepping in and redirecting someone else without shaming them, which is the skill that
            actually prevents the offence.
          </p>
        </div>
      </div>
    </Section>
  );
}
