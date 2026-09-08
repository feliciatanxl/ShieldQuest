import { useState } from 'react';
import { Copy, Pause, Play, QrCode, Square } from 'lucide-react';
import { Button, PrototypeNotice } from '../../design-system/DesignSystem';

/**
 * The live facilitator room, shown while a session is actually running.
 *
 * On the light civic skin, like every other section of the portal. It was
 * briefly put on the dark game skin on the theory that it mirrors what
 * participants see — but a single dark screen inside a light portal reads as
 * an inconsistency, not as a deliberate register shift, so it follows the
 * portal instead.
 *
 * Nothing changed here to move it: the panel is written against the semantic
 * roles, so dropping one `data-skin` attribute was the entire edit. That is
 * the two-skin system doing what it is for.
 *
 * Facilitators see aggregated squad trends only. No individual vote is ever
 * attributable to a participant here — that is a commitment in the proposal,
 * not a UI preference, so the reassurance is stated on screen.
 */

type SessionState = 'idle' | 'active' | 'paused';

/**
 * The live poll. Each option carries the semantic role its outcome maps to, so
 * the bars read consistently with the rest of the product: coral for risk,
 * leaf for the safer choice, teal for protecting someone else. Previously
 * these were three copy-pasted blocks, and "Safe Verification" was drawn in
 * the civic action colour rather than the safe one.
 */
const POLL = {
  scenario: 'Easy Money: job offer via Telegram message',
  voted: 24,
  of: 29,
  options: [
    {
      key: 'A',
      text: 'Accept the job and provide PayNow details to receive the $500 commission',
      votes: 3,
      share: 10,
      verdict: 'High risk',
      role: 'var(--sq-risk)',
    },
    {
      key: 'B',
      text: 'Ask for the ACRA registration and the official company UEN',
      votes: 21,
      share: 72,
      verdict: 'Safer — verifies first',
      role: 'var(--sq-safe)',
    },
    {
      key: 'C',
      text: 'Block the contact and report it',
      votes: 5,
      share: 18,
      verdict: 'Safer — protects others',
      role: 'var(--sq-peer)',
    },
  ],
};

const SQUADS = [
  { name: 'Squad Alpha', count: 5, status: 'Voted', token: 'Beacon' },
  { name: 'Squad Bravo', count: 5, status: 'Voted', token: 'Scout' },
  { name: 'Squad Charlie', count: 4, status: 'Thinking', token: 'Sentinel' },
  { name: 'Squad Delta', count: 5, status: 'Voted', token: 'Vanguard' },
  { name: 'Squad Echo', count: 5, status: 'Voted', token: 'Beacon' },
  { name: 'Squad Foxtrot', count: 5, status: 'Thinking', token: 'Scout' },
];

/** Panel shell, so every block on this screen shares one set of edges. */
function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
      {children}
    </span>
  );
}

