import { useEffect, useRef, type ReactNode } from 'react';
import { Info, Shield, X } from 'lucide-react';

/* =============================================================================
 * Portal primitives.
 * -----------------------------------------------------------------------------
 * The portal is the third surface in the codebase, after the public site and
 * the player app, and it is the only one that is *dense* — tables, filters,
 * drawers, toolbars. It therefore needs a button with sizes and a modal with
 * placements, which neither `site/parts.tsx` (marketing, one size) nor
 * `ui/primitives.tsx` (a bottom sheet built for a phone in a game skin)
 * provides.
 *
 * These are ported from v1's `design-system/Button.tsx` and
 * `components/PlayerModal.tsx`, written — as everything is — against the
 * semantic roles in `tokens.css`. Nothing here declares a colour of its own, so
 * the portal inherits the civic skin without asking for it.
 * ========================================================================== */

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5',
  // 44px is the floor at md and above: a facilitator runs this on whatever
  // device the venue has, often a tablet propped on a lectern.
  md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5',
};

const VARIANTS: Record<ButtonVariant, string> = {
  // The single most important action on a screen. One per view.
  primary:
    'bg-[var(--sq-action)] text-[var(--sq-action-ink)] shadow-[var(--sq-shadow-flat)] hover:bg-[var(--sq-action-hover)]',
  // Equal-weight alternative sitting on a surface.
  secondary:
    'border border-[var(--sq-line)] bg-[var(--sq-surface)] text-[var(--sq-ink)] shadow-[var(--sq-shadow-flat)] hover:border-[var(--sq-line-strong)] hover:bg-[var(--sq-surface-sunk)]',
  // Quiet action inside dense UI — tables, toolbars, filter rows.
  tertiary:
    'border border-transparent bg-[var(--sq-surface-sunk)] text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-raised)] hover:text-[var(--sq-ink)]',
  // Lowest emphasis. No fill until hover.
  ghost:
    'bg-transparent text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-sunk)] hover:text-[var(--sq-ink)]',
  // Irreversible or removing. Rare by design.
  destructive:
    'bg-[var(--sq-risk-fill)] text-white shadow-[var(--sq-shadow-flat)] hover:brightness-110',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex select-none items-center justify-center rounded-[var(--radius-control)] font-bold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sq-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sq-canvas)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

/**
 * The ShieldQuest mark, portal-sized.
 *
 * Carries the "Demo" qualifier in the identity itself rather than in a banner.
 * Every number in this portal is authored, and the place a reader is most
 * likely to look for that caveat is the product name.
 */
export function PortalMark({ subtitle = 'Admin Portal' }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-navy-900 shadow-sm"
      >
        <Shield className="h-4.5 w-4.5 text-amber-400" />
      </span>
      <div>
        <p className="text-[13px] font-black uppercase tracking-tight text-navy-950">
          Shield<span className="text-civic-600">Quest</span>
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sq-ink-muted)]">
          {subtitle}
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          <span className="text-[var(--sq-earned-text)]">Demo</span>
        </p>
      </div>
    </div>
  );
}

/** Marks a panel whose figures are authored rather than measured. */
export function PrototypeNotice({ text }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--sq-earned-text)]">
      <Info className="h-3 w-3" aria-hidden="true" />
      <span>{text ?? 'Illustrative demonstration data'}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

/**
 * A centred dialog, or a right-hand drawer.
 *
 * Hand-rolled rather than built on `<dialog>` (which the public site's enquiry
 * form uses) because the portal needs a drawer that is the full height of the
 * viewport and pinned to the right edge, and the top layer's centring is not
 * something `showModal()` gives up. Focus is moved in, Tab is trapped, Escape
 * closes, and the background is locked from scrolling — all of which
 * `<dialog>` would have given us, so each is implemented here deliberately
 * rather than forgotten.
 */
export function Modal({
  open,
  onClose,
  dismissible = true,
  children,
  className = '',
  labelledBy,
  placement = 'center',
  size = 'default',
}: {
  open: boolean;
  onClose?: () => void;
  dismissible?: boolean;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  /** `center` for dialogs, `right` for the detail drawers. */
  placement?: 'center' | 'right';
  size?: 'default' | 'wide' | 'form';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      const items = [
        ...(panel?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? []),
        // A hidden item is not a stop: the drawers switch tabs, and the
        // panels behind an inactive tab are still in the DOM.
      ].filter((item) => item.getClientRects().length > 0);

      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || active === panel)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, dismissible]);

  if (!open) return null;

  const isRight = placement === 'right';
  const shape = isRight
    ? // 480px: wide enough for the scenario detail panel, narrow enough that
      // the portal behind it stays readable rather than replaced.
      'h-dvh max-h-dvh max-w-[480px] border-l border-[var(--sq-line)]'
    : size === 'form'
      ? // A working dialog rather than a message: wide enough that the
        // two-column form rows stay two columns, short enough that the portal
        // is still visible around it. On a phone it is a bottom sheet, because
        // 900px of dialog on a 390px screen is a page.
        'max-h-[92dvh] rounded-t-[var(--radius-panel)] border border-[var(--sq-line)] sm:max-h-[88dvh] sm:max-w-[900px] sm:rounded-[var(--radius-card)] lg:max-w-[960px]'
      : size === 'wide'
        ? 'max-h-dvh max-w-2xl rounded-t-[var(--radius-panel)] border border-[var(--sq-line)] sm:rounded-[var(--radius-card)]'
        : 'max-h-dvh max-w-lg rounded-t-[var(--radius-panel)] border border-[var(--sq-line)] sm:rounded-[var(--radius-card)]';

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isRight ? 'justify-end' : 'items-end justify-center p-0 sm:items-center sm:p-6'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="absolute inset-0 bg-[var(--color-navy-950)]/55"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`sq-pop relative flex w-full flex-col overflow-hidden bg-[var(--sq-surface)] shadow-[var(--sq-shadow-float)] outline-none ${shape} ${className}`}
      >
        {dismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2.5 top-2.5 z-10 grid h-11 w-11 place-items-center rounded-[var(--radius-inset)] text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-canvas)] hover:text-[var(--sq-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
