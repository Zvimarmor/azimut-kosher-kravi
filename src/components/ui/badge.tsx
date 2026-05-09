import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-tactical-accent/20 text-tactical-accent border border-tactical-accent/20',
    secondary: 'bg-tactical-surface text-tactical-muted border border-tactical-accent/10',
    destructive: 'bg-red-500/20 text-red-400 border border-red-500/20',
    outline: 'border border-tactical-accent/30 bg-transparent text-tactical-accent'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}