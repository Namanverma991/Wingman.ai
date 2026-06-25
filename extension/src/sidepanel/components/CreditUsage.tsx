/**
 * Credit usage display with progress bar.
 */

import React, { useEffect, useState } from 'react';
import { getCreditBalance } from '../../services/conversation';
import type { CreditBalance } from '../../types/api';
import { formatCredits } from '../../utils/formatter';

const CreditUsage: React.FC = () => {
  const [balance, setBalance] = useState<CreditBalance | null>(null);

  useEffect(() => {
    getCreditBalance()
      .then(setBalance)
      .catch(() => {/* silent fail — non-critical */});
  }, []);

  if (!balance) return null;

  const usagePercent = Math.max(
    0,
    Math.min(100, (balance.credits_remaining / balance.daily_limit) * 100),
  );

  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">Credits</span>
        <span className="text-xs font-medium text-white/80">
          {formatCredits(balance.credits_remaining, balance.daily_limit)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${usagePercent}%`,
            background:
              usagePercent > 50
                ? 'linear-gradient(90deg, #6366F1, #8B5CF6)'
                : usagePercent > 20
                  ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                  : '#EF4444',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="badge-primary text-[9px]">{balance.plan}</span>
        <span className="text-[10px] text-white/30">Resets daily</span>
      </div>
    </div>
  );
};

export default CreditUsage;
