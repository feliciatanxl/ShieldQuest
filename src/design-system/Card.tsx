import React from 'react';

export type CardVariant = 'default' | 'subtle' | 'interactive' | 'featured' | 'inverse';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition border';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white border-slate-200/80 shadow-sm text-slate-800',
    subtle: 'bg-slate-50 border-slate-200 text-slate-800',
    interactive:
      'bg-white border-slate-200/80 shadow-sm hover:border-civic-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer text-slate-800',
    featured: 'bg-white border-civic-200 shadow-md ring-1 ring-civic-500/10 text-slate-800',
    inverse: 'bg-navy-900 border-navy-800 text-white shadow-lg',
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
    <h3 className={`text-base font-extrabold tracking-tight text-navy-950 sm:text-lg ${className}`}>
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
  return <p className={`text-xs text-slate-500 leading-relaxed ${className}`}>{children}</p>;
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
    <div className={`mt-5 flex items-center border-t border-slate-100 pt-4 text-xs ${className}`}>
      {children}
    </div>
  );
}
