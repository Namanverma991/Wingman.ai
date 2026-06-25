/**
 * Single reply card with copy-to-clipboard action.
 */

import React, { useState } from 'react';
import type { SingleReply } from '../../types/reply';
import { TONE_CONFIG } from '../../types/reply';
import type { Tone } from '../../types/reply';

interface ReplyCardProps {
  reply: SingleReply;
  onCopy: (index: number) => void;
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const toneConfig = TONE_CONFIG[reply.tone as Tone];

  const handleCopy = () => {
    onCopy(reply.index);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-card-hover p-4 animate-slide-up"
      style={{ animationDelay: `${reply.index * 100}ms` }}
    >
      {/* Tone badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="badge text-[10px]"
          style={{
            backgroundColor: `${toneConfig?.color}20`,
            color: toneConfig?.color,
            borderColor: `${toneConfig?.color}40`,
            borderWidth: '1px',
          }}
        >
          {toneConfig?.emoji} {toneConfig?.label}
        </span>
        <span className="text-[10px] text-white/30">#{reply.index + 1}</span>
      </div>

      {/* Reply text */}
      <p className="text-sm text-white/90 leading-relaxed mb-3">{reply.text}</p>

      {/* Actions */}
      <button
        onClick={handleCopy}
        className={`w-full py-2 rounded-lg text-xs font-medium transition-all duration-300
          ${copied
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30'
          }
        `}
      >
        {copied ? '✓ Copied!' : '📋 Copy reply'}
      </button>
    </div>
  );
};

export default ReplyCard;
