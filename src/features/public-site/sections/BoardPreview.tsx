import { Shield } from 'lucide-react';

/**
 * A still of the player experience, shown on the landing page.
 *
 * This panel sets `data-skin="game"`, so it renders with the dark player
 * palette while everything around it stays on the light civic skin. That is
 * the two-skin token system doing its job in the one place a visitor can see
 * both at once — and it means this preview cannot drift away from the real
 * board's colours, because both read the same tokens.
 *
 * It is a static composition rather than the live board: the landing page must
 * stay fast on a school Wi-Fi connection, and the real board pulls in session
 * state and a WebGL layer that a visitor has no session for.
 */

/** Walk the perimeter of a 5x5 grid: 16 spaces, matching one district. */
const PERIMETER: { col: number; row: number }[] = [
  ...Array.from({ length: 5 }, (_, i) => ({ col: i, row: 0 })),
  ...Array.from({ length: 4 }, (_, i) => ({ col: 4, row: i + 1 })),
  ...Array.from({ length: 4 }, (_, i) => ({ col: 3 - i, row: 4 })),
  ...Array.from({ length: 3 }, (_, i) => ({ col: 0, row: 3 - i })),
];

/** Corner spaces carry the district's fixed landmarks. */
const CORNERS: Record<number, { label: string; tone: string }> = {
  0: { label: 'Start', tone: 'bg-[var(--sq-earned)]' },
  4: { label: 'Safe', tone: 'bg-[var(--sq-peer)]' },
  8: { label: 'Risk', tone: 'bg-[var(--sq-risk)]' },
  12: { label: 'Clue', tone: 'bg-[var(--sq-action)]' },
};

/** Where the player token currently sits. */
const TOKEN_INDEX = 6;

export function BoardPreview() {
  return (
    <div
      data-skin="game"
      className="overflow-hidden rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-canvas)] shadow-[var(--sq-shadow-float)]"
    >
      {/* Window chrome — signals "this is the app" without faking a phone. */}
      <div className="flex items-center justify-between border-b border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
          School Street · District 1
        </span>
        <span className="rounded-full bg-[var(--sq-surface-raised)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
          16 spaces
        </span>
      </div>

      {/* The isometric stage. The board plane is tilted and rotated; tiles lie
       * flat on it, so no tile carries text — labels live in upright layers
       * above the plane where they stay legible. */}
      <div className="relative flex h-[272px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,var(--color-navy-800),var(--sq-canvas)_70%)]">
        <div
          aria-hidden="true"
          className="relative h-[200px] w-[200px] shrink-0"
          style={{
            transform: 'rotateX(58deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Board floor — sunk well below the tiles so the track reads as
           * raised kerbstones rather than as flat paint. */}
          <div className="absolute -inset-1 rounded-[8px] border border-[var(--color-navy-700)]/60 bg-[#04101f]" />

          {/* Perimeter track. Every tile must contrast against the floor, or
           * the board stops reading as a circuit — which is the one thing this
           * image has to communicate. */}
          {PERIMETER.map((cell, index) => {
            const corner = CORNERS[index];
            return (
              <div
                key={index}
                className={`absolute rounded-[2px] border ${
                  corner
                    ? `${corner.tone} border-white/40`
                    : 'border-[var(--color-civic-400)]/30 bg-[var(--color-navy-700)]'
                }`}
                style={{
                  width: '17.5%',
                  height: '17.5%',
                  left: `${cell.col * 20.6 + 1}%`,
                  top: `${cell.row * 20.6 + 1}%`,
                  transform: `translateZ(${corner ? 9 : 4}px)`,
                  boxShadow: corner
                    ? '0 -6px 0 -1px rgb(0 0 0 / 0.35)'
                    : '0 -3px 0 -1px rgb(0 0 0 / 0.35)',
                }}
              />
            );
          })}

          {/* District landmark. Counter-rotated so it stands upright facing
           * the camera instead of lying flat on the tilted plane. */}
          <div
            className="absolute left-1/2 top-1/2 flex h-[54px] w-[54px] items-center justify-center rounded-[8px] border border-[var(--sq-earned)]/60 bg-[var(--color-navy-950)] shadow-xl"
            style={{
              transform:
                'translate(-50%, -50%) translateZ(34px) rotateZ(45deg) rotateX(-58deg)',
            }}
          >
            <Shield className="h-7 w-7 fill-current text-[var(--sq-earned-text)]" />
          </div>

          {/* Player token, also billboarded upright, with a cast shadow on the
           * board so it reads as standing on a space rather than floating. */}
          <div
            className="absolute flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white bg-[var(--sq-action)] text-[9px] font-black text-white shadow-lg"
            style={{
              left: `${PERIMETER[TOKEN_INDEX].col * 20.6 + 4}%`,
              top: `${PERIMETER[TOKEN_INDEX].row * 20.6 + 4}%`,
              transform: 'translateZ(30px) rotateZ(45deg) rotateX(-58deg)',
            }}
          >
            P1
          </div>
          <div
            className="absolute rounded-full bg-black/45 blur-[2px]"
            style={{
              width: '11%',
              height: '11%',
              left: `${PERIMETER[TOKEN_INDEX].col * 20.6 + 4.5}%`,
              top: `${PERIMETER[TOKEN_INDEX].row * 20.6 + 5.5}%`,
              transform: 'translateZ(5px)',
            }}
          />
        </div>

        {/* Dice, upright over the stage */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)]/85 px-2.5 py-1.5 backdrop-blur">
          <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white text-xs font-black text-[var(--color-navy-950)]">
            5
          </span>
          <span className="text-[10px] font-bold text-[var(--sq-ink-muted)]">Roll to move</span>
        </div>
      </div>

      {/* The live scenario — the thing that makes this a learning tool rather
       * than a board game. Shows a real Think–Vote–Explain moment. */}
      <div className="border-t border-[var(--sq-line)] bg-[var(--sq-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sq-earned-text)]">
            Decision in progress
          </span>
          <span className="rounded-full bg-[var(--sq-peer)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--sq-peer)]">
            Squad voting · 4
          </span>
        </div>
        <p className="mt-2 text-sm font-bold leading-snug text-[var(--sq-ink)]">
          "Quick $300 just for receiving a parcel and passing it on."
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <span className="rounded-[6px] border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] px-2 py-1.5 text-center text-[11px] font-semibold text-[var(--sq-ink-muted)]">
            Ask what's inside
          </span>
          <span className="rounded-[6px] border border-[var(--sq-safe)]/50 bg-[var(--sq-safe)]/15 px-2 py-1.5 text-center text-[11px] font-bold text-[var(--sq-safe)]">
            Refuse and report
          </span>
        </div>
      </div>
    </div>
  );
}
