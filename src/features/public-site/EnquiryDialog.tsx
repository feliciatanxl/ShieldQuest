import { CheckCircle, Handshake, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../design-system/DesignSystem';

/**
 * Session request form.
 *
 * Built on the native `<dialog>` element so that focus trapping, Escape to
 * close and the top-layer backdrop come from the platform instead of from
 * hand-rolled effects. The previous implementation was a fixed-position div,
 * which left focus loose behind the overlay.
 *
 * Deliberately short, and deliberately free of personal data: an organisation
 * and an email are enough to start a conversation, and asking a teacher for a
 * phone number at this stage would contradict what the Safety section
 * promises three screens further up.
 */
export function EnquiryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSubmitted(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="enquiry-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-0 text-[var(--sq-ink)] shadow-[var(--sq-shadow-float)] backdrop:bg-[var(--color-navy-950)]/70 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-sunk)] hover:text-[var(--sq-ink)]"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-leaf-100)] text-[var(--color-leaf-700)]">
              <CheckCircle className="h-8 w-8" />
            </span>
            <h2 id="enquiry-title" className="mt-4 text-xl font-black text-[var(--sq-ink)]">
              Request received
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--sq-ink-muted)]">
              Thanks — we will come back to you about dates, learner bands and what the room needs.
            </p>
            <Button className="mt-6" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 pr-10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-civic-50)] text-[var(--sq-action-text)]">
                <Handshake className="h-4.5 w-4.5" />
              </span>
              <h2 id="enquiry-title" className="text-lg font-black text-[var(--sq-ink)]">
                Request a session
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[var(--sq-ink-muted)]">
              Tell us roughly who the group is. We will reply with available dates and a short
              run-sheet you can share with your team.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <Field
                id="enquiry-org"
                label="School or organisation"
                placeholder="e.g. Nanyang Polytechnic"
                required
              />
              <Field
                id="enquiry-email"
                label="Contact email"
                type="email"
                placeholder="you@school.edu.sg"
                required
              />

              <div>
                <label
                  htmlFor="enquiry-band"
                  className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]"
                >
                  Learner band
                </label>
                <select
                  id="enquiry-band"
                  className="mt-1.5 w-full rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)] px-3 py-2.5 text-sm text-[var(--sq-ink)]"
                  defaultValue="14-16"
                >
                  <option value="10-13">Primary / early secondary (10–13)</option>
                  <option value="14-16">Secondary (14–16)</option>
                  <option value="17-24">Post-secondary / tertiary (17–24)</option>
                  <option value="mixed">Mixed or not sure yet</option>
                </select>
              </div>

              <Field
                id="enquiry-size"
                label="Approximate group size"
                placeholder="e.g. 25"
                inputMode="numeric"
              />

              <Button type="submit" fullWidth size="lg">
                Send request
              </Button>

              <p className="text-center text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
                We only use these details to reply about a session. Nothing here is asked of
                participants.
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-extrabold uppercase tracking-wider text-[var(--sq-ink-muted)]"
      >
        {label}
      </label>
      <input
        id={id}
        className="mt-1.5 w-full rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)] px-3 py-2.5 text-sm text-[var(--sq-ink)] placeholder:text-[var(--sq-ink-muted)]/60"
        {...props}
      />
    </div>
  );
}
