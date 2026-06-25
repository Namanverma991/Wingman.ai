/**
 * Login page with register/login toggle.
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../../utils/validators';

type Mode = 'login' | 'register';

const Login: React.FC = () => {
  const { login, register, error, clearError, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        if (!username || username.length < 3) {
          setLocalError('Username must be at least 3 characters');
          return;
        }
        await register({ email, username, password, full_name: fullName || undefined });
      }
    } catch {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-3xl font-bold text-white">W</span>
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-1">Wingman AI</h1>
        <p className="text-xs text-white/40">Smart replies for your conversations</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white/90 text-center">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>

          {/* Error */}
          {displayError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              {displayError}
            </div>
          )}

          {mode === 'register' && (
            <>
              <input
                id="register-fullname"
                type="text"
                placeholder="Full name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field text-sm"
              />
              <input
                id="register-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field text-sm"
                required
              />
            </>
          )}

          <input
            id="auth-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field text-sm"
            required
          />

          <input
            id="auth-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field text-sm"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        {/* Toggle */}
        <p className="text-center text-xs text-white/40">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
