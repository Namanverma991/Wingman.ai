/**
 * Reply list — renders all generated reply cards.
 */

import React from 'react';
import type { SingleReply } from '../../types/reply';
import ReplyCard from './ReplyCard';

interface ReplyListProps {
  replies: SingleReply[];
  onCopy: (index: number) => void;
  latencyMs: number | null;
  model: string | null;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, onCopy, latencyMs, model }) => {
  if (replies.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Meta info */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-white/40">
          {replies.length} suggestion{replies.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          {latencyMs && <span>⚡ {Math.round(latencyMs)}ms</span>}
          {model && <span>🤖 {model}</span>}
        </div>
      </div>

      {/* Reply cards */}
      {replies.map((reply) => (
        <ReplyCard key={reply.index} reply={reply} onCopy={onCopy} />
      ))}
    </div>
  );
};

export default ReplyList;
