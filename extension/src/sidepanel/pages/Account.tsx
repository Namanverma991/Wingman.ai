/**
 * Account page — displays user profile and usage stats.
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Header from '../components/Header';
import UserProfileCard from '../components/UserProfile';
import { getUsageSummary } from '../../services/conversation';
import type { UsageSummary } from '../../types/api';

const Account: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    getUsageSummary().then(setUsage).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <UserProfileCard user={user} />

        {/* Usage stats */}
        {usage && (
          <div className="glass-card p-4 space-y-3 animate-slide-up">
            <h3 className="text-sm font-semibold text-white/80">Usage Statistics</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold gradient-text">{usage.total_replies_generated}</p>
                <p className="text-[10px] text-white/40">Replies Generated</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold gradient-text">{usage.total_credits_consumed}</p>
                <p className="text-[10px] text-white/40">Credits Used</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-400">{usage.credits_remaining}</p>
                <p className="text-[10px] text-white/40">Credits Left</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-amber-400">{usage.credits_used_today}</p>
                <p className="text-[10px] text-white/40">Used Today</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={logout}
            className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Account;
