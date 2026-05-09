import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="my-2">
      {label && <label className="block text-base font-semibold text-tactical-text mb-1 text-right">{label}</label>}
      <input
        className={`w-full glass-input px-4 py-3 text-base text-right placeholder:text-tactical-muted/60 focus:border-tactical-accent focus:ring-2 focus:ring-tactical-accent/20 focus:outline-none ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1 text-right">{error}</p>}
    </div>
  );
}