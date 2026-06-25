/**
 * User profile card for the account page.
 */

import React from 'react';
import type { UserProfile } from '../../types/user';
import { formatTimestamp } from '../../utils/formatter';

interface UserProfileCardProps {
  user: UserProfile;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  const planColors: Record<string, string> = {
    free: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
    pro: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
    enterprise: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  };

  return (
    <div className="glass-card p-5 animate-fade-in">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-white/90">{user.full_name || user.username}</h3>
          <p className="text-xs text-white/40">{user.email}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Plan</span>
          <span className={`badge border ${planColors[user.plan] || planColors.free}`}>
            {user.plan.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Credits</span>
          <span className="text-sm font-medium text-white/80">{user.credits_remaining}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Member since</span>
          <span className="text-xs text-white/60">{formatTimestamp(user.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
