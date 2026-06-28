import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, className = "" }) => (
  <div className={`flex items-center justify-center text-tactical-text ${className}`} style={{ height: 'calc(100vh - 73px)' }}>
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-tactical-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      {message && <p className="font-medium text-tactical-text">{message}</p>}
    </div>
  </div>
);
