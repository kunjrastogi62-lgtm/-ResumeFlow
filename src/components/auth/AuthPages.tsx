import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, formatAuthError } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';
import { ResumeFlowLogo } from '../common/ResumeFlowLogo';

const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col justify-between p-4 sm:p-6">
    <div className="max-w-6xl w-full mx-auto flex items-center justify-between pt-2">
      <Link to="/" className="hover:opacity-90 transition">
        <ResumeFlowLogo size="md" />
      </Link>
      <Link
        to="/"
        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to home</span>
      </Link>
    </div>

    <div className="w-full max-w-[420px] mx-auto my-10">
      <div className="bg-[#101219] border border-[#1f2433] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>

    <div className="text-center text-[11px] text-neutral-500 pb-2">
      ResumeFlow • Your Career. Your Story. Powered by AI.
    </div>
  </div>
);

const GoogleButton: React.FC<{ onClick: () => void; loading: boolean; label: string }> = ({
  onClick,
  loading,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-[#0a0c12] hover:bg-[#151926] text-neutral-200 border border-[#232736] hover:border-[#32394f] flex items-center justify-center gap-2.5 transition disabled:opacity-50"
  >
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
    <span>{label}</span>
  </button>
);

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setNeedsVerification(false);
    setLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        const msg = formatAuthError(error);
        if (String(error.message || '').toLowerCase().includes('email not confirmed')) {
          setNeedsVerification(true);
        }
        throw new Error(msg);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResending(true);
    setError(null);
    const { error } = await resendVerificationEmail(email);
    setResending(false);
    if (error) {
      setError(formatAuthError(error));
    } else {
      setNotice(`Verification link sent to ${email}. Check your inbox and spam folder.`);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(formatAuthError(error));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your saved resumes, ATS scores, and AI tools."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
            {needsVerification && email && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-300 hover:text-indigo-200 underline font-medium flex items-center gap-1 ml-6"
              >
                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span>Resend verification email</span>
              </button>
            )}
          </div>
        )}

        {notice && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <GoogleButton onClick={handleGoogle} loading={loading} label="Continue with Google" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1f2433]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[#101219] px-2.5 text-neutral-500">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition">
                Forgot password?
              </Link>
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
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export const SignupPage: React.FC = () => {
  const { signUpWithEmail, signInWithGoogle, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setLoading(true);
    try {
      const { error, needsEmailConfirmation } = await signUpWithEmail(email, password, fullName);
      if (error) throw new Error(formatAuthError(error));

      if (needsEmailConfirmation) {
        setVerificationSent(true);
        setResendCooldown(30);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendStatus(null);
    setError(null);
    const { error } = await resendVerificationEmail(email);
    if (error) {
      setError(formatAuthError(error));
    } else {
      setResendStatus('Verification email resent! Please check your inbox and spam folder.');
      setResendCooldown(45);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(formatAuthError(error));
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="One quick step to activate your ResumeFlow workspace."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Verification link sent</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              We sent a confirmation email to <span className="font-semibold text-white">{email}</span>. Click the link in that email to verify your account and access your dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {resendStatus && (
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              {resendStatus}
            </div>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-[#161925] hover:bg-[#1e2334] text-neutral-200 border border-[#252b3d] disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              {resendCooldown > 0
                ? `Resend verification email (${resendCooldown}s)`
                : 'Resend verification email'}
            </span>
          </button>

          <p className="text-center text-xs text-neutral-400 pt-1">
            Already verified?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Go to login
            </Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building ATS-ready resumes backed by Google Gemini and Supabase."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <GoogleButton onClick={handleGoogle} loading={loading} label="Sign up with Google" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1f2433]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[#101219] px-2.5 text-neutral-500">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition mt-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw new Error(formatAuthError(error));
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email address and we will send you a secure password recovery link."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recovery email sent</span>
              </div>
              <p className="text-neutral-300">
                Check <span className="font-semibold text-white">{email}</span> for a password reset link.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-[#161925] hover:bg-[#1e2334] text-white border border-[#252b3d] transition"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            <p className="text-center text-xs text-neutral-400">
              Remembered your password?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
};

const processedAuthCodes = new Set<string>();

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword, session, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [exchanging, setExchanging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    const verifyRecovery = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');

      setExchanging(true);
      try {
        // Wait for detectSessionInUrl (implicit hash or auto PKCE) to settle first
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) return;

        if (tokenHash) {
          const { error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (otpErr && active) setError(formatAuthError(otpErr));
        } else if (code && !processedAuthCodes.has(code)) {
          processedAuthCodes.add(code);
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr && active) {
            const { data: retryData } = await supabase.auth.getSession();
            if (!retryData.session) {
              setError(formatAuthError(exErr));
            }
          }
        }
      } finally {
        if (active) setExchanging(false);
      }
    };

    verifyRecovery();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw new Error(formatAuthError(error));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err: any) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || exchanging) {
    return (
      <AuthShell title="Verifying recovery link" subtitle="Please wait while we validate your reset token.">
        <div className="py-8 flex flex-col items-center gap-3 text-xs text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Validating security session...</span>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your ResumeFlow account."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!session && !success ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-3">
            <p className="leading-relaxed">
              Your recovery link may have expired or was opened in a different browser session. Request a fresh password reset link below.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 font-semibold underline"
            >
              <span>Request new password reset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : success ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Password updated! Redirecting you to your dashboard...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
};

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const handleCallback = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        if (mounted) setError('Supabase is not configured.');
        return;
      }

      const hashParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
      );
      const errorDesc =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

      if (errorDesc) {
        if (mounted) setError(decodeURIComponent(errorDesc));
        return;
      }

      const type = searchParams.get('type') || hashParams.get('type');
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');

      try {
        // Let Supabase's detectSessionInUrl finish first so we never double-consume a PKCE code
        let { data: { session } } = await supabase.auth.getSession();

        if (!session && tokenHash && type) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (otpError) throw otpError;
          ({ data: { session } } = await supabase.auth.getSession());
        } else if (!session && code && !processedAuthCodes.has(code)) {
          processedAuthCodes.add(code);
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            // Re-check session in case concurrent detectSessionInUrl succeeded
            const retry = await supabase.auth.getSession();
            if (retry.data.session) {
              session = retry.data.session;
            } else {
              throw exchangeError;
            }
          } else {
            ({ data: { session } } = await supabase.auth.getSession());
          }
        }

        if (!mounted) return;

        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
        } else if (session) {
          navigate('/dashboard', { replace: true });
        } else {
          // Wait briefly for implicit hash / auth listener to finish
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) return;
            if (data.session) {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/login', { replace: true });
            }
          }, 800);
        }
      } catch (err: any) {
        if (mounted) setError(formatAuthError(err));
      }
    };

    handleCallback();
    return () => {
      mounted = false;
    };
  }, [searchParams, navigate]);

  return (
    <AuthShell
      title="Completing sign in"
      subtitle="Connecting your authenticated Supabase session."
    >
      {error ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
          <Link
            to="/login"
            className="block w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center gap-3 text-xs text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Verifying credentials and preparing your workspace...</span>
        </div>
      )}
    </AuthShell>
  );
};
