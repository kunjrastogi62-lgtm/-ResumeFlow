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
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ResumeBuilderView } from './components/editor/ResumeBuilderView';
import { SettingsPage } from './components/settings/SettingsPage';
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
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (user) {
    const target = (location.state as any)?.from || '/dashboard';
    return <Navigate to={target} replace />;
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
