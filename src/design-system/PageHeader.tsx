import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  breadcrumb,
  actions,
  className = '',
  theme = 'light',
}: PageHeaderProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={`text-[10px] font-black uppercase tracking-[0.2em] sm:text-[11px] ${
                isDark ? 'text-amber-400' : 'text-civic-700'
              }`}
            >
              {eyebrow}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1
              className={`text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${
                isDark ? 'text-white' : 'text-navy-950'
              }`}
            >
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>

          {description && (
            <p
              className={`mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2.5 sm:self-center">{actions}</div>}
      </div>
    </div>
  );
}
