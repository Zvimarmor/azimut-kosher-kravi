import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[var(--color-accent-primary)] text-[var(--color-text-light)]',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-[var(--color-accent-primary)] bg-transparent text-[var(--color-accent-primary)]'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}