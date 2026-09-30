import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Copy, Maximize2, Play, RefreshCw, Square, X } from 'lucide-react';

import { SCENARIO_BY_ID } from '../game/content/scenarios.ts';
import { AGE_BAND_LABEL, type AgeBand, type ChoiceOutcome } from '../game/types.ts';
import {
  ApiFailure,
  closeSession,
  isOffline,
  joinUrl,
  listSessions,
  liveSession,
  openSession,
  watchSession,
  type Facilitator,
  type LiveSession,
  type SessionSummary,
} from './api.ts';
import { Button, Modal } from './parts.tsx';

/**
 * Live sessions, backed by the ShieldQuest server.
 *
 * Everything here is real: opening a room writes it to the database, the code
 * and QR are what participants will actually scan, and the squad and vote
 * figures arrive over the WebSocket as the room plays. Counts only — the server
 * never sends who voted for what, so this screen cannot show it either.
 */

const ROOM_KEY = 'shieldquest.portal.room';

function rememberRoom(code: string | null) {
  try {
    if (code) localStorage.setItem(ROOM_KEY, code);
    else localStorage.removeItem(ROOM_KEY);
  } catch {
    /* A remembered room is a convenience; the list below still finds it. */
  }
}

function recalledRoom(): string | null {
  try {
    return localStorage.getItem(ROOM_KEY);
  } catch {
    return null;
  }
}

