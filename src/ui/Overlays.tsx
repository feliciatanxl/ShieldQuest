import { useState } from 'react';

import { DISTRICTS, TRACK } from '../game/board.ts';
import {
  COMPETENCY_MEANING,
  GUARDIANS,
  GUARDIAN_BY_ID,
  guardianArt,
} from '../game/content/guardians.ts';
import { nextUpgrade, sessionReport } from '../game/engine.ts';
import { useGame } from '../state/store.ts';
import { Button, CompetencyChip, OutcomeBadge, Sheet } from './primitives.tsx';
import { AGE_BAND_LABEL, type GameState, type GuardianId } from '../game/types.ts';

/* ------------------------------------------------------------------ */
/* Scenario                                                            */
/* ------------------------------------------------------------------ */

function ScenarioSheet() {
  const overlay = useGame((s) => s.overlay);
  const choose = useGame((s) => s.choose);
  const [tagged, setTagged] = useState<string[]>([]);

  if (overlay.kind !== 'scenario') return null;
  const { scenario } = overlay;
  const peer = scenario.mode === 'PEER_SHIELD';

  return (
    <Sheet labelledBy="scenario-title">
      <header
        className="sticky top-0 z-10 border-b px-5 py-4"
        style={{
          borderColor: 'var(--sq-line)',
          background: peer
            ? 'color-mix(in oklab, var(--sq-peer) 16%, var(--sq-surface))'
            : 'var(--sq-surface)',
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sq-ink-muted)]">
          {peer ? 'Peer Shield Mode' : scenario.category}
        </p>
        <h2 id="scenario-title" className="mt-1 text-xl font-bold">
          {scenario.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--sq-ink-muted)]">{scenario.prompt}</p>
      </header>

      <div className="space-y-4 px-5 py-4">
        {/* Transcript */}
        <ol className="space-y-2">
          {scenario.messages.map((message) => {
            if (message.author === 'system') {
              return (
                <li key={message.id} className="text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--sq-ink-muted)]">
                    {message.body}
                  </p>
                  {message.meta ? (
                    <p className="text-[11px] text-[var(--sq-ink-muted)] opacity-80">
                      {message.meta}
                    </p>
                  ) : null}
                </li>
              );
            }
            return (
              <li key={message.id} className="max-w-[86%]">
                {message.displayName ? (
                  <p className="mb-0.5 text-[11px] font-semibold text-[var(--sq-ink-muted)]">
                    {message.displayName}
                  </p>
                ) : null}
                <p className="sq-bubble-them bg-[var(--sq-surface-sunk)] px-3.5 py-2.5 text-sm">
                  {message.body}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Clues — optional, and never required to progress. */}
        {scenario.clues && scenario.clues.length > 0 ? (
          <section className="rounded-[var(--radius-card)] border border-[var(--sq-line)] p-3.5">
            <h3 className="text-sm font-semibold">{scenario.clueQuestion ?? 'What stands out?'}</h3>
            <p className="mt-0.5 text-[11px] text-[var(--sq-ink-muted)]">
              Optional. Tag anything that looks off — it will not change your options.
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {scenario.clues.map((clue) => {
                const on = tagged.includes(clue.id);
                return (
                  <li key={clue.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setTagged((prev) =>
                          prev.includes(clue.id)
                            ? prev.filter((id) => id !== clue.id)
                            : [...prev, clue.id],
                        )
                      }
                      className="rounded-[var(--radius-control)] border px-2.5 py-1.5 text-xs font-medium"
                      style={{
                        borderColor: on ? 'var(--sq-action-text)' : 'var(--sq-line-strong)',
                        color: on ? 'var(--sq-action-text)' : 'var(--sq-ink)',
                      }}
                    >
                      {on ? '✓ ' : ''}
                      {clue.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            {tagged.length > 0 ? (
              <ul className="mt-3 space-y-1.5 border-t border-[var(--sq-line)] pt-3">
                {scenario.clues
                  .filter((clue) => tagged.includes(clue.id))
                  .map((clue) => (
                    <li
                      key={clue.id}
                      className="text-xs leading-relaxed text-[var(--sq-ink-muted)]"
                    >
                      <strong className="text-[var(--sq-ink)]">{clue.label}:</strong> {clue.note}
                    </li>
                  ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {/* Decision */}
        <section>
          <h3 className="mb-2 text-sm font-semibold">What do you do?</h3>
          <ul className="space-y-2">
            {scenario.choices.map((choice) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => choose(choice.id)}
                  className="w-full rounded-[var(--radius-card)] border border-[var(--sq-line-strong)] bg-[var(--sq-surface-raised)] px-4 py-3 text-left transition-colors hover:border-[var(--sq-action-text)]"
                >
                  <span className="block text-sm font-semibold">{choice.label}</span>
                  {choice.hint ? (
                    <span className="mt-0.5 block text-xs text-[var(--sq-ink-muted)]">
                      {choice.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
            There is no timer. Talk it through with your squad before you pick.
          </p>
        </section>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Short card                                                          */
/* ------------------------------------------------------------------ */

function CardSheet() {
  const overlay = useGame((s) => s.overlay);
  const answerCard = useGame((s) => s.answerCard);
  if (overlay.kind !== 'card') return null;
  const { card, guardianTrial } = overlay;

  return (
    <Sheet labelledBy="card-title" tone={guardianTrial ? 'earned' : 'default'}>
      <div className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sq-ink-muted)]">
          {guardianTrial ? 'Guardian checkpoint · counts double' : 'Situation card'}
        </p>
        <h2 id="card-title" className="mt-1 text-xl font-bold">
          {card.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--sq-ink-muted)]">{card.body}</p>

        <div className="mt-3">
          <CompetencyChip competency={card.competency} />
        </div>

        <ul className="mt-4 space-y-2">
          {card.options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => answerCard(option.id)}
                className="w-full rounded-[var(--radius-card)] border border-[var(--sq-line-strong)] bg-[var(--sq-surface-raised)] px-4 py-3 text-left text-sm font-semibold transition-colors hover:border-[var(--sq-action-text)]"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Debrief                                                             */
/* ------------------------------------------------------------------ */

/**
 * What the player learns, immediately after they decide.
 *
 * Note what this never does: it does not tell a player they should have known
 * better. Every line describes what the other party was doing and what a
 * stronger response looks like. The proposal's risk register names
 * victim-blaming explicitly, and this sheet is where that rule is either kept
 * or broken.
 */
function DebriefSheet() {
  const overlay = useGame((s) => s.overlay);
  const dismiss = useGame((s) => s.dismiss);
  if (overlay.kind !== 'debrief') return null;
  const { debrief, outcome, reply } = overlay;
  const guardian = debrief.guardianId ? GUARDIAN_BY_ID[debrief.guardianId] : null;

  return (
    <Sheet labelledBy="debrief-title" onDismiss={dismiss}>
      <div className="space-y-4 px-5 py-5">
        {reply ? (
          <p className="sq-bubble-you ml-auto max-w-[86%] bg-[var(--sq-action)] px-3.5 py-2.5 text-sm text-[var(--sq-action-ink)]">
            {reply}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <OutcomeBadge outcome={outcome} />
          <CompetencyChip competency={debrief.competency} />
        </div>

        <div>
          <h2 id="debrief-title" className="text-xl font-bold">
            {debrief.headline}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
            {debrief.body}
          </p>
        </div>

        {debrief.spotted && debrief.spotted.length > 0 ? (
          <section className="rounded-[var(--radius-card)] border border-[var(--sq-line)] p-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              What you acted on
            </h3>
            <ul className="mt-2 space-y-1">
              {debrief.spotted.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span aria-hidden="true" style={{ color: 'var(--sq-safe)' }}>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {debrief.sampleScript ? (
          <section
            className="rounded-[var(--radius-card)] p-3.5"
            style={{ background: 'color-mix(in oklab, var(--sq-peer) 14%, transparent)' }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              Something you could actually say
            </h3>
            <p className="mt-1.5 text-sm italic">“{debrief.sampleScript}”</p>
          </section>
        ) : null}

        {debrief.saferResponse ? (
          <section className="rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              The safer response
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed">{debrief.saferResponse}</p>
          </section>
        ) : null}

        {guardian ? (
          <p className="flex items-center gap-2 text-xs text-[var(--sq-ink-muted)]">
            <img src={guardianArt(guardian.id)} alt="" className="h-6 w-6" aria-hidden="true" />
            <span>
              <strong className="text-[var(--sq-earned-text)]">{guardian.name}</strong> grew
              stronger — {guardian.skill}.
            </span>
          </p>
        ) : null}

        <Button full onClick={dismiss}>
          Continue
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Delayed consequence                                                 */
/* ------------------------------------------------------------------ */

/**
 * The Delayed Consequence Engine's moment on screen.
 *
 * It arrives turns after the decision, unprompted, and it takes over the whole
 * screen — because the point being made is that the bill came separately from
 * the purchase. The tone is deliberately sober rather than punishing: this is a
 * consequence, not a telling-off.
 */
function ConsequenceTakeover() {
  const overlay = useGame((s) => s.overlay);
  const dismiss = useGame((s) => s.dismiss);
  if (overlay.kind !== 'consequence') return null;
  const { pending, shortfall } = overlay;
  const c = pending.consequence;

  return (
    <Sheet labelledBy="consequence-title" tone="risk" onDismiss={dismiss}>
      <div className="space-y-4 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sq-risk)]">
          {c.timeLabel}
        </p>
        <h2 id="consequence-title" className="text-2xl font-bold leading-tight">
          {c.headline}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--sq-ink-muted)]">{c.body}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              What you got then
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {c.changedImmediate.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section
            className="rounded-[var(--radius-card)] p-3.5"
            style={{ background: 'color-mix(in oklab, var(--sq-risk) 14%, transparent)' }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              What it cost later
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {c.changedLater.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        {shortfall > 0 ? (
          <p className="rounded-[var(--radius-card)] border border-[var(--sq-risk)] p-3.5 text-sm leading-relaxed">
            <strong>{shortfall} coins had already been spent.</strong> The reversal could only take
            what was left, and the rest came out of the city’s trust instead. Money that was never
            really yours is the hardest kind to give back.
          </p>
        ) : null}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            The signals that were there
          </h3>
          <ul className="mt-2 space-y-1.5">
            {c.warningSigns.map((sign) => (
              <li key={sign} className="flex gap-2 text-sm">
                <span aria-hidden="true" style={{ color: 'var(--sq-risk)' }}>
                  !
                </span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            What works instead
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed">{c.saferResponse}</p>
        </section>

        <Button full onClick={dismiss}>
          I understand
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Guardian met                                                        */
/* ------------------------------------------------------------------ */

function AwardSheet() {
  const overlay = useGame((s) => s.overlay);
  const dismiss = useGame((s) => s.dismiss);
  if (overlay.kind !== 'award') return null;
  const guardian = GUARDIAN_BY_ID[overlay.guardianId];

  return (
    <Sheet labelledBy="award-title" tone="earned" onDismiss={dismiss}>
      <div className="px-5 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sq-earned-text)]">
          Guardian earned
        </p>
        <img
          src={guardianArt(guardian.id)}
          alt=""
          aria-hidden="true"
          className="sq-stamp mx-auto mt-4 h-28 w-28"
        />
        <h2 id="award-title" className="mt-3 text-2xl font-bold">
          {guardian.name}
        </h2>
        <p className="text-sm font-medium text-[var(--sq-earned-text)]">{guardian.skill}</p>
        <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--sq-ink-muted)]">
          {guardian.description}
        </p>
        <p className="mx-auto mt-3 max-w-[38ch] text-sm italic">“{guardian.greeting}”</p>

        <p className="mx-auto mt-4 max-w-[40ch] rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-3 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
          You met {guardian.name} by making {guardian.target / 2} decisions that showed{' '}
          {COMPETENCY_MEANING[guardian.competency].split('.')[0]!.toLowerCase()}. Guardians are
          never bought and never rolled for.
        </p>

        <Button full variant="earned" className="mt-5" onClick={dismiss}>
          Continue
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* District secured                                                    */
/* ------------------------------------------------------------------ */

function SecuredSheet() {
  const overlay = useGame((s) => s.overlay);
  const dismiss = useGame((s) => s.dismiss);
  if (overlay.kind !== 'secured') return null;
  const district = DISTRICTS[overlay.districtId];

  return (
    <Sheet labelledBy="secured-title" tone="earned" onDismiss={dismiss}>
      <div className="px-5 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sq-ink-muted)]">
          District secured
        </p>
        <h2
          id="secured-title"
          className="mt-2 text-2xl font-bold"
          style={{ color: district.colour }}
        >
          {district.name}
        </h2>
        <p className="mx-auto mt-2 max-w-[36ch] text-sm leading-relaxed text-[var(--sq-ink-muted)]">
          {district.tagline} You have played every decision space here.
        </p>
        <Button full variant="earned" className="mt-5" onClick={dismiss}>
          Keep going
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Gate                                                                */
/* ------------------------------------------------------------------ */

function GateSheet() {
  const overlay = useGame((s) => s.overlay);
  const dismiss = useGame((s) => s.dismiss);
  if (overlay.kind !== 'gate') return null;
  const district = DISTRICTS[overlay.space.districtId];

  return (
    <Sheet labelledBy="gate-title" onDismiss={dismiss}>
      <div className="px-5 py-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sq-ink-muted)]">
          Entering
        </p>
        <h2 id="gate-title" className="mt-1 text-2xl font-bold" style={{ color: district.colour }}>
          {district.name}
        </h2>
        <p className="mx-auto mt-2 max-w-[34ch] text-sm text-[var(--sq-ink-muted)]">
          {district.themes}
        </p>
        <p className="mt-4 text-lg font-bold text-[var(--sq-earned-text)]">
          +{overlay.stipend} coins
        </p>
        <Button full className="mt-5" onClick={dismiss}>
          Continue
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Community works                                                     */
/* ------------------------------------------------------------------ */

function CommunitySheet() {
  const overlay = useGame((s) => s.overlay);
  const game = useGame((s) => s.game);
  const build = useGame((s) => s.build);
  const dismiss = useGame((s) => s.dismiss);
  const [message, setMessage] = useState<string | null>(null);

  if (overlay.kind !== 'community' || !game) return null;
  const districtId = overlay.districtId;
  const district = DISTRICTS[districtId];
  const upcoming = nextUpgrade(game, districtId);
  const built = game.districts[districtId].upgrades;

  return (
    <Sheet labelledBy="community-title" onDismiss={dismiss}>
      <div className="space-y-4 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sq-ink-muted)]">
            Community works
          </p>
          <h2 id="community-title" className="mt-1 text-xl font-bold">
            {district.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--sq-ink-muted)]">
            Spend coins on something the district keeps. Works raise the city’s Trust Meter — they
            never change how a decision turns out.
          </p>
        </div>

        <ol className="space-y-2">
          {district.upgrades.map((upgrade, i) => {
            const done = i < built;
            const isNext = i === built;
            return (
              <li
                key={upgrade.name}
                className="rounded-[var(--radius-card)] border p-3.5"
                style={{
                  borderColor: done ? 'var(--sq-safe)' : 'var(--sq-line)',
                  opacity: done || isNext ? 1 : 0.55,
                }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {done ? '✓ ' : ''}
                    {upgrade.name}
                  </h3>
                  <span className="text-xs tabular-nums text-[var(--sq-ink-muted)]">
                    {done ? 'Built' : `${upgrade.cost} coins`}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
                  {upgrade.blurb}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--sq-safe)]">
                  +{upgrade.trust} Trust
                </p>
              </li>
            );
          })}
        </ol>

        {message ? <p className="text-sm text-[var(--sq-risk)]">{message}</p> : null}

        <div className="flex gap-2">
          <Button variant="quiet" className="flex-1" onClick={dismiss}>
            Not now
          </Button>
          <Button
            className="flex-1"
            disabled={!upcoming || game.stats.coins < (upcoming?.cost ?? 0)}
            onClick={() => {
              const result = build(districtId);
              if (!result.ok) setMessage(result.reason ?? null);
              else setMessage(null);
            }}
          >
            {upcoming ? `Build · ${upcoming.cost}` : 'Fully built'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Tile inspector                                                      */
/* ------------------------------------------------------------------ */

/**
 * Tapping any space explains what it is.
 *
 * This is how the board stays readable without a legend, and it is also the
 * only way a facilitator can point at a space during the debrief and have
 * everyone see the same description.
 */
export function InspectSheet({ index, onClose }: { index: number; onClose: () => void }) {
  const game = useGame((s) => s.game);
  const space = TRACK[index];
  if (!space || !game) return null;
  const district = DISTRICTS[space.districtId];
  const guardian = space.guardianId ? GUARDIAN_BY_ID[space.guardianId] : null;

  return (
    <Sheet labelledBy="inspect-title" onDismiss={onClose}>
      <div className="space-y-3 px-5 py-5">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: district.colour }}
        >
          {district.name} · space {space.index + 1}
        </p>
        <h2 id="inspect-title" className="text-xl font-bold">
          {space.title}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--sq-ink-muted)]">{space.summary}</p>
        {space.competency ? <CompetencyChip competency={space.competency} /> : null}
        {guardian ? (
          <p className="flex items-center gap-2 text-xs text-[var(--sq-ink-muted)]">
            <img src={guardianArt(guardian.id)} alt="" aria-hidden="true" className="h-6 w-6" />
            Practises the skill {guardian.name} represents — {guardian.skill}.
          </p>
        ) : null}
        {game.resolved.includes(space.id) ? (
          <p className="text-xs font-medium text-[var(--sq-safe)]">You have played this space.</p>
        ) : null}
        <Button full variant="quiet" onClick={onClose}>
          Close
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Skills panel                                                        */
/* ------------------------------------------------------------------ */

export function SkillsSheet({ game, onClose }: { game: GameState; onClose: () => void }) {
  return (
    <Sheet labelledBy="skills-title" onDismiss={onClose}>
      <div className="space-y-4 px-5 py-5">
        <div>
          <h2 id="skills-title" className="text-xl font-bold">
            S.H.I.E.L.D. skills
          </h2>
          <p className="mt-1 text-sm text-[var(--sq-ink-muted)]">
            One Guardian per skill. Each one strengthens only when you make a decision that shows
            that skill — never from a roll, a coin or a purchase.
          </p>
        </div>

        <ul className="space-y-2">
          {GUARDIANS.map((guardian) => {
            const progress = Math.min(game.guardianProgress[guardian.id] ?? 0, guardian.target);
            const met = game.metGuardians.includes(guardian.id);
            return (
              <li
                key={guardian.id}
                className="flex gap-3 rounded-[var(--radius-card)] border p-3"
                style={{ borderColor: met ? 'var(--sq-earned)' : 'var(--sq-line)' }}
              >
                <img
                  src={guardianArt(guardian.id)}
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 shrink-0"
                  style={{ opacity: met ? 1 : 0.5 }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      {guardian.name}
                      {met ? (
                        <span className="ml-2 text-[11px] font-bold uppercase text-[var(--sq-earned-text)]">
                          Met
                        </span>
                      ) : null}
                    </h3>
                    <span className="text-[11px] tabular-nums text-[var(--sq-ink-muted)]">
                      {progress}/{guardian.target}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--sq-ink-muted)]">
                    {guardian.skill} · {guardian.ability}
                  </p>
                  <div className="sq-meter mt-1.5">
                    <i
                      style={{
                        width: `${(progress / guardian.target) * 100}%`,
                        ['--meter-colour' as string]: 'var(--sq-earned)',
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
                    {COMPETENCY_MEANING[guardian.competency]}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <Button full variant="quiet" onClick={onClose}>
          Close
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Session report                                                      */
/* ------------------------------------------------------------------ */

/**
 * The end-of-run summary, and the input to the facilitated debrief.
 *
 * It reports what the run did, never who did it: the session code is the only
 * identifier, exactly as the implementation plan commits to. A facilitator
 * aggregates these across a squad; nothing here supports singling anyone out.
 */
function ReportSheet() {
  const game = useGame((s) => s.game);
  const abandon = useGame((s) => s.abandon);
  const dismiss = useGame((s) => s.dismiss);
  if (!game) return null;
  const report = sessionReport(game);

  return (
    <Sheet labelledBy="report-title" onDismiss={dismiss}>
      <div className="space-y-4 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sq-ink-muted)]">
            Session {report.sessionCode} · {AGE_BAND_LABEL[game.band]}
          </p>
          <h2 id="report-title" className="mt-1 text-2xl font-bold">
            How the run went
          </h2>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          {[
            { label: 'Decisions made', value: report.decisions },
            { label: 'Safer choices', value: `${report.safeRate}%` },
            { label: 'City Trust', value: report.stats.trust },
            { label: 'Resilience', value: report.stats.resilience },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-3"
            >
              <dt className="text-[11px] text-[var(--sq-ink-muted)]">{stat.label}</dt>
              <dd className="text-xl font-bold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            Skills demonstrated
          </h3>
          <ul className="mt-2 space-y-1.5">
            {report.competencyProgress.map((entry) => (
              <li key={entry.guardianId} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-xs">{entry.name}</span>
                <span className="sq-meter flex-1">
                  <i
                    style={{
                      width: `${Math.min(100, (entry.progress / entry.target) * 100)}%`,
                      ['--meter-colour' as string]: report.guardians.includes(entry.guardianId)
                        ? 'var(--sq-earned)'
                        : 'var(--sq-action)',
                    }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-[var(--sq-ink-muted)]">
                  {entry.progress}/{entry.target}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-3 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
          Keep your session code —{' '}
          <strong className="text-[var(--sq-ink)]">{report.sessionCode}</strong> — for the short
          form at the end. It is the only thing linking your answers before and after, and it is not
          linked to your name.
        </p>

        <div className="flex gap-2">
          <Button variant="quiet" className="flex-1" onClick={dismiss}>
            Back to the board
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              if (confirm('End this session and clear the run from this device?')) abandon();
            }}
          >
            End session
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */

export function Overlays() {
  const kind = useGame((s) => s.overlay.kind);
  switch (kind) {
    case 'scenario':
      return <ScenarioSheet />;
    case 'card':
      return <CardSheet />;
    case 'debrief':
      return <DebriefSheet />;
    case 'consequence':
      return <ConsequenceTakeover />;
    case 'award':
      return <AwardSheet />;
    case 'secured':
      return <SecuredSheet />;
    case 'gate':
      return <GateSheet />;
    case 'community':
      return <CommunitySheet />;
    case 'report':
      return <ReportSheet />;
    default:
      return null;
  }
}

export type { GuardianId };
