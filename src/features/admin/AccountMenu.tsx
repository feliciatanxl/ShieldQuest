import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';

/**
 * Account menu for the facilitator portal.
 *
 * WHY THIS AND NOT A PROFILE PAGE
 *
 * The people using this portal are educators, school counsellors, student
 * development officers and youth workers — not police officers, and not an
 * operations team. They run a 90-minute workshop and leave. A "profile
 * details" screen would be a place to accumulate personal information, which
 * is the opposite of what this project committed to: the whole posture is data
 * minimisation, and there is no per-facilitator data worth showing.
 *
 * Two things do genuinely belong on the avatar, though, and one of them did not
 * exist anywhere in the portal before this component:
 *
 *  1. WHO IS SIGNED IN. Sessions run in school computer labs on machines that
 *     several staff share, often projected to a room. Knowing whose account is
 *     active is a practical need, not a personalisation feature.
 *
 *  2. SIGN OUT. There was no way to sign out at all. On a shared or projected
 *     machine that is a safeguarding gap, not a missing convenience.
 *
 * It also fixes a smaller problem: the avatar was a decorative `aria-hidden`
 * span that looked exactly like a button. An affordance that lies is worse
 * than no affordance.
 */
export function AccountMenu({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Facilitator identity. Wired to a real session once auth exists; the login
  // is currently a demonstration with no account behind it.
  const name = 'Demo Facilitator';
  const role = 'Session facilitator';
  const email = 'facilitator@shieldquest.sg';
  const initials = 'DF';

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        // Return focus to the trigger, or a keyboard user is dropped at the
        // top of the document with no idea where they were.
        triggerRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-[44px] items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 transition hover:border-line-strong hover:bg-surface-sunk"
      >
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-100 text-[12px] font-bold text-navy-800"
        >
          {initials}
        </span>
        <span className="hidden text-left lg:block">
          <span className="block text-[12px] font-bold leading-tight text-ink">{name}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            {role}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-ink-muted transition ${open ? 'rotate-180' : ''}`}
        />
        <span className="sr-only">Account menu for {name}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[264px] overflow-hidden rounded-[16px] border border-line bg-surface shadow-[var(--sq-shadow-float)]"
        >
          <div className="border-b border-line bg-surface-sunk p-4">
            <p className="text-[13px] font-extrabold text-navy-900">{name}</p>
            <p className="mt-0.5 text-[12px] text-ink-muted">{email}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--sq-action)]/12 px-2 py-0.5 text-[11px] font-bold text-[var(--sq-action-text)]">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {role}
            </p>
          </div>

          {/*
            Deliberately not a settings or profile screen. There is no
            per-facilitator data to manage, and adding somewhere to store it
            would work against the data-minimisation commitment.
          */}
          <p className="border-b border-line px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
            The portal keeps no personal profile for facilitators. Session
            records are aggregate and carry no participant identifiers.
          </p>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex min-h-[44px] w-full items-center gap-2.5 px-4 text-left text-[13px] font-bold text-ink transition hover:bg-surface-sunk"
          >
            <LogOut className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