function messageFor(error: unknown): string {
  if (isOffline(error)) return 'The ShieldQuest server is not reachable right now.';
  if (error instanceof ApiFailure) return error.message;
  return 'Something went wrong.';
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

export function LiveSessions({ me }: { me: Facilitator }) {
  const [room, setRoom] = useState<string | null>(recalledRoom);

  const enter = (code: string | null) => {
    rememberRoom(code);
    setRoom(code);
  };

  return room ? (
    <LiveRoom code={room} onLeave={() => enter(null)} />
  ) : (
    <SessionList me={me} onEnter={enter} />
  );
}

/* ------------------------------------------------------------------ */
/* List + open a room                                                  */
/* ------------------------------------------------------------------ */

function SessionList({ me, onEnter }: { me: Facilitator; onEnter: (code: string) => void }) {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    listSessions()
      .then(setSessions)
      .catch((failure) => setError(messageFor(failure)));
  }, []);

  useEffect(load, [load]);

  const open = sessions?.filter((session) => session.status === 'open') ?? [];
  const past = sessions?.filter((session) => session.status === 'closed') ?? [];

  return (
    <div className="space-y-5">
      <StartSession onOpened={onEnter} />

      <Panel>
        <div className="flex items-center justify-between gap-3">
          <PanelLabel>{me.role === 'admin' ? 'All sessions' : 'Your sessions'}</PanelLabel>
          <button
            type="button"
            onClick={load}
            className="inline-flex min-h-[36px] items-center gap-1.5 text-[12px] font-bold text-[var(--sq-action-text)] hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-[var(--sq-ink-muted)]">
            {error}
          </p>
        ) : sessions === null ? (
          <p className="mt-3 text-sm text-[var(--sq-ink-muted)]">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--sq-ink-muted)]">
            No sessions yet. Open a room above when your group is ready.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-[var(--sq-line)]">
            {[...open, ...past].map((session) => (
              <div
                key={session.code}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--sq-ink)]">
                    {session.title || 'Untitled session'}
                    <span className="ml-2 font-mono text-xs font-black tracking-widest text-[var(--sq-earned-text)]">
                      {session.code}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--sq-ink-muted)]">
                    {[
                      session.venue,
                      AGE_BAND_LABEL[session.ageBand],
                      `${session.participants} joined`,
                      new Date(session.createdAt).toLocaleString(),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {session.status === 'open' ? (
                  <Button size="sm" onClick={() => onEnter(session.code)}>
                    Open live room
                  </Button>
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
                    Ended
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

const BANDS: AgeBand[] = ['B10_13', 'B14_16', 'B17_24'];

function StartSession({ onOpened }: { onOpened: (code: string) => void }) {
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('B14_16');
  const [squads, setSquads] = useState(6);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field =
    'mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-2.5 text-sm text-[var(--sq-ink)] focus:border-[var(--sq-action)] focus:outline-none focus:ring-1 focus:ring-[var(--sq-action)]';
  const label = 'block text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const opened = await openSession({
        ageBand,
        squads,
        title: title.trim() || undefined,
        venue: venue.trim() || undefined,
      });
      onOpened(opened.code);
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel>
      <h2 className="text-lg font-black text-[var(--sq-ink)]">Open a room</h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
        Creates a real room with a join code and QR. Name the group and the room, never a
        participant — those two fields are the only free text the session keeps.
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="room-title" className={label}>
            Session name
          </label>
          <input
            id="room-title"
            value={title}
            maxLength={80}
            placeholder="Sec 3 Cohort A · Workshop 2"
            onChange={(event) => setTitle(event.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="room-venue" className={label}>
            Venue
          </label>
          <input
            id="room-venue"
            value={venue}
            maxLength={80}
            placeholder="Computer Lab 2"
            onChange={(event) => setVenue(event.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="room-band" className={label}>
            Age group
          </label>
          <select
            id="room-band"
            value={ageBand}
            onChange={(event) => setAgeBand(event.target.value as AgeBand)}
            className={field}
          >
            {BANDS.map((band) => (
              <option key={band} value={band}>
                {AGE_BAND_LABEL[band]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="room-squads" className={label}>
            Squads (up to 5 each)
          </label>
          <input
            id="room-squads"
            type="number"
            min={1}
            max={12}
            value={squads}
            onChange={(event) =>
              setSquads(Math.max(1, Math.min(12, Number(event.target.value) || 1)))
            }
            className={field}
          />
          <p className="mt-1 text-[11px] text-[var(--sq-ink-muted)]">
            Room for {squads * 5} participants.
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm font-semibold text-[var(--sq-risk)] sm:col-span-2">
            {error}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy} leftIcon={<Play className="h-4 w-4" />}>
            {busy ? 'Opening…' : 'Open room'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* The live room                                                       */
/* ------------------------------------------------------------------ */

const OUTCOME_ROLE: Record<ChoiceOutcome, { colour: string; verdict: string }> = {
  SAFE: { colour: 'var(--sq-safe)', verdict: 'Safer' },
  CAUTIOUS: { colour: 'var(--sq-peer)', verdict: 'Cautious' },
  RISKY: { colour: 'var(--sq-risk)', verdict: 'Risky' },
};

/** Round keys are `scenarioId:turn`; this turns one back into words. */
function describeRound(roundKey: string) {
  const scenario = SCENARIO_BY_ID[roundKey.split(':')[0] ?? ''];
  return {
    title: scenario?.title ?? roundKey,
    choice: (choiceId: string) => {
      const choice = scenario?.choices.find((entry) => entry.id === choiceId);
      return {
        text: choice?.label ?? choiceId,
        role: choice ? OUTCOME_ROLE[choice.outcome] : null,
      };
    },
  };
}

function useQrSvg(text: string) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let live = true;
    QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
      .then((markup) => live && setSvg(markup))
      .catch(() => live && setSvg(''));
    return () => {
      live = false;
    };
  }, [text]);
  return svg;
}

function LiveRoom({ code, onLeave }: { code: string; onLeave: () => void }) {
  const [room, setRoom] = useState<LiveSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [projecting, setProjecting] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const refetchTimer = useRef(0);

  const url = joinUrl(code);
  const qr = useQrSvg(url);

  const load = useCallback(() => {
    liveSession(code)
      .then((next) => {
        setRoom(next);
        setError(null);
      })
      .catch((failure) => {
        // Not found means ended, or not this facilitator's: back to the list.
        if (failure instanceof ApiFailure && failure.status === 404) onLeave();
        else setError(messageFor(failure));
      });
  }, [code, onLeave]);

  useEffect(() => {
    load();
    const stop = watchSession(code, (message) => {
      if (message.type === 'welcome') setConnected(true);
      if (message.type === 'roster') {
        setRoom((current) => (current ? { ...current, squads: message.squads } : current));
      }
      if (message.type === 'vote:progress' || message.type === 'vote:reveal') {
        // Several votes land together; one read covers them all.
        window.clearTimeout(refetchTimer.current);
        refetchTimer.current = window.setTimeout(load, 250);
      }
      if (message.type === 'session:closed') {
        setRoom((current) => (current ? { ...current, status: 'closed' } : current));
      }
      if (message.type === 'error') setConnected(false);
    });
    return () => {
      stop();
      window.clearTimeout(refetchTimer.current);
    };
  }, [code, load]);

  const rounds = useMemo(() => {
    const byRound = new Map<string, Map<string, number>>();
    const votedBySquad = new Map<string, Map<string, number>>();
    for (const vote of room?.votes ?? []) {
      const tally = byRound.get(vote.roundKey) ?? new Map<string, number>();
      tally.set(vote.choiceId, (tally.get(vote.choiceId) ?? 0) + vote.count);
      byRound.set(vote.roundKey, tally);
      const squads = votedBySquad.get(vote.roundKey) ?? new Map<string, number>();
      squads.set(vote.squadId, (squads.get(vote.squadId) ?? 0) + vote.count);
      votedBySquad.set(vote.roundKey, squads);
    }
    return [...byRound.entries()].map(([roundKey, tally]) => ({
      roundKey,
      tally: [...tally.entries()].sort((a, b) => b[1] - a[1]),
      total: [...tally.values()].reduce((sum, n) => sum + n, 0),
      bySquad: votedBySquad.get(roundKey) ?? new Map<string, number>(),
    }));
  }, [room?.votes]);

  if (!room) {
    return (
      <Panel>
        <p className="text-sm text-[var(--sq-ink-muted)]">{error ?? 'Opening the live room…'}</p>
      </Panel>
    );
  }

  const joined = room.squads.reduce((sum, squad) => sum + squad.members, 0);
  const capacity = room.squads.length * 5;
  const latest = rounds[rounds.length - 1];
  const ended = room.status === 'closed';

  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const end = async () => {
    setConfirmEnd(false);
    try {
      await closeSession(code);
      setRoom({ ...room, status: 'closed' });
    } catch (failure) {
      setError(messageFor(failure));
    }
  };

  return (
    <div className="space-y-5">
      <Panel className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                ended
                  ? 'bg-[var(--sq-ink-muted)]'
                  : connected
                    ? 'animate-pulse bg-[var(--sq-safe)]'
                    : 'bg-[var(--sq-earned)]'
              }`}
            />
            <span className="text-xs font-black uppercase tracking-wider text-[var(--sq-ink-muted)]">
              {ended ? 'Session ended' : connected ? 'Live session' : 'Reconnecting…'}
            </span>
          </div>
          <h2 className="mt-1.5 text-xl font-black text-[var(--sq-ink)]">
            {room.title || 'Untitled session'}
          </h2>
          <p className="text-xs text-[var(--sq-ink-muted)]">
            {[room.venue, AGE_BAND_LABEL[room.ageBand]].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLeave}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            All sessions
          </Button>
          {!ended ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmEnd(true)}
              leftIcon={<Square className="h-4 w-4" />}
            >
              End session
            </Button>
          ) : null}
        </div>
      </Panel>

      {error ? (
        <p role="alert" className="text-sm font-semibold text-[var(--sq-risk)]">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel className="flex flex-col justify-between">
          <PanelLabel>Room code</PanelLabel>
          <div className="my-3 flex items-center justify-between gap-3">
            <span className="font-mono text-3xl font-black tracking-widest text-[var(--sq-earned-text)]">
              {code}
            </span>
            <button
              type="button"
              onClick={copy}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] transition hover:text-[var(--sq-ink)]"
              aria-label="Copy room code"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p aria-live="polite" className="text-[11px] text-[var(--sq-ink-muted)]">
            {copied ? (
              <span className="font-bold text-[var(--sq-safe)]">Copied to clipboard</span>
            ) : (
              'Participants type this on the ShieldQuest join screen.'
            )}
          </p>
        </Panel>

        <Panel className="flex items-center gap-4">
          {/* Literal white: a camera needs real light-on-dark contrast. */}
          <div
            className="h-24 w-24 shrink-0 rounded-[12px] bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full"
            aria-label={`QR code linking to ${url}`}
            role="img"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <div className="min-w-0">
            <PanelLabel>Classroom scan</PanelLabel>
            <p className="mt-1 text-xs font-semibold leading-snug text-[var(--sq-ink)]">
              Opens ShieldQuest with this room's code filled in.
            </p>
            <button
              type="button"
              onClick={() => setProjecting(true)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--sq-action-text)] hover:underline"
            >
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              Project full screen
            </button>
          </div>
        </Panel>

        <Panel className="flex flex-col justify-between">
          <PanelLabel>Joined</PanelLabel>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums text-[var(--sq-ink)]">{joined}</span>
            <span className="text-xs font-bold text-[var(--sq-ink-muted)]">
              of {capacity} places
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[var(--sq-surface-raised)]"
            role="progressbar"
            aria-valuenow={joined}
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-label="Participants joined"
          >
            <div
              className="h-full rounded-full bg-[var(--sq-safe)] transition-[width]"
              style={{ width: `${capacity ? (joined / capacity) * 100 : 0}%` }}
            />
          </div>
          <span className="mt-2 text-[11px] text-[var(--sq-ink-muted)]">
            {room.squads.length} squads · codenames only, no names collected
          </span>
        </Panel>
      </div>

      <Panel className="p-6">
        {latest ? (
          <RoundTally round={latest} members={joined} />
        ) : (
          <div className="text-center">
            <PanelLabel>Think · Vote · Explain</PanelLabel>
            <p className="mt-2 text-sm text-[var(--sq-ink-muted)]">
              No votes yet. When squads reach a decision, the counts appear here as they come in.
            </p>
          </div>
        )}
        <p className="mt-5 text-center text-[11px] font-medium text-[var(--sq-ink-muted)]">
          Individual votes stay confidential. This view shows counts only, to guide the discussion.
        </p>
      </Panel>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-[var(--sq-ink-muted)]">
          Squads
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {room.squads.map((squad) => {
            const voted = latest?.bySquad.get(squad.id) ?? 0;
            const done = squad.members > 0 && voted >= squad.members;
            return (
              <Panel key={squad.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[var(--sq-ink)]">{squad.name}</span>
                  {latest && squad.members > 0 ? (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        done
                          ? 'border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 text-[var(--sq-safe)]'
                          : 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 text-[var(--sq-earned-text)]'
                      }`}
                    >
                      {done ? 'Voted' : `${voted}/${squad.members} voted`}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center gap-1" aria-label={`${squad.members} of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className={`h-2 flex-1 rounded-full ${
                        i < squad.members
                          ? 'bg-[var(--sq-action)]'
                          : 'bg-[var(--sq-surface-raised)]'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--sq-ink-muted)]">
                  {squad.members} of 5 {squad.members === 1 ? 'member' : 'members'}
                </p>
              </Panel>
            );
          })}
        </div>
      </div>

      <Modal open={confirmEnd} onClose={() => setConfirmEnd(false)} labelledBy="end-session-title">
        <div className="p-6">
          <h2 id="end-session-title" className="text-lg font-black text-[var(--sq-ink)]">
            End this session for everyone?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
            Participants are told the room has closed, and no more votes are accepted. Their games
            carry on on their own devices.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmEnd(false)}>
              Keep it open
            </Button>
            <Button variant="destructive" onClick={() => void end()}>
              End session
            </Button>
          </div>
        </div>
      </Modal>

      {projecting ? (
        <ProjectorView code={code} url={url} qr={qr} onClose={() => setProjecting(false)} />
      ) : null}
    </div>
  );
}

