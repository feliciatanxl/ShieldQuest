import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Link, Check } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { SquadVoteDashboard } from '../voting/ThinkVoteExplain';

export function SquadPanel() {
  const code = useSessionStore((state) => state.previewCode);
  const setCode = useSessionStore((state) => state.setPreviewCode);
  const [input, setInput] = useState(code ?? '');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const joinUrl = new URL(window.location.origin);
  joinUrl.searchParams.set('session', code ?? 'DEMO01');
  return (
    <div className="feature-layout">
      <section className="surface padded">
        <div className="section-icon">
          <Users />
        </div>
        <span className="eyebrow">BETTER TOGETHER</span>
        <h2>Your squad starts here.</h2>
        <p>
          Explore with 4–5 players. A facilitator will share a session code when live sessions are
          ready.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setCode(input.toUpperCase());
            setCopied(false);
          }}
          className="join-form"
        >
          <label htmlFor="session-code">Session code</label>
          <div className="input-row">
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
            />
            <button className="primary-button" type="submit">
              Preview
            </button>
          </div>
          <p id="code-help" className="small-label">
            6–8 letters or numbers. Preview only; this does not join a live session.
          </p>
        </form>
        {code && (
          <div className="note" role="status">
            Entry code <strong>{code}</strong> is ready to preview. Session lookup and joining are
            not connected yet.
          </div>
        )}
        <div className="squad-slots" aria-label="Five empty squad member slots">
          {[1, 2, 3, 4, 5].map((number) => (
            <div key={number}>
              <Users size={21} />
              <span>Player {number}</span>
            </div>
          ))}
        </div>
        <SquadVoteDashboard />
      </section>
      <section className="surface padded qr-panel">
        <span className="eyebrow">ONE SCAN. A SHARED ADVENTURE.</span>
        <h3>Step into the city</h3>
        <div className="qr-code">
          <QRCodeSVG
            value={joinUrl.href}
            size={180}
            level="M"
            title="ShieldQuest preview entry link"
          />
        </div>
        <strong className="session-display">{code ?? 'DEMO01'}</strong>
        <p>This QR opens the app with a preview code.</p>
        <button
          className="secondary-button"
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
          {copied ? <Check size={17} /> : <Link size={17} />}{' '}
          {copied ? 'Link copied' : 'Copy entry link'}
        </button>
        {copyError && (
          <p role="status">
            Copy this link: <a href={joinUrl.href}>{joinUrl.href}</a>
          </p>
        )}
        <p className="small-label">
          For phone scanning, open this page using your computer’s network address or a hosted HTTPS
          URL. A localhost QR only works on this computer.
        </p>
      </section>
    </div>
  );
}
