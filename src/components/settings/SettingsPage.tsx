import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Sparkles,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  LayoutDashboard,
  ArrowLeft,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, formatAuthError } from '../../context/AuthContext';
import {
  updateProfile,
  uploadAvatarToStorage,
  fetchAiUsageHistory,
  AiUsageRecord,
} from '../../lib/supabase';
import { ResumeFlowLogo } from '../common/ResumeFlowLogo';

export const SettingsPage: React.FC = () => {
  const { user, profile, isAdmin, refreshProfile, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || (user?.user_metadata?.full_name as string) || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [aiUsage, setAiUsage] = useState<AiUsageRecord[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setLoadingUsage(true);
    fetchAiUsageHistory(user.id)
      .then((rows) => setAiUsage(rows))
      .finally(() => setLoadingUsage(false));
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const { error } = await updateProfile(user.id, {
        full_name: fullName.trim(),
        email: user.email || undefined,
        avatar_url: avatarUrl.trim(),
      });
      if (error) throw error;
      await refreshProfile();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    setProfileMsg(null);
    try {
      const { url, error } = await uploadAvatarToStorage(user.id, file);
      if (error || !url) {
        throw new Error(error?.message || 'Storage upload failed. Ensure the public "avatars" bucket exists in Supabase Storage.');
      }
      setAvatarUrl(url);
      await updateProfile(user.id, { avatar_url: url, full_name: fullName.trim() });
      await refreshProfile();
      setProfileMsg({ type: 'success', text: 'Avatar uploaded and saved to profile.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw new Error(formatAuthError(error));
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const formatFeatureName = (feature: string) => {
    const map: Record<string, string> = {
      'enhance-bullet': 'Bullet Point Enhancer',
      'generate-summary': 'Summary Generator',
      'ats-review': 'ATS Audit & Score',
      'tailor-resume': 'Job Description Tailor',
      'suggest-skills': 'Skill Recommendations',
      'cover-letter': 'Cover Letter Generator',
    };
    return map[feature] || feature;
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e8f0]">
      <header className="sticky top-0 z-30 border-b border-white/12 bg-[#0a0d1a]/78 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hover:opacity-90 transition">
              <ResumeFlowLogo size="sm" />
            </Link>
            <span className="text-neutral-700">/</span>
            <span className="text-xs font-medium text-neutral-300">Account Settings</span>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin</span>
              </Link>
            )}
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-300 bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#0b0f1e]/82 backdrop-blur-xl border border-white/12 shadow-xl">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Settings & Profile</h1>
            <p className="text-xs text-neutral-300 mt-1">
              Manage your Supabase profile, authentication security, and Gemini AI activity.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to resumes</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 columns: Profile & Security */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <section className="p-6 bg-[#0d111e]/88 backdrop-blur-xl border border-white/12 rounded-2xl space-y-5 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-[#1b1f2d] pb-4">
                <User className="w-4 h-4 text-indigo-400" />
                <div>
                  <h2 className="text-sm font-semibold text-white">Profile Information</h2>
                  <p className="text-[11px] text-neutral-400">Stored in your PostgreSQL profiles table</p>
                </div>
              </div>

              {profileMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#181c29] border border-[#262c40] overflow-hidden flex items-center justify-center text-indigo-400 font-bold text-lg shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (fullName || user?.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#161925] hover:bg-[#1d2233] text-neutral-200 border border-[#252b3d] cursor-pointer transition">
                      {uploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-neutral-500">Uses Supabase Storage (avatars bucket) or paste an image URL below.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3 py-2 text-xs bg-[#090b10]/60 border border-[#1d2130] rounded-lg text-neutral-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Avatar URL (Optional)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5 transition"
                  >
                    {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Password Card */}
            <section className="p-6 bg-[#0d111e]/88 backdrop-blur-xl border border-white/12 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-[#1b1f2d] pb-4">
                <Lock className="w-4 h-4 text-violet-400" />
                <div>
                  <h2 className="text-sm font-semibold text-white">Password & Security</h2>
                  <p className="text-[11px] text-neutral-400">Update your account password</p>
                </div>
              </div>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    minLength={6}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    minLength={6}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#161925] hover:bg-[#1f2436] text-white border border-[#262c40] disabled:opacity-50 flex items-center gap-1.5 transition"
                  >
                    {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right column: AI Usage */}
          <div className="space-y-6">
            <section className="p-5 bg-[#0d111e]/88 backdrop-blur-xl border border-white/12 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Recent AI Usage</h2>
              </div>

              {loadingUsage ? (
                <div className="py-6 text-center">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 mx-auto" />
                </div>
              ) : aiUsage.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">
                  No AI optimizations logged yet. Try enhancing a bullet or running an ATS audit in the builder.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {aiUsage.map((row) => (
                    <div
                      key={row.id}
                      className="p-2.5 bg-[#090b10] border border-[#1d2130] rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="text-neutral-200 font-medium">{formatFeatureName(row.feature)}</span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(row.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
