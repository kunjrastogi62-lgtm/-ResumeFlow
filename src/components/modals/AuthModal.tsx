import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        handleClose();
      } else if (authModalTab === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        const { error, needsEmailConfirmation } = await signUpWithEmail(email, password, fullName);
        if (error) throw error;
        if (needsEmailConfirmation) {
          setSuccessMsg('Account created! Please check your email to verify your address before logging in.');
        } else {
          handleClose();
        }
      } else if (authModalTab === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccessMsg('Password reset link sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#11131a] border border-[#232736] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#232736] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {authModalTab === 'login' && 'Sign in to ResumeFlow'}
              {authModalTab === 'signup' && 'Create your ResumeFlow account'}
              {authModalTab === 'reset' && 'Reset your password'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {authModalTab === 'login' && 'Access and sync your private resumes in Supabase'}
              {authModalTab === 'signup' && 'Save and synchronize your resumes in real-time'}
              {authModalTab === 'reset' && 'We will send a recovery link to your email'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        {authModalTab !== 'reset' && (
          <div className="flex border-b border-[#232736] bg-[#0d0f17] text-xs">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition ${
                authModalTab === 'login'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthModalTab('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-center font-medium border-b-2 transition ${
                authModalTab === 'signup'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alexander Hayes"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {authModalTab !== 'reset' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-neutral-300">Password</label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('reset')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {authModalTab === 'login' && 'Sign In'}
                    {authModalTab === 'signup' && 'Create Account'}
                    {authModalTab === 'reset' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {authModalTab !== 'reset' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#232736]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#11131a] px-2 text-neutral-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2 px-4 text-xs font-medium rounded-lg bg-[#0a0c12] hover:bg-[#161922] text-neutral-200 border border-[#232736] flex items-center justify-center gap-2.5 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {authModalTab === 'reset' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