function RoundTally({
  round,
  members,
}: {
  round: { roundKey: string; tally: [string, number][]; total: number };
  members: number;
}) {
  const described = describeRound(round.roundKey);
  return (
    <>
      <div className="flex flex-col justify-between gap-2 border-b border-[var(--sq-line)] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-earned-text)]">
              Latest decision
            </span>
            <span className="rounded-[6px] bg-[var(--sq-action)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--sq-action-text)]">
              Think–Vote–Explain
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-black text-[var(--sq-ink)]">{described.title}</h3>
        </div>
        <span className="shrink-0 text-xs font-extrabold tabular-nums text-[var(--sq-safe)]">
          {round.total} of {members} voted
        </span>
      </div>
      <ul className="mt-6 space-y-4">
        {round.tally.map(([choiceId, count]) => {
          const choice = described.choice(choiceId);
          const share = round.total ? Math.round((count / round.total) * 100) : 0;
          const colour = choice.role?.colour ?? 'var(--sq-action)';
          return (
            <li key={choiceId}>
              <div className="mb-1.5 flex flex-col justify-between gap-1 text-xs font-bold sm:flex-row sm:gap-4">
                <span className="text-[var(--sq-ink)]">{choice.text}</span>
                <span className="shrink-0 font-extrabold tabular-nums" style={{ color: colour }}>
                  {count} · {share}%{choice.role ? ` — ${choice.role.verdict}` : ''}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--sq-surface-raised)]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${share}%`, background: colour }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** The screen a facilitator puts on the projector while the room joins. */
function ProjectorView({
  code,
  url,
  qr,
  onClose,
}: {
  code: string;
  url: string;
  qr: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join this ShieldQuest session"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#061527] p-6 text-white"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        aria-label="Close projector view"
      >
        <X className="h-5 w-5" />
      </button>
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/70">
        Scan to join ShieldQuest
      </p>
      <div
        className="aspect-square w-[min(60vh,80vw)] rounded-[24px] bg-white p-4 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qr }}
      />
      <p className="font-mono text-6xl font-black tracking-[0.25em] text-[#f2ae33] sm:text-7xl">
        {code}
      </p>
      <p className="text-sm text-white/70">{url.replace(/^https?:\/\//, '')}</p>
    </div>
  );
}
