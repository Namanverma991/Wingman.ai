/**
 * Side Panel App — root component with page routing.
 */

import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useUIStore } from '../store/uiStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Replies from './pages/Replies';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Loading from './components/Loading';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentPage, notification, clearNotification } = useUIStore();

  if (isLoading) {
    return <Loading message="Initializing Wingman AI..." />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'replies':
        return <Replies />;
      case 'account':
        return <Account />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-3 rounded-xl text-sm font-medium
            animate-slide-up cursor-pointer backdrop-blur-xl border
            ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : ''}
            ${notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' : ''}
            ${notification.type === 'info' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : ''}
          `}
          onClick={clearNotification}
        >
          {notification.message}
        </div>
      )}

      {renderPage()}
    </div>
  );
};

export default App;
