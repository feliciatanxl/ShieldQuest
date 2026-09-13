import { TRACK } from '../game/board.ts';
import { COMPETENCY_LABEL, COMPETENCY_LETTER, COMPETENCY_ORDER } from '../game/types.ts';
import { TOKEN_AWARD } from '../game/engine.ts';
import { Button, Sheet } from './primitives.tsx';
import type { SpaceKind } from '../game/types.ts';

/**
 * How to play, available at any point in the run.
 *
 * A facilitated session explains the rules once, in the first fifteen minutes,
 * to a room of up to sixty people — so some of them will not have heard it, and
 * more of them will have forgotten it by turn nine. The rules therefore have to
 * be reachable from the board rather than only from onboarding, which is why
 * this is a button in the header and not a step in the intro.
 *
 * It also opens itself the first time a run reaches the board. Once, keyed in
 * localStorage: a manual that reappears every session is a manual people learn
 * to dismiss without reading.
 *
 * Content ported from v1's `CityInfoSheet`, kept deliberately short. The two
 * things a player actually needs are what a turn looks like and what the dice
 * is allowed to decide; everything else on this sheet is there to be findable,
 * not to be read now.
 */

const KIND_GLYPH: Record<SpaceKind, string> = {
  GATE: '◈',
  MISSION: '▶',
  PEER_SHIELD: '❖',
  SITUATION: '✦',
  CLUE: '?',
  GUARDIAN: '★',
  COMMUNITY: '⌂',
};

/** What each kind of space does, in the player's words. */
const KIND_BLURB: Record<SpaceKind, string> = {
  GATE: 'A district gate. Passing one pays the city stipend.',
  MISSION: 'A full situation with a decision to make.',
  PEER_SHIELD: 'Someone else is in trouble. Your call protects them.',
  SITUATION: 'A short situation card with a quick choice.',
  CLUE: 'A detail worth noticing, and a question about it.',
  GUARDIAN: 'A Guardian trial. A good answer counts double.',
  COMMUNITY: 'District works. Spend coins here to raise City Trust.',
};

const TURN_STEPS = ['Roll', 'Move', 'Land', 'Decide', 'Learn', 'Back to the board'];

function Panel({
  title,
  tone = 'plain',
  children,
}: {
  title: string;
  tone?: 'plain' | 'earned';
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[var(--radius-card)] border p-4"
      style={{
        borderColor: tone === 'earned' ? 'var(--sq-earned)' : 'var(--sq-line)',
        background:
          tone === 'earned'
            ? 'color-mix(in oklab, var(--sq-earned) 12%, transparent)'
            : 'var(--sq-surface-sunk)',
      }}
    >
      <h3
        className="text-[11px] font-bold uppercase tracking-[0.14em]"
        style={{ color: tone === 'earned' ? 'var(--sq-earned-text)' : 'var(--sq-ink-muted)' }}
      >
        {title}
      </h3>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--sq-ink)]">{children}</div>
    </section>
  );
}

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  // Counted from the real board rather than written down, so the sheet cannot
  // describe a board that no longer exists.
  const kinds = [...new Set(TRACK.map((space) => space.kind))];

  return (
    <Sheet labelledBy="how-to-play-title" onDismiss={onClose}>
      <div className="max-h-[82dvh] overflow-y-auto px-5 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--sq-action-text)]">
          Project SHIELD
        </p>
        <h2 id="how-to-play-title" className="mt-1 text-xl font-bold">
          How to play
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
          Crime prevention practised as a decision, not delivered as a talk. {TRACK.length} spaces,
          four districts, and a city that remembers what you chose.
        </p>

        <div className="mt-4 space-y-3">
          <Panel title="How a turn works">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-semibold">
              {TURN_STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-1.5">
                  {step}
                  {index < TURN_STEPS.length - 1 ? (
                    <span aria-hidden="true" className="text-[var(--sq-ink-muted)]">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="text-[13px] text-[var(--sq-ink-muted)]">
              The board is the engagement; the decisions, the delayed consequences and Peer Shield
              Mode are the substance.
            </p>
          </Panel>

          <Panel title="What the dice does" tone="earned">
            <p>
              It moves you, and nothing else. The dice never decides whether a choice was safe,
              never pays Shield Tokens, never strengthens a Guardian, and never decides who wins —
              there is nothing to win.
            </p>
          </Panel>

          <Panel title="The spaces">
            <ul className="space-y-1.5">
              {kinds.map((kind) => (
                <li key={kind} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-[var(--radius-inset)] bg-[var(--sq-surface-raised)] text-[13px]"
                  >
                    {KIND_GLYPH[kind]}
                  </span>
                  <span className="text-[13px] leading-snug text-[var(--sq-ink-muted)]">
                    {KIND_BLURB[kind]}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="What the numbers mean">
            <ul className="space-y-1.5 text-[13px] text-[var(--sq-ink-muted)]">
              <li>
                <strong className="text-[var(--sq-ink)]">Coins</strong> — what a decision pays now.
                Spend them on district works.
              </li>
              <li>
                <strong className="text-[var(--sq-ink)]">City Trust</strong> and{' '}
                <strong className="text-[var(--sq-ink)]">Risk</strong> — what it costs later. A
                choice that pays today can bill you three turns from now.
              </li>
              <li>
                <strong className="text-[var(--sq-ink)]">Resilience</strong> — earned only by
                protecting someone else.
              </li>
              <li>
                <strong className="text-[var(--sq-ink)]">Shield Tokens</strong> —{' '}
                {TOKEN_AWARD.decision} for answering a situation, whatever you answered, and{' '}
                {TOKEN_AWARD.district} for a district you secure. They buy looks for your piece in
                Shield Central. Nothing else.
              </li>
            </ul>
          </Panel>

          <Panel title="The six skills you practise">
            <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {COMPETENCY_ORDER.map((competency) => (
                <li key={competency} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-[var(--radius-inset)] bg-[var(--color-navy-900)] text-[11px] font-extrabold text-white"
                  >
                    {COMPETENCY_LETTER[competency]}
                  </span>
                  <span className="text-[13px] text-[var(--sq-ink-muted)]">
                    {COMPETENCY_LABEL[competency]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-[var(--sq-ink-muted)]">
              Each skill has a Guardian. A Guardian strengthens only when you make a decision that
              shows that skill — never by chance, never by spending.
            </p>
          </Panel>

          <p className="rounded-[var(--radius-control)] border border-[var(--sq-line)] px-4 py-3 text-[12px] leading-relaxed text-[var(--sq-ink-muted)]">
            ShieldQuest records what you have practised so it can suggest what to practise next. It
            does not profile you, predict what you will do, or rank you against anyone else. Your
            codename and session code stay on this device.
          </p>
        </div>

        <div className="mt-4">
          <Button full onClick={onClose}>
            Back to the board
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
