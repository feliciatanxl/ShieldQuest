import { Shield } from 'lucide-react';

interface BrandMarkProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
}

export function BrandMark({
  variant = 'light',
  size = 'md',
  showWordmark = true,
  subtitle,
  className = '',
}: BrandMarkProps) {
  const isDark = variant === 'dark';

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

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Canonical Shield Mark */}
      <div
        className={`flex items-center justify-center shadow-sm transition ${iconSizes[size]} ${
          isDark
            ? 'bg-gradient-to-br from-navy-800 to-navy-950 text-amber-400 border border-amber-400/30'
            : 'bg-gradient-to-br from-navy-900 to-navy-950 text-amber-400 border border-navy-800/40'
        }`}
      >
        <Shield className={`${shieldSizes[size]} fill-current`} />
      </div>

      {/* Canonical Wordmark */}
      {showWordmark && (
        <div className="text-left">
          <div className={`font-black uppercase tracking-tight ${titleSizes[size]} ${isDark ? 'text-white' : 'text-navy-950'}`}>
            Shield<span className={isDark ? 'text-civic-400' : 'text-civic-600'}>Quest</span>
          </div>
          {subtitle ? (
            <div className={`text-[9px] font-extrabold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </div>
          ) : (
            <div className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Project SHIELD
            </div>
          )}
        </div>
      )}
    </div>
  );
}
