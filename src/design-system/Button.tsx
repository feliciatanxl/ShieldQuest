import React, { forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'destructive'
  | 'gold';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The one button in ShieldQuest.
 *
 * Every variant is written against the semantic roles in `tokens.css`
 * (`--sq-action`, `--sq-surface`, `--sq-ink`…) rather than raw ramp steps, so a
 * single definition renders correctly on the light "civic" skin (public site,
 * facilitator portal) AND the dark "game" skin (player PWA). Do not fork this
 * component per surface — set `data-skin="game"` on the shell instead.
 *
 * Sizing keeps a 44px minimum touch target at `md` and above: sessions run on
 * whatever phones participants bring, often one-handed.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition select-none rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sq-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sq-canvas)] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5',
      md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
      lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      // The single most important action on a screen. One per view.
      primary:
        'bg-[var(--sq-action)] text-[var(--sq-action-ink)] shadow-[var(--sq-shadow-flat)] hover:bg-[var(--sq-action-hover)]',
      // Equal-weight alternative sitting on a surface.
      secondary:
        'border border-[var(--sq-line)] bg-[var(--sq-surface)] text-[var(--sq-ink)] shadow-[var(--sq-shadow-flat)] hover:border-[var(--sq-line-strong)] hover:bg-[var(--sq-surface-sunk)]',
      // Quiet action inside dense UI (tables, toolbars).
      tertiary:
        'border border-transparent bg-[var(--sq-surface-sunk)] text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-raised)] hover:text-[var(--sq-ink)]',
      // Lowest emphasis. No fill until hover.
      ghost:
        'bg-transparent text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-sunk)] hover:text-[var(--sq-ink)]',
      // Irreversible or removing. Rare by design.
      destructive:
        'bg-[var(--sq-risk-fill)] text-white shadow-[var(--sq-shadow-flat)] hover:brightness-110',
      // Reserved for EARNED progress — claiming a Guardian, completing a
      // district. Never for navigation, and never for a chance-based reward:
      // Guardians are earned through demonstrated skill (proposal §3.2).
      gold: 'bg-[var(--sq-earned)] text-[var(--color-navy-950)] font-black uppercase tracking-wider shadow-[var(--sq-shadow-flat)] hover:brightness-105',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
