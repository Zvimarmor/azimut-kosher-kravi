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
      {label && <label className="block text-base font-semibold text-gray-800 mb-1 text-right">{label}</label>}
      <input
        className={`w-full border border-gray-300 rounded-lg px-3 py-3 text-base bg-white text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1 text-right">{error}</p>}
    </div>
  );
}