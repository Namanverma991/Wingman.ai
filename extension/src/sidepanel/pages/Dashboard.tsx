/**
 * Dashboard page — main view with conversation context, tone selector,
 * generate button, and reply list.
 */

import React from 'react';
import { useConversation } from '../hooks/useConversation';
import { useReplies } from '../hooks/useReplies';
import Header from '../components/Header';
import GenerateButton from '../components/GenerateButton';
import ReplyList from '../components/ReplyList';
import CreditUsage from '../components/CreditUsage';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { TONE_CONFIG } from '../../types/reply';
import type { Tone } from '../../types/reply';

const Dashboard: React.FC = () => {
  const { activeConversation, hasConversation, contactName } = useConversation();
  const {
    replies,
    isGenerating,
    selectedTone,
    error,
    latencyMs,
    model,
    generate,
    setTone,
    clearError,
    copyReply,
  } = useReplies();

  const handleGenerate = async () => {
    if (!activeConversation) return;
    await generate(activeConversation);
  };

  const tones = Object.entries(TONE_CONFIG) as [Tone, typeof TONE_CONFIG[Tone]][];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Credit usage */}
        <CreditUsage />

        {/* Tone selector */}
        <div className="space-y-2">
          <span className="text-xs text-white/40 px-1">Select tone</span>
          <div className="flex flex-wrap gap-1.5">
            {tones.map(([key, config]) => (
              <button
                key={key}
                onClick={() => setTone(key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200
                  ${selectedTone === key
                    ? 'border shadow-sm'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-transparent'
                  }
                `}
                style={
                  selectedTone === key
                    ? {
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                        borderColor: `${config.color}40`,
                        boxShadow: `0 2px 8px ${config.color}20`,
                      }
                    : undefined
                }
              >
                {config.emoji} {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <GenerateButton
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={!hasConversation}
          hasConversation={hasConversation}
          contactName={contactName}
        />

        {/* Error */}
        {error && (
          <ErrorState
            message={error}
            onRetry={hasConversation ? handleGenerate : undefined}
            onDismiss={clearError}
          />
        )}

        {/* Results */}
        {replies.length > 0 ? (
          <ReplyList
            replies={replies}
            onCopy={copyReply}
            latencyMs={latencyMs}
            model={model}
          />
        ) : (
          !isGenerating && !error && !hasConversation && <EmptyState />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
