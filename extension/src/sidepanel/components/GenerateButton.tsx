/**
 * Generate button with loading state and conversation context indicator.
 */

import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  hasConversation: boolean;
  contactName: string | null;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  disabled,
  hasConversation,
  contactName,
}) => {
  return (
    <div className="space-y-2">
      {hasConversation && contactName && (
        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          <span className="text-xs text-white/50">
            Chatting with <span className="text-white/80 font-medium">{contactName}</span>
          </span>
        </div>
      )}

      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
          ${isLoading
            ? 'bg-gradient-to-r from-indigo-600/50 to-purple-600/50 cursor-wait'
            : disabled
              ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
              : 'btn-primary'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : disabled ? (
          'Open a chat to generate replies'
        ) : (
          '✨ Generate Smart Replies'
        )}
      </button>
    </div>
  );
};

export default GenerateButton;
