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
    // Base styles ensuring 44px minimum touch target on standard sizes, 10px canonical radius, and accessible focus ring
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition select-none rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5',
      md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
      lg: 'min-h-[48px] px-6 py-3 text-base gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-civic-600 text-white shadow-sm hover:bg-civic-700 active:bg-civic-800',
      secondary:
        'border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
      tertiary:
        'border border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
      destructive:
        'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
      gold:
        'bg-amber-500 text-navy-950 font-black uppercase tracking-wider shadow-sm hover:bg-amber-400 active:bg-amber-600',
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
