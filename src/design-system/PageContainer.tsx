import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'public' | 'admin' | 'player' | 'fluid';
  children: React.ReactNode;
}

export function PageContainer({
  variant = 'public',
  children,
  className = '',
  ...props
}: PageContainerProps) {
  const containerVariants = {
    public: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
    admin: 'mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
    player: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6',
    fluid: 'w-full px-4 sm:px-6 lg:px-8',
  };

  return (
    <div className={`${containerVariants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
