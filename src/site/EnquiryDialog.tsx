import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Handshake, Mail, X } from 'lucide-react';

import { SiteButton } from './parts.tsx';

/**
 * Where session requests should go.
 *
 * TODO(SecurePi): set this to the address the team wants published before the
 * site goes live, then delete this comment.
 *
 * Until it is set, the form still works: it composes the enquiry and hands it
 * to the visitor to send. What it deliberately does NOT do is show a
 * "thanks, we'll be in touch" screen — there is no backend to receive a
 * submission, and a school that believes it has contacted you when it has not
 * is worse than no form at all.
 */
const CONTACT_EMAIL: string | null = null;

const BANDS = ['Ages 10–13', 'Ages 14–16', 'Ages 17–24', 'Mixed / not sure'];
const SIZES = ['Under 20', '20–30', '30–60', 'More than 60'];

/**
 * Session request form.
 *
 * Built on the native `<dialog>` element, so focus trapping, Escape to close
 * and the top-layer backdrop come from the platform rather than from
 * hand-rolled effects.
 *
 * Deliberately short, and deliberately free of personal data: an organisation
 * and a way to reply are enough to start a conversation. Asking a teacher for a
 * phone number here would contradict what the Safety section promises two
 * screens further up.
 */
export function EnquiryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [organisation, setOrganisation] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [band, setBand] = useState(BANDS[1]!);
  const [size, setSize] = useState(SIZES[1]!);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setCopied(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const subject = `ShieldQuest session request — ${organisation || 'a school or youth group'}`;
  const body = [
    'Hello Team SecurePi,',
    '',
    'We would like to run a ShieldQuest session.',
    '',
    `Organisation: ${organisation || '(please fill in)'}`,
    `Learner band: ${band}`,
    `Approximate group size: ${size}`,
    `Reply to: ${replyTo || '(please fill in)'}`,
    ...(notes ? ['', `Notes: ${notes}`] : []),
    '',
    'Thank you,',
  ].join('\n');

  const mailto = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard permission denied, or an insecure context. The message is
      // on screen in a selectable field either way.
    }
  }

  const field =
    'mt-1 w-full rounded-[var(--radius-control)] border border-[var(--sq-line-strong)] bg-[var(--sq-surface)] px-3.5 py-2.5 text-sm text-[var(--sq-ink)]';

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="enquiry-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-0 text-[var(--sq-ink)] shadow-[var(--sq-shadow-float)] backdrop:bg-[rgb(6_21_39_/_0.7)]"
    >
      <div className="relative max-h-[85dvh] overflow-y-auto p-6 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-sunk)] hover:text-[var(--sq-ink)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 pr-10">
          <Handshake className="h-5 w-5 text-[var(--sq-action-text)]" aria-hidden="true" />
          <h2 id="enquiry-title" className="text-lg font-extrabold">
            Request a session
          </h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
          Four details is all we need to come back with dates and what the room needs.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="enq-org" className="text-sm font-bold">
              School or organisation
            </label>
            <input
              id="enq-org"
              className={field}
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
              placeholder="e.g. Nanyang Polytechnic"
            />
          </div>

          <div>
            <label htmlFor="enq-reply" className="text-sm font-bold">
              Where should we reply?
            </label>
            <input
              id="enq-reply"
              type="email"
              className={field}
              value={replyTo}
              onChange={(event) => setReplyTo(event.target.value)}
              placeholder="A work email address"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="enq-band" className="text-sm font-bold">
                Learner band
              </label>
              <select
                id="enq-band"
                className={field}
                value={band}
                onChange={(event) => setBand(event.target.value)}
              >
                {BANDS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="enq-size" className="text-sm font-bold">
                Group size
              </label>
              <select
                id="enq-size"
                className={field}
                value={size}
                onChange={(event) => setSize(event.target.value)}
              >
                {SIZES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="enq-notes" className="text-sm font-bold">
              Anything else?{' '}
              <span className="font-normal text-[var(--sq-ink-muted)]">Optional</span>
            </label>
            <textarea
              id="enq-notes"
              rows={2}
              className={field}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Timing, venue, or anything we should know"
            />
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-card)] bg-[var(--sq-surface-sunk)] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
            Your message
          </p>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-[var(--sq-ink-muted)]">
            {body}
          </pre>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {mailto ? (
            <SiteButton onClick={() => window.open(mailto, '_self')}>
              <Mail className="h-4 w-4" />
              Open in your email app
            </SiteButton>
          ) : null}
          <SiteButton variant={mailto ? 'secondary' : 'primary'} onClick={copyMessage}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy the message'}
          </SiteButton>
          <SiteButton variant="secondary" onClick={onClose}>
            Close
          </SiteButton>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
          Nothing here is sent anywhere on its own — the message is composed on your device for you
          to send. ShieldQuest has no server collecting enquiries, which is the same reason it has
          no accounts.
        </p>
      </div>
    </dialog>
  );
}
