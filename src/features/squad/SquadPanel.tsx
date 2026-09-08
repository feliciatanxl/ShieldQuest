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
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic-50 text-civic-600 border border-civic-100 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-civic-700">
                BETTER TOGETHER
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-navy-950">
                Your squad starts here.
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Explore with 4–5 players. A facilitator will share a session code when live sessions are
            ready.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setCode(input.toUpperCase());
              setCopied(false);
            }}
            className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4"
          >
            <label htmlFor="session-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-extrabold uppercase tracking-widest text-navy-950 placeholder:text-slate-400 focus:border-civic-500 focus:outline-none focus:ring-1 focus:ring-civic-500 shadow-sm"
              />
              <button
                type="submit"
                className="primary-button inline-flex min-h-[44px] items-center justify-center rounded-xl bg-civic-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-civic-700 transition active:scale-[0.98]"
              >
                Preview
              </button>
            </div>
            <p id="code-help" className="text-[11px] text-slate-500 font-medium">
              6–8 letters or numbers. Preview only; this does not join a live session.
            </p>
          </form>

          {code && (
            <div
              role="status"
              className="flex items-center gap-2.5 rounded-xl border border-civic-200 bg-civic-50/80 p-3.5 text-xs text-civic-900 leading-relaxed"
            >
              <span>
                Entry code <strong>{code}</strong> is ready to preview. Session lookup and joining are
                not connected yet.
              </span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Squad Lineup
            </span>
            <div className="grid grid-cols-5 gap-2 sm:gap-3" aria-label="Five empty squad member slots">
              {[1, 2, 3, 4, 5].map((number) => (
                <div
                  key={number}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-3 text-center transition hover:border-civic-300 hover:bg-white"
                >
                  <Users className="h-5 w-5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">Player {number}</span>
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-civic-700">
              ONE SCAN. A SHARED ADVENTURE.
            </span>
            <h3 className="text-lg font-black tracking-tight text-navy-950 mt-1">
              Step into the city
            </h3>
          </div>

          <div className="mx-auto inline-block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={joinUrl.href}
              size={180}
              level="M"
              title="ShieldQuest preview entry link"
            />
          </div>

          <div>
            <strong className="inline-block rounded-lg bg-civic-50 border border-civic-200 px-4 py-1.5 text-xl font-black tracking-widest text-civic-700">
              {code ?? 'DEMO01'}
            </strong>
            <p className="mt-2 text-xs text-slate-500">This QR opens the app with a preview code.</p>
          </div>

          <button
            type="button"
            className="secondary-button w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
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
            {copied ? <Check size={16} className="text-emerald-600" /> : <Link size={16} />}
            <span>{copied ? 'Link copied' : 'Copy entry link'}</span>
          </button>

          {copyError && (
            <p role="status" className="text-xs text-rose-600">
              Copy this link: <a href={joinUrl.href} className="underline">{joinUrl.href}</a>
            </p>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed">
            For phone scanning, open this page using your computer’s network address or a hosted HTTPS
            URL. A localhost QR only works on this computer.
          </p>
        </Card>
      </div>
    </div>
  );
}
