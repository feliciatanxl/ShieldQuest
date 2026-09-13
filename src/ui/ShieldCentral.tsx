import { useState } from 'react';

import { achievementsFor } from '../game/achievements.ts';
import { COSMETICS, equippedCosmetic } from '../game/content/cosmetics.ts';
import { TOKEN_AWARD } from '../game/engine.ts';
import { useGame } from '../state/store.ts';
import { Button, Sheet } from './primitives.tsx';
import type { Cosmetic, GameState } from '../game/types.ts';

/**
 * Shield Central — where a player spends what they earned, and sees what they
 * earned that cannot be spent.
 *
 * Two tabs, and the split between them is the whole design:
 *
 *   Rewards       cosmetics, bought with Shield Tokens. Every price visible,
 *                 nothing sealed, nothing randomised, nothing on a timer.
 *   Achievements  a record of what the player actually did. No price, no way
 *                 to buy one, and no comparison to anybody else.
 *
 * Keeping recognition out of the shop is what lets the shop exist. The
 * proposal commits to progress earned through demonstrated skill rather than
 * chance or payment (section 3.2), and a badge reading "mastery of phishing
 * vectors" with a price on it — which is what v1's shop sold — would break that
 * commitment in the one screen a player is most likely to show a friend.
 */

/** The player's piece, drawn the same way the flat board draws it. */
function PieceSwatch({ cosmetic, size = 34 }: { cosmetic: Cosmetic; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${cosmetic.colour} 35%, white), ${cosmetic.colour} 62%, color-mix(in oklab, ${cosmetic.colour} 55%, black))`,
        border: '2px solid var(--sq-canvas)',
        boxShadow: cosmetic.glow
          ? `0 0 0 3px color-mix(in oklab, ${cosmetic.glow} 55%, transparent), 0 2px 6px rgb(0 0 0 / 0.45)`
          : '0 2px 6px rgb(0 0 0 / 0.45)',
      }}
    />
  );
}

function TokenCount({ tokens }: { tokens: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 px-3 py-1.5 text-sm font-bold text-[var(--sq-earned-text)]">
      <span aria-hidden="true">◆</span>
      <span className="tabular-nums">{tokens}</span>
      <span className="sr-only">Shield Tokens</span>
    </span>
  );
}

function Rewards({ game }: { game: GameState }) {
  const buy = useGame((s) => s.buy);
  const equip = useGame((s) => s.equip);
  const [notice, setNotice] = useState<string | null>(null);

  const current = equippedCosmetic(game.equipped);

  const act = (cosmetic: Cosmetic) => {
    const owned = cosmetic.cost === 0 || game.unlocked.includes(cosmetic.id);
    if (owned) {
      equip(cosmetic.id);
      setNotice(`${cosmetic.name} is on your piece.`);
      return;
    }
    const result = buy(cosmetic.id);
    setNotice(result.ok ? `Unlocked ${cosmetic.name}.` : (result.reason ?? 'Not yet.'));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] p-3">
        <PieceSwatch cosmetic={current} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{current.name}</p>
          <p className="text-[12px] text-[var(--sq-ink-muted)]">On your piece right now.</p>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-[var(--radius-control)] border border-[var(--sq-line)] px-3 py-2 text-[13px] text-[var(--sq-ink)]"
        >
          {notice}
        </p>
      ) : null}

      <ul className="space-y-2">
        {COSMETICS.map((cosmetic) => {
          const owned = cosmetic.cost === 0 || game.unlocked.includes(cosmetic.id);
          const worn = current.id === cosmetic.id;
          const affordable = game.tokens >= cosmetic.cost;
          return (
            <li
              key={cosmetic.id}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border p-3"
              style={{ borderColor: worn ? 'var(--sq-earned)' : 'var(--sq-line)' }}
            >
              <PieceSwatch cosmetic={cosmetic} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">{cosmetic.name}</h3>
                <p className="text-[12px] leading-snug text-[var(--sq-ink-muted)]">
                  {cosmetic.blurb}
                </p>
              </div>
              {/*
                Price and button share one fixed-width right column, so the
                prices line up with each other and with the buttons under them.
                The price used to sit at the end of the title row, which made
                its position depend on how long the name was: ◆ 80, ◆ 120 and
                ◆ 160 each landed somewhere different down the list.
              */}
              <div className="flex w-[92px] shrink-0 flex-col items-end gap-1.5">
                <span
                  className="text-[12px] font-bold tabular-nums text-[var(--sq-earned-text)]"
                  // Held in place rather than removed when there is nothing to
                  // charge, so an owned row is the same height as a locked one.
                  style={{ visibility: owned ? 'hidden' : 'visible' }}
                  aria-hidden={owned}
                >
                  ◆ {cosmetic.cost}
                </span>
                <Button
                  variant={worn ? 'ghost' : owned ? 'quiet' : affordable ? 'earned' : 'ghost'}
                  className="w-full px-3 py-2 text-[13px]"
                  disabled={worn || (!owned && !affordable)}
                  onClick={() => act(cosmetic)}
                >
                  {worn ? 'Worn' : owned ? 'Wear' : affordable ? 'Unlock' : 'Locked'}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="rounded-[var(--radius-control)] border border-[var(--sq-line)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--sq-ink-muted)]">
        Shield Tokens are credit for taking part. They are not money, cannot be cashed out, and are
        never paid for a dice roll or for doing better than anyone else — {TOKEN_AWARD.decision} for
        answering a situation, whatever you answered, and {TOKEN_AWARD.district} for a district your
        decisions secure. They buy looks for your piece and nothing else: no item here changes a
        roll, a stat or a scenario.
      </p>
    </div>
  );
}

function Achievements({ game }: { game: GameState }) {
  const achievements = achievementsFor(game);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {achievements.map((achievement) => (
          <li
            key={achievement.id}
            className="rounded-[var(--radius-card)] border p-3"
            style={{
              borderColor: achievement.earned ? 'var(--sq-earned)' : 'var(--sq-line)',
              background: achievement.earned
                ? 'color-mix(in oklab, var(--sq-earned) 10%, transparent)'
                : 'transparent',
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {achievement.name}
                {achievement.earned ? (
                  <span className="ml-2 text-[11px] font-bold uppercase text-[var(--sq-earned-text)]">
                    Earned
                  </span>
                ) : null}
              </h3>
              {achievement.progress && !achievement.earned ? (
                <span className="shrink-0 text-[11px] tabular-nums text-[var(--sq-ink-muted)]">
                  {achievement.progress.now}/{achievement.progress.goal}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-[var(--sq-ink-muted)]">
              {achievement.blurb}
            </p>
          </li>
        ))}
      </ul>

      <p className="rounded-[var(--radius-control)] border border-[var(--sq-line)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--sq-ink-muted)]">
        These cannot be bought, and there is no leaderboard behind them. Each one is a record of
        something you did in this run — nothing here compares you to anybody else.
      </p>
    </div>
  );
}

export default function ShieldCentral({ game, onClose }: { game: GameState; onClose: () => void }) {
  const [tab, setTab] = useState<'rewards' | 'achievements'>('rewards');
  const earned = achievementsFor(game).filter((achievement) => achievement.earned).length;

  return (
    <Sheet labelledBy="shield-central-title" onDismiss={onClose}>
      <div className="max-h-[82dvh] overflow-y-auto px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--sq-action-text)]">
              {game.handle}
            </p>
            <h2 id="shield-central-title" className="mt-1 text-xl font-bold">
              Shield Central
            </h2>
          </div>
          <TokenCount tokens={game.tokens} />
        </div>

        <div
          role="tablist"
          aria-label="Shield Central"
          className="mt-4 flex gap-1 rounded-[var(--radius-control)] bg-[var(--sq-surface-sunk)] p-1"
        >
          {(
            [
              ['rewards', `Rewards`],
              ['achievements', `Achievements · ${earned}/8`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className="flex-1 rounded-[var(--radius-inset)] px-3 py-2 text-[13px] font-semibold transition"
              style={{
                background: tab === id ? 'var(--sq-surface-raised)' : 'transparent',
                color: tab === id ? 'var(--sq-ink)' : 'var(--sq-ink-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === 'rewards' ? <Rewards game={game} /> : <Achievements game={game} />}
        </div>

        <div className="mt-4">
          <Button full variant="quiet" onClick={onClose}>
            Back to the board
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
