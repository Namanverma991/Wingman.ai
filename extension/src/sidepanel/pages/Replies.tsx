/**
 * Reply history page.
 */

import React, { useEffect } from 'react';
import { useReplies } from '../hooks/useReplies';
import Header from '../components/Header';
import { formatTimestamp, truncate } from '../../utils/formatter';
import { TONE_CONFIG } from '../../types/reply';
import type { Tone } from '../../types/reply';

const Replies: React.FC = () => {
  const { history, historyTotal, historyPage, fetchHistory } = useReplies();

  useEffect(() => {
    fetchHistory(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white/90">Reply History</h2>
          <span className="text-xs text-white/40">{historyTotal} total</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📝</span>
            <p className="text-sm text-white/40">No reply history yet</p>
            <p className="text-xs text-white/30 mt-1">Generate some replies to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const toneConfig = TONE_CONFIG[item.tone as Tone];
              return (
                <div key={item.id} className="glass-card-hover p-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {item.platform === 'whatsapp' ? '💬' : '📸'}
                      </span>
                      <span className="text-xs text-white/60 font-medium">
                        {item.contact_name || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30">
                      {formatTimestamp(item.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-white/40 mb-2">
                    {truncate(item.conversation_snippet, 100)}
                  </p>

                  {/* Tone badge */}
                  <span
                    className="badge text-[10px]"
                    style={{
                      backgroundColor: `${toneConfig?.color || '#6366F1'}20`,
                      color: toneConfig?.color || '#6366F1',
                      borderColor: `${toneConfig?.color || '#6366F1'}40`,
                      borderWidth: '1px',
                    }}
                  >
                    {toneConfig?.emoji} {toneConfig?.label || item.tone}
                  </span>

                  {/* Replies preview */}
                  {item.replies?.items && (
                    <div className="mt-3 space-y-1.5">
                      {item.replies.items.slice(0, 2).map((reply: string, i: number) => (
                        <p key={i} className="text-xs text-white/50 bg-white/5 rounded-lg p-2">
                          {truncate(reply, 80)}
                        </p>
                      ))}
                      {item.replies.items.length > 2 && (
                        <p className="text-[10px] text-white/30">
                          +{item.replies.items.length - 2} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {historyTotal > 20 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => fetchHistory(historyPage - 1)}
              disabled={historyPage <= 1}
              className="btn-secondary text-xs disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs text-white/40">
              Page {historyPage}
            </span>
            <button
              onClick={() => fetchHistory(historyPage + 1)}
              disabled={historyPage * 20 >= historyTotal}
              className="btn-secondary text-xs disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Replies;
