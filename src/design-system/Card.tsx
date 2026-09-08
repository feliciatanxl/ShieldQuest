import React from 'react';

export type CardVariant = 'default' | 'subtle' | 'interactive' | 'featured' | 'inverse';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * The one card in ShieldQuest — skin-aware like `Button`, so the same
 * component is correct on the public site and inside the player PWA.
 *
 * Elevation carries meaning rather than decoration: `default` sits on the
 * canvas, `interactive` lifts on hover to signal it is actionable, `featured`
 * adds a ring to mark the recommended path. Three steps, no more.
 */
export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-[16px] transition border';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-[var(--sq-surface)] border-[var(--sq-line)] shadow-[var(--sq-shadow-flat)] text-[var(--sq-ink)]',
    subtle: 'bg-[var(--sq-surface-sunk)] border-[var(--sq-line)] text-[var(--sq-ink)]',
    interactive:
      'bg-[var(--sq-surface)] border-[var(--sq-line)] shadow-[var(--sq-shadow-flat)] hover:border-[var(--sq-action)] hover:shadow-[var(--sq-shadow-raised)] hover:-translate-y-0.5 cursor-pointer text-[var(--sq-ink)]',
    featured:
      'bg-[var(--sq-surface)] border-[var(--sq-action)]/30 shadow-[var(--sq-shadow-raised)] ring-1 ring-[var(--sq-action)]/10 text-[var(--sq-ink)]',
    // Always dark, in both skins — for consequence takeovers and hero panels
    // that must read as a deliberate break from the surrounding page.
    inverse: 'bg-[var(--color-navy-900)] border-[var(--color-navy-800)] text-white shadow-[var(--sq-shadow-float)]',
  };

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 flex flex-col space-y-1.5 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-base font-extrabold tracking-tight text-[var(--sq-ink)] sm:text-lg ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs leading-relaxed text-[var(--sq-ink-muted)] ${className}`}>{children}</p>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mt-5 flex items-center border-t border-[var(--sq-line)] pt-4 text-xs ${className}`}
    >
      {children}
    </div>
  );
}
