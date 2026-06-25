/**
 * Header component with navigation and user info.
 */

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const Header: React.FC = () => {
  const { logout } = useAuthStore();
  const { currentPage, setPage, detectedPlatform } = useUIStore();

  const navItems = [
    { key: 'dashboard' as const, label: '🏠', title: 'Dashboard' },
    { key: 'replies' as const, label: '💬', title: 'Replies' },
    { key: 'account' as const, label: '👤', title: 'Account' },
    { key: 'settings' as const, label: '⚙️', title: 'Settings' },
  ];

  return (
    <header className="glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            W
          </div>
          <span className="font-semibold text-sm gradient-text">Wingman AI</span>
        </div>

        <div className="flex items-center gap-2">
          {detectedPlatform && (
            <span className="badge-primary text-[10px]">
              {detectedPlatform === 'whatsapp' ? '💬 WhatsApp' : '📸 Instagram'}
            </span>
          )}
          <button
            onClick={logout}
            className="text-white/40 hover:text-white/70 transition-colors text-xs"
            title="Logout"
          >
            ↗️
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            title={item.title}
            className={`flex-1 py-1.5 rounded-lg text-center text-xs transition-all duration-200
              ${currentPage === item.key
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