export function SessionManager() {
  const [sessionState, setSessionState] = useState<SessionState>('active');
  const [copied, setCopied] = useState(false);

  const sessionCode = 'SQ-7842';
  const sessionName = 'Sec 3 Cohort A · Workshop 2';
  const venue = 'Computer Lab 2';
  const joined = 29;
  const expected = 32;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stateLabel: Record<SessionState, string> = {
    active: 'Live session',
    paused: 'Session paused',
    idle: 'Session ended',
  };

  // Status is carried by the label as well as the dot, never by colour alone.
  const stateDot: Record<SessionState, string> = {
    active: 'bg-[var(--sq-safe)] animate-pulse',
    paused: 'bg-[var(--sq-earned)]',
    idle: 'bg-[var(--sq-ink-muted)]',
  };

  return (
    <div className="space-y-5">
      {/* Session status and controls */}
      <Panel className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stateDot[sessionState]}`} />
            <span className="text-xs font-black uppercase tracking-wider text-[var(--sq-ink-muted)]">
              {stateLabel[sessionState]}
            </span>
            <PrototypeNotice text="Live facilitator room" />
          </div>
          <h2 className="mt-1.5 text-xl font-black text-[var(--sq-ink)]">{sessionName}</h2>
          <p className="text-xs text-[var(--sq-ink-muted)]">
            {venue} · Secondary band (14–16)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sessionState === 'active' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSessionState('paused')}
              leftIcon={<Pause className="h-4 w-4" />}
            >
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setSessionState('active')}
              leftIcon={<Play className="h-4 w-4" />}
            >
              Resume
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('End this workshop session for all participants?')) {
                setSessionState('idle');
              }
            }}
            leftIcon={<Square className="h-4 w-4" />}
          >
            End workshop
          </Button>
        </div>
      </Panel>

      {/* How participants get in */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel className="flex flex-col justify-between">
          <PanelLabel>Room code</PanelLabel>
          <div className="my-3 flex items-center justify-between gap-3">
            <span className="font-mono text-3xl font-black tracking-widest text-[var(--sq-earned-text)]">
              {sessionCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] transition hover:text-[var(--sq-ink)]"
              aria-label="Copy room code"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {/* aria-live so the confirmation reaches screen readers, which was
            * previously a silent visual-only change. */}
          <p aria-live="polite" className="text-[11px] text-[var(--sq-ink-muted)]">
            {copied ? (
              <span className="font-bold text-[var(--sq-safe)]">Copied to clipboard</span>
            ) : (
              'Participants enter this code to join.'
            )}
          </p>
        </Panel>

        <Panel className="flex items-center gap-4">
          {/* Literal white, not a surface token: this is a QR code, and a
            * camera needs the real light-on-dark contrast to read it. Under the
            * game skin `--sq-surface` is dark navy, which would make the code
            * unscannable — the one place on this screen that must NOT follow
            * the skin. */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[16px] bg-white p-2 text-[var(--color-navy-950)]">
            <QrCode className="h-16 w-16" />
          </div>
          <div>
            <PanelLabel>Classroom scan</PanelLabel>
            <p className="mt-1 text-xs font-semibold leading-snug text-[var(--sq-ink)]">
              Project this so participants can join by camera.
            </p>
            <button
              type="button"
              onClick={() => alert('Full-screen QR for projection')}
              className="mt-2 text-[11px] font-bold text-[var(--sq-action-text)] hover:underline"
            >
              Project full screen →
            </button>
          </div>
        </Panel>

        <Panel className="flex flex-col justify-between">
          <PanelLabel>Joined</PanelLabel>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--sq-ink)]">{joined}</span>
            <span className="text-xs font-bold text-[var(--sq-ink-muted)]">of {expected}</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[var(--sq-surface-raised)]"
            role="progressbar"
            aria-valuenow={joined}
            aria-valuemin={0}
            aria-valuemax={expected}
            aria-label="Participants joined"
          >
            <div
              className="h-full rounded-full bg-[var(--sq-safe)]"
              style={{ width: `${(joined / expected) * 100}%` }}
            />
          </div>
          <span className="mt-2 text-[11px] text-[var(--sq-ink-muted)]">
            6 squads connected anonymously
          </span>
        </Panel>
      </div>

      {/* Live Think–Vote–Explain monitor */}
      <Panel className="p-6">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--sq-line)] pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-earned-text)]">
                Active poll
              </span>
              <span className="rounded-[6px] bg-[var(--sq-action)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--color-civic-300)]">
                Think–Vote–Explain
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-black text-[var(--sq-ink)]">{POLL.scenario}</h3>
          </div>
          <span className="shrink-0 text-xs font-extrabold text-[var(--sq-safe)]">
            {POLL.voted} of {POLL.of} voted (
            {Math.round((POLL.voted / POLL.of) * 100)}%)
          </span>
        </div>

        <ul className="mt-6 space-y-4">
          {POLL.options.map((option) => (
            <li key={option.key}>
              <div className="mb-1.5 flex flex-col justify-between gap-1 text-xs font-bold sm:flex-row sm:gap-4">
                <span className="text-[var(--sq-ink-muted)]">
                  <span className="text-[var(--sq-ink)]">{option.key}:</span> {option.text}
                </span>
                <span
                  className="shrink-0 font-extrabold tabular-nums"
                  style={{ color: option.role }}
                >
                  {option.votes} · {option.share}% — {option.verdict}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--sq-surface-raised)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${option.share}%`, background: option.role }}
                />
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-[11px] font-medium text-[var(--sq-ink-muted)]">
          Individual votes stay confidential. This view shows aggregated squad trends only, to guide
          the discussion.
        </p>
      </Panel>

      {/* Connected squads */}
      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-[var(--sq-ink-muted)]">
          Connected squads
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SQUADS.map((squad) => {
            const voted = squad.status === 'Voted';
            return (
              <Panel key={squad.name} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[var(--sq-ink)]">{squad.name}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      voted
                        ? 'border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 text-[var(--sq-safe)]'
                        : 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 text-[var(--sq-earned-text)]'
                    }`}
                  >
                    {squad.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--sq-ink-muted)]">
                  <span>{squad.count} members</span>
                  <span>Token {squad.token}</span>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}
