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
import { CinematicBackground } from './components/common/CinematicBackground';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ResumeBuilderView } from './components/editor/ResumeBuilderView';
import { SettingsPage } from './components/settings/SettingsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AuthCallbackPage,
} from './components/auth/AuthPages';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen relative flex flex-col items-center justify-center gap-3 text-xs text-white">
    <div className="px-6 py-5 rounded-2xl bg-[#0b0f1e]/82 backdrop-blur-xl border border-white/12 shadow-2xl flex flex-col items-center gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
      <span>Loading ResumeFlow...</span>
    </div>
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

// Requires authenticated admin account; redirects cleanly to normal sign-in without exposing admin details
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen relative text-[#e2e8f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d111e]/88 backdrop-blur-xl border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2.5 text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h1 className="text-base font-bold text-white">Access Restricted</h1>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Your account does not have permission to view this page.
          </p>
          <div className="flex items-center gap-2.5 pt-2">
            <Link
              to="/dashboard"
              className="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Return to Dashboard
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
    <div className="min-h-screen relative text-[#e2e8f0]">
      <CinematicBackground />
      <div className="relative z-10 min-h-screen">
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
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
      </div>

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
