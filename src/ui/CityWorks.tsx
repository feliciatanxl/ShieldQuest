import { useState } from 'react';

import { DISTRICTS, DISTRICT_ORDER } from '../game/board.ts';
import { nextUpgrade } from '../game/engine.ts';
import { useGame } from '../state/store.ts';
import { CoinIcon } from './Hud.tsx';
import { Button, Sheet } from './primitives.tsx';
import type { DistrictId, GameState } from '../game/types.ts';

/**
 * The city works screen.
 *
 * This is the game's build loop, and until now it was only reachable by landing
 * on one of four community spaces — so a player could hold six hundred coins
 * for ten turns with nothing on screen suggesting there was anything to do with
 * them. Coins are the reason to care about a payout, and a currency you cannot
 * spend when you think of spending it is a score in disguise.
 *
 * Opening it from the purse changes no rule. `buildUpgrade` never cared where
 * the player was standing, the cost and the Trust it returns are unchanged, and
 * a work still buys nothing but infrastructure: it cannot move a Guardian,
 * change a scenario, or make any decision come out differently. That separation
 * is the whole reason coins are allowed to be a reward at all (proposal §3.2 —
 * recognition is earned by demonstrated skill, never bought).
 */
export default function CityWorks({ game, onClose }: { game: GameState; onClose: () => void }) {
  const build = useGame((s) => s.build);
  const [message, setMessage] = useState<{ districtId: DistrictId; text: string } | null>(null);

  const built = DISTRICT_ORDER.reduce((sum, id) => sum + game.districts[id].upgrades, 0);

  return (
    <Sheet labelledBy="works-title" onDismiss={onClose}>
      <header className="sticky top-0 z-10 border-b border-[var(--sq-line)] bg-[var(--sq-surface)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sq-ink-muted)]">
              City works
            </p>
            <h2 id="works-title" className="mt-0.5 text-xl font-extrabold">
              {built} of 12 built
            </h2>
          </div>
          <span className="sq-token-pill" aria-label={`${game.stats.coins} coins`}>
            <CoinIcon size={18} />
            <span className="text-sm font-extrabold tabular-nums">{game.stats.coins}</span>
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
          Works raise the city’s Trust Meter and stay on the board. They never change how a decision
          turns out.
        </p>
      </header>

      <ol className="space-y-3 px-5 py-4">
        {DISTRICT_ORDER.map((districtId) => {
          const district = DISTRICTS[districtId];
          const state = game.districts[districtId];
          const upcoming = nextUpgrade(game, districtId);
          const affordable = upcoming ? game.stats.coins >= upcoming.cost : false;
          const note = message?.districtId === districtId ? message.text : null;

          return (
            <li
              key={districtId}
              className="sq-works-card"
              style={{ ['--district-colour' as string]: district.colour }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold" style={{ color: district.colour }}>
                  {district.name}
                </h3>
                {/* Three slots, always all three. A row that shows only what
                    has been built cannot show what is left to build. */}
                <span className="flex gap-1" aria-label={`${state.upgrades} of 3 works built`}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="sq-works-slot"
                      data-on={i < state.upgrades || undefined}
                    />
                  ))}
                </span>
              </div>

              {upcoming ? (
                <>
                  <p className="mt-2 text-sm font-semibold">{upcoming.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
                    {upcoming.blurb}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant={affordable ? 'earned' : 'quiet'}
                      className="flex-1"
                      onClick={() => {
                        const result = build(districtId);
                        setMessage(
                          result.ok
                            ? {
                                districtId,
                                text: `${upcoming.name} built. +${upcoming.trust} Trust.`,
                              }
                            : { districtId, text: result.reason ?? 'Not yet.' },
                        );
                      }}
                    >
                      <CoinIcon size={16} />
                      <span className="tabular-nums">{upcoming.cost}</span>
                      <span>· Build</span>
                    </Button>
                    <span className="shrink-0 text-xs font-bold text-[var(--sq-safe)]">
                      +{upcoming.trust} Trust
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm font-semibold text-[var(--sq-safe)]">
                  ✓ Fully built — {district.tagline}
                </p>
              )}

              {note ? (
                <p role="status" className="mt-2 text-xs font-semibold text-[var(--sq-ink-muted)]">
                  {note}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="px-5 pb-5">
        <Button full variant="quiet" onClick={onClose}>
          Back to the board
        </Button>
      </div>
    </Sheet>
  );
}
