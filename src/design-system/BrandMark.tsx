import { Shield } from 'lucide-react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  subtitle?: string;
  /**
   * Force the wordmark to read on a dark background even on the light skin.
   * Only needed where a light-skin surface is locally inverted — the
   * facilitator login's navy panel, for instance. Everywhere else, leave this
   * off and let the skin decide.
   */
  onDark?: boolean;
  className?: string;
}

/**
 * The ShieldQuest logo.
 *
 * The shield itself is FIXED — navy with an amber shield, in both skins. A logo
 * that changes colour with its surroundings stops being recognisable, and this
 * mark also has to survive as a PWA icon and a favicon where no skin applies.
 *
 * The wordmark beside it does follow the skin, via tokens. This component
 * previously took a `variant: 'light' | 'dark'` prop and hardcoded
 * `text-navy-950` / `text-white` from it — so when the player shell adopted
 * the dark game skin while still passing `variant="light"`, the word
 * "SHIELD" turned navy-on-navy and vanished. Deciding a colour from a prop
 * that the caller has to keep in sync with the surface is the bug; reading it
 * from the surface is the fix.
 */
export function BrandMark({
  size = 'md',
  showWordmark = true,
  subtitle,
  onDark = false,
  className = '',
}: BrandMarkProps) {
  const iconSizes = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
  };

  const shieldSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const inkClass = onDark ? 'text-white' : 'text-[var(--sq-ink)]';
  const accentClass = onDark ? 'text-[var(--color-civic-400)]' : 'text-[var(--sq-action-text)]';
  const subtitleClass = onDark
    ? 'text-[var(--color-navy-200)]'
    : 'text-[var(--sq-ink-muted)]';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center border border-[var(--color-navy-800)] bg-gradient-to-br from-[var(--color-navy-900)] to-[var(--color-navy-950)] text-[var(--color-amber-400)] shadow-[var(--sq-shadow-flat)] ${iconSizes[size]}`}
      >
        <Shield className={`${shieldSizes[size]} fill-current`} />
      </div>

      {showWordmark && (
        <div className="text-left">
          <div className={`font-black uppercase tracking-tight ${titleSizes[size]} ${inkClass}`}>
            Shield<span className={accentClass}>Quest</span>
          </div>
          <div
            className={`text-[9px] font-extrabold uppercase tracking-widest ${subtitleClass}`}
          >
            {subtitle ?? 'Project SHIELD'}
          </div>
        </div>
      )}
    </div>
  );
}
