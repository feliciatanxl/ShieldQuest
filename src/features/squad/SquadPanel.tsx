import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Link, Check } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { SquadVoteDashboard } from '../voting/ThinkVoteExplain';
import { Card } from '../../design-system/Card';

export function SquadPanel() {
  const code = useSessionStore((state) => state.previewCode);
  const setCode = useSessionStore((state) => state.setPreviewCode);
  const [input, setInput] = useState(code ?? '');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    if (code) {
      setInput(code);
    }
  }, [code]);
  const joinUrl = new URL(window.location.origin);
  joinUrl.searchParams.set('session', code ?? 'DEMO01');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--sq-action)]/15 text-[var(--sq-action-text)] border border-[var(--sq-action)]/40 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sq-action-text)]">
                BETTER TOGETHER
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--sq-ink)]">
                Your squad starts here.
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--sq-ink-muted)] leading-relaxed">
            Explore with 4–5 players. A facilitator will share a session code when live sessions are
            ready.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setCode(input.toUpperCase());
              setCopied(false);
            }}
            className="space-y-2 rounded-[16px] border border-[var(--sq-line)]/80 bg-[var(--sq-surface-sunk)] p-4"
          >
            <label htmlFor="session-code" className="block text-xs font-bold uppercase tracking-wider text-[var(--sq-ink)]">
              Session code
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="session-code"
                value={input}
                onChange={(event) => setInput(event.target.value.toUpperCase())}
                pattern="[A-Z0-9]{6,8}"
                minLength={6}
                maxLength={8}
                required
                placeholder="e.g. DEMO01"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="code-help"
                className="flex-1 rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)] px-3.5 py-2.5 text-sm font-extrabold uppercase tracking-widest text-[var(--sq-ink)] placeholder:text-[var(--sq-ink-muted)] focus:border-[var(--sq-action)] focus:outline-none focus:ring-1 focus:ring-[var(--sq-action)] shadow-sm"
              />
              <button
                type="submit"
                className="primary-button inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--sq-action)] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-[var(--sq-action-hover)] transition active:scale-[0.98]"
              >
                Preview
              </button>
            </div>
            <p id="code-help" className="text-[11px] text-[var(--sq-ink-muted)] font-medium">
              6–8 letters or numbers. Preview only; this does not join a live session.
            </p>
          </form>

          {code && (
            <div
              role="status"
              className="flex items-center gap-2.5 rounded-[16px] border border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 p-3.5 text-xs text-[var(--sq-action-text)] leading-relaxed"
            >
              <span>
                Entry code <strong>{code}</strong> is ready to preview. Session lookup and joining are
                not connected yet.
              </span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              Squad Lineup
            </span>
            <div className="grid grid-cols-5 gap-2 sm:gap-3" aria-label="Five empty squad member slots">
              {[1, 2, 3, 4, 5].map((number) => (
                <div
                  key={number}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed border-[var(--sq-line-strong)] bg-[var(--sq-surface-sunk)] p-3 text-center transition hover:border-[var(--sq-action)]/40 hover:bg-[var(--sq-surface)]"
                >
                  <Users className="h-5 w-5 text-[var(--sq-ink-muted)]" />
                  <span className="text-[11px] font-bold text-[var(--sq-ink-muted)]">Player {number}</span>
                </div>
              ))}
            </div>
          </div>

          <SquadVoteDashboard />
        </Card>
      </div>

      <div>
        <Card padding="lg" className="space-y-5 text-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sq-action-text)]">
              ONE SCAN. A SHARED ADVENTURE.
            </span>
            <h3 className="text-lg font-black tracking-tight text-[var(--sq-ink)] mt-1">
              Step into the city
            </h3>
          </div>

          <div className="mx-auto inline-block rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-4 shadow-sm">
            <QRCodeSVG
              value={joinUrl.href}
              size={180}
              level="M"
              title="ShieldQuest preview entry link"
            />
          </div>

          <div>
            <strong className="inline-block rounded-[6px] bg-[var(--sq-action)]/15 border border-[var(--sq-action)]/40 px-4 py-1.5 text-xl font-black tracking-widest text-[var(--sq-action-text)]">
              {code ?? 'DEMO01'}
            </strong>
            <p className="mt-2 text-xs text-[var(--sq-ink-muted)]">This QR opens the app with a preview code.</p>
          </div>

          <button
            type="button"
            className="secondary-button w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)] px-4 py-2.5 text-xs font-bold text-[var(--sq-ink)] shadow-sm hover:bg-[var(--sq-surface-sunk)] transition"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(joinUrl.href);
                setCopied(true);
                setCopyError(false);
              } catch {
                setCopyError(true);
              }
            }}
          >
            {copied ? <Check size={16} className="text-[var(--sq-safe)]" /> : <Link size={16} />}
            <span>{copied ? 'Link copied' : 'Copy entry link'}</span>
          </button>

          {copyError && (
            <p role="status" className="text-xs text-[var(--sq-risk)]">
              Copy this link: <a href={joinUrl.href} className="underline">{joinUrl.href}</a>
            </p>
          )}

          <p className="text-[11px] text-[var(--sq-ink-muted)] leading-relaxed">
            For phone scanning, open this page using your computer’s network address or a hosted HTTPS
            URL. A localhost QR only works on this computer.
          </p>
        </Card>
      </div>
    </div>
  );
}
