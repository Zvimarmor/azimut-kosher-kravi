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
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    default: 'bg-[var(--color-accent-primary)] text-[var(--color-text-light)] hover:bg-[var(--color-accent-secondary)] focus:ring-[var(--color-accent-primary)]',
    outline: 'border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-transparent hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-text-light)] focus:ring-[var(--color-accent-primary)]',
    ghost: 'text-[var(--color-accent-primary)] bg-transparent hover:bg-gray-100 focus:ring-[var(--color-accent-primary)]',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer btn-press';

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