import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tactical-bg';

  const variantClasses = {
    default: 'gradient-accent text-tactical-bg hover:shadow-[0_0_20px_rgba(127,176,105,0.3)] focus:ring-tactical-accent btn-tactical',
    outline: 'border border-tactical-accent/30 text-tactical-accent bg-transparent hover:bg-tactical-accent/10 hover:border-tactical-accent/50 focus:ring-tactical-accent btn-tactical',
    ghost: 'text-tactical-muted bg-transparent hover:bg-tactical-accent/10 hover:text-tactical-accent focus:ring-tactical-accent',
    destructive: 'bg-red-600/80 text-white hover:bg-red-600 focus:ring-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  const disabledClasses = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}