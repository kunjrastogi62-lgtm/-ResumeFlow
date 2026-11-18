/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomePopup } from './lib/welcome-popup';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ResumeBuilderView } from './components/editor/ResumeBuilderView';
import { SettingsPage } from './components/settings/SettingsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AuthCallbackPage,
} from './components/auth/AuthPages';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#090b10] flex flex-col items-center justify-center gap-3 text-xs text-neutral-400">
    <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
    <span>Loading ResumeFlow...</span>
  </div>
);

// Requires authenticated user; redirects logged-out visitors to /login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
};

// Redirects already authenticated users away from /login, /signup, /forgot-password to /dashboard
const PublicAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isWelcomeBlocking } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (user && !isWelcomeBlocking && !WelcomePopup.isOpen()) {
    const target = (location.state as any)?.from || '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

// Requires authenticated admin account; shows clear guidance instead of silent redirect
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <AuthLoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          notice: 'Sign in with your admin email (e.g. noreply@resume-flow-eight.vercel.app) to open the Admin Panel.',
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#101219] border border-[#1f2433] rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2.5 text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h1 className="text-base font-bold text-white">Admin Access Required</h1>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            You are currently signed in as <span className="font-semibold text-white">{user.email}</span>, which does not have admin privileges yet.
          </p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Sign in with your admin account (<span className="text-indigo-300">noreply@resume-flow-eight.vercel.app</span>) or promote your account to <code className="text-indigo-300">role = 'admin'</code> in Supabase <code className="text-indigo-300">profiles</code>.
          </p>
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/login', {
                  replace: true,
                  state: {
                    from: '/admin',
                    email: 'noreply@resume-flow-eight.vercel.app',
                    notice: 'Enter your admin credentials to access the Admin Panel.',
                  },
                });
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Sign in as Admin
            </button>
            <Link
              to="/dashboard"
              className="py-2 px-3 text-xs font-medium rounded-lg bg-[#161925] hover:bg-[#1e2334] text-neutral-200 border border-[#252b3d] transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { isRecoverySession, configModalOpen, setConfigModalOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isRecoverySession && location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
      return;
    }

    if (location.pathname === '/') {
      const s = location.search || '';
      const h = location.hash || '';
      const hasAuthParams =
        s.includes('code=') ||
        s.includes('token_hash=') ||
        s.includes('error_code=') ||
        s.includes('error_description=') ||
        h.includes('access_token=') ||
        h.includes('error_code=') ||
        h.includes('error_description=') ||
        h.includes('type=signup') ||
        h.includes('type=recovery');

      if (hasAuthParams) {
        const target = h.includes('type=recovery') ? '/reset-password' : '/auth/callback';
        navigate(`${target}${s}${h}`, { replace: true });
      }
    }
  }, [isRecoverySession, location.pathname, location.search, location.hash, navigate]);

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0]">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Auth Routes (redirect to /dashboard if already authenticated) */}
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <LoginPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicAuthRoute>
              <SignupPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicAuthRoute>
              <ForgotPasswordPage />
            </PublicAuthRoute>
          }
        />

        {/* Protected Routes (require authenticated session) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <ResumeBuilderView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <ProtectedRoute>
              <ResumeBuilderView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
