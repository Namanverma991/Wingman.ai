/**
 * Empty state when no conversation is detected.
 */

import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mb-6">
        <span className="text-4xl">💬</span>
      </div>
      <h3 className="text-lg font-semibold text-white/80 mb-2">No conversation detected</h3>
      <p className="text-sm text-white/40 leading-relaxed max-w-[260px]">
        Open a chat on WhatsApp Web or Instagram to start generating smart replies
      </p>

      <div className="mt-8 space-y-3 w-full max-w-[240px]">
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px]">1</span>
          <span>Open WhatsApp Web or Instagram</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px]">2</span>
          <span>Select a conversation</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px]">3</span>
          <span>Click "Generate Smart Replies"</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
