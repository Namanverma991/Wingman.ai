/**
 * Error state display with retry action.
 */

import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, onDismiss }) => {
  return (
    <div className="glass-card p-4 border-red-500/20 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">⚠️</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-red-300 mb-2">{message}</p>
          <div className="flex gap-2">
            {onRetry && (
              <button onClick={onRetry} className="btn-secondary text-xs py-1.5 px-3">
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs text-white/30 hover:text-white/50 py-1.5 px-3"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
