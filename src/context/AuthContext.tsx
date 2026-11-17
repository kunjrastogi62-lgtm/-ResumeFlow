import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import {
  getSupabase,
  isSupabaseConfigured,
  fetchProfile,
  UserProfile,
  getAuthRedirectUrl,
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isRecoverySession: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | Error | null; needsEmailConfirmation?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  configModalOpen: boolean;
  setConfigModalOpen: (open: boolean) => void;
  recheckConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function formatAuthError(err: any): string {
  if (!err) return 'An unexpected authentication error occurred.';
  const msg = String(err.message || err);
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please double-check your credentials and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email address has not been verified yet. Please check your inbox or resend the verification email.';
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider')) {
    return 'Google OAuth is not enabled yet in your Supabase Authentication Providers settings.';
  }
  if (lower.includes('error sending confirmation email') || lower.includes('error sending') || lower.includes('smtp')) {
    return 'Supabase could not send the confirmation email. In Supabase Auth > SMTP Settings, do not use a @vercel.app sender address (vercel.app domains cannot be verified for SMTP). Either turn off Custom SMTP, use a verified sender/Gmail App Password, or temporarily disable "Confirm email" in Supabase Auth > Providers > Email.';
  }
  if (lower.includes('rate limit')) {
    return 'Too many requests in a short time. Please wait a moment before trying again.';
  }
  return msg;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());
  const [isRecoverySession, setIsRecoverySession] = useState<boolean>(false);

  const [configModalOpen, setConfigModalOpen] = useState(false);

  const recheckConfig = () => {
    setIsConfigured(isSupabaseConfigured());
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const data = await fetchProfile(userId);
      if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn('Could not load user profile:', e);
    }
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
      } else if (event === 'SIGNED_OUT') {
        setIsRecoverySession(false);
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase is not configured. Please verify your project credentials.') };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase is not configured. Please verify your project credentials.') };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
        },
      },
    });

    const needsEmailConfirmation = Boolean(data?.user && !data.session);
    return { error, needsEmailConfirmation };
  };

  const resendVerificationEmail = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase is not configured. Please verify your project credentials.') };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl('/auth/callback'),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase is not configured. Please verify your project credentials.') };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthRedirectUrl('/reset-password'),
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setIsRecoverySession(false);
    }
    return { error };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsRecoverySession(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        isRecoverySession,
        signInWithEmail,
        signUpWithEmail,
        resendVerificationEmail,
        signInWithGoogle,
        resetPassword,
        updatePassword,
        signOut,
        refreshProfile,
        configModalOpen,
        setConfigModalOpen,
        recheckConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
