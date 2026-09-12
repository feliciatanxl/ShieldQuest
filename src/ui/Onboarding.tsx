import { useMemo, useState } from 'react';

import { RUN_LENGTH } from '../game/engine.ts';
import { useGame } from '../state/store.ts';
import { Button } from './primitives.tsx';
import { AGE_BAND_LABEL, type AgeBand } from '../game/types.ts';

/**
 * Getting into the game.
 *
 * No account, no email, no sign-up — a participant scans a QR code and is
 * playing inside thirty seconds, which is what the proposal means by "mobile-first
 * PWA with no install". The only thing asked for is a codename, and the copy
 * says plainly that it must not be a real name. Nothing typed here leaves the
 * device.
 */

const CODENAME_FIRST = [
  'Quiet',
  'Sharp',
  'Steady',
  'Bright',
  'Swift',
  'Calm',
  'Bold',
  'Clever',
  'Patient',
  'Solid',
];
const CODENAME_SECOND = [
  'Otter',
  'Falcon',
  'Comet',
  'Anchor',
  'Lantern',
  'Compass',
  'Beacon',
  'Harbour',
  'Signal',
  'Keeper',
];

const randomCodename = () =>
  `${CODENAME_FIRST[Math.floor(Math.random() * CODENAME_FIRST.length)]} ${
    CODENAME_SECOND[Math.floor(Math.random() * CODENAME_SECOND.length)]
  }`;

const BANDS: { id: AgeBand; themes: string }[] = [
  { id: 'B10_13', themes: 'Stranger approaches, game scams, cyberbullying, online safety' },
  { id: 'B14_16', themes: 'Shop theft, phishing, harassment, risky dares' },
  { id: 'B17_24', themes: 'Job scams, money-mule recruitment, suspicious financial requests' },
];

const RUNS = [
  { turns: RUN_LENGTH.QUICK, label: 'Quick', hint: '12 turns · about 15 minutes' },
  { turns: RUN_LENGTH.SESSION, label: 'Full session', hint: '24 turns · about 45 minutes' },
  { turns: RUN_LENGTH.OPEN, label: 'Open', hint: 'No limit · play until you stop' },
];

export default function Onboarding() {
  const start = useGame((s) => s.start);
  const resume = useGame((s) => s.resume);
  const suggestion = useMemo(randomCodename, []);
  const [handle, setHandle] = useState(suggestion);
  const [band, setBand] = useState<AgeBand>('B14_16');
  const [turns, setTurns] = useState<number>(RUN_LENGTH.SESSION);

  const hasSave = useMemo(() => {
    try {
      return Boolean(localStorage.getItem('shieldquest.session.v2'));
    } catch {
      return false;
    }
  }, []);

  return (
    <main
      data-skin="game"
      className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 bg-[var(--sq-canvas)] px-5 py-10"
    >
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--sq-action-text)]">
          Project SHIELD
        </p>
        <h1 className="mt-1 text-4xl font-black leading-none tracking-tight">ShieldQuest</h1>
        <p className="mt-2 text-base font-medium text-[var(--sq-ink-muted)]">
          Choose right. Protect together.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
          Roll, land, decide. Some choices pay straight away — and cost you three days later. Find
          out which ones before it matters.
        </p>
      </header>

      {hasSave ? (
        <Button
          variant="quiet"
          full
          onClick={() => {
            if (!resume()) alert('That saved run could not be read. Start a new one.');
          }}
        >
          Continue your saved run
        </Button>
      ) : null}

      <section>
        <label htmlFor="handle" className="text-sm font-semibold">
          Pick a codename
        </label>
        <p className="mt-0.5 text-xs text-[var(--sq-ink-muted)]">
          Not your real name. This stays on your device and is never sent anywhere.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="handle"
            value={handle}
            maxLength={22}
            onChange={(event) => setHandle(event.target.value)}
            className="min-w-0 flex-1 rounded-[var(--radius-control)] border border-[var(--sq-line-strong)] bg-[var(--sq-surface)] px-3.5 py-3 text-sm"
          />
          <Button variant="quiet" onClick={() => setHandle(randomCodename())}>
            Shuffle
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Age group</h2>
        <p className="mt-0.5 text-xs text-[var(--sq-ink-muted)]">
          Your facilitator picks this. It decides which situations you are shown.
        </p>
        <ul className="mt-2 space-y-2">
          {BANDS.map((option) => {
            const selected = band === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setBand(option.id)}
                  className="w-full rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: selected ? 'var(--sq-action-text)' : 'var(--sq-line)',
                    background: selected
                      ? 'color-mix(in oklab, var(--sq-action) 14%, transparent)'
                      : 'transparent',
                  }}
                >
                  <span className="block text-sm font-semibold">
                    {selected ? '✓ ' : ''}
                    {AGE_BAND_LABEL[option.id]}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--sq-ink-muted)]">
                    {option.themes}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold">How long have you got?</h2>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {RUNS.map((run) => {
            const selected = turns === run.turns;
            return (
              <li key={run.label}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTurns(run.turns)}
                  className="h-full w-full rounded-[var(--radius-card)] border px-3 py-2.5 text-left"
                  style={{
                    borderColor: selected ? 'var(--sq-action-text)' : 'var(--sq-line)',
                    background: selected
                      ? 'color-mix(in oklab, var(--sq-action) 14%, transparent)'
                      : 'transparent',
                  }}
                >
                  <span className="block text-sm font-semibold">{run.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-[var(--sq-ink-muted)]">
                    {run.hint}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Button
        full
        disabled={handle.trim().length === 0}
        onClick={() => start({ handle: handle.trim(), band, turnLimit: turns })}
      >
        Enter the city
      </Button>

      <footer className="space-y-2 border-t border-[var(--sq-line)] pt-4 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
        <p>
          <strong className="text-[var(--sq-ink)]">What this never asks for:</strong> your name,
          NRIC, phone number, address, or any banking or account details. Not in a form, and not
          inside a scenario.
        </p>
        <p>
          Every situation in the game is fictional. Statistics quoted in facilitator materials come
          from the Singapore Police Force Annual Crime Brief 2025 and Annual Scam and Cybercrime
          Brief 2025; ShieldQuest is a student project and is not endorsed by any agency.
        </p>
      </footer>
    </main>
  );
}
