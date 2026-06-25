/**
 * Settings page (placeholder for future features).
 */

import React from 'react';
import Header from '../components/Header';

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <h2 className="text-base font-semibold text-white/90">Settings</h2>

        <div className="glass-card p-4 space-y-4">
          {/* Default tone */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Default Tone</p>
              <p className="text-[10px] text-white/30">Pre-select your favourite tone</p>
            </div>
            <span className="badge-primary text-xs">Confident</span>
          </div>

          <div className="border-t border-white/5" />

          {/* Number of replies */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Replies per request</p>
              <p className="text-[10px] text-white/30">Default number of suggestions</p>
            </div>
            <span className="text-sm text-white/60 font-medium">3</span>
          </div>

          <div className="border-t border-white/5" />

          {/* Auto-detect */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Auto-detect chats</p>
              <p className="text-[10px] text-white/30">Automatically extract conversations</p>
            </div>
            <div className="w-10 h-5 rounded-full bg-indigo-500/30 border border-indigo-500/50 relative cursor-pointer">
              <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-indigo-400 transition-all" />
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-white/20 pt-4">
          Wingman AI v1.0.0
        </p>
      </main>
    </div>
  );
};

export default Settings;
