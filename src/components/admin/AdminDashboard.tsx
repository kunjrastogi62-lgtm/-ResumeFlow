import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  FileText,
  Sparkles,
  LayoutTemplate,
  Search,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Database,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Sliders,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile, ResumeRecord, TemplateDefinition } from '../../types/resume';
import {
  AiUsageRecord,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettings,
  saveSiteSettingsAdmin,
  fetchAllProfilesAdmin,
  updateProfileAdmin,
  fetchAllTemplatesAdmin,
  createTemplateAdmin,
  updateTemplateAdmin,
  toggleTemplateActiveAdmin,
  seedDefaultTemplatesAdmin,
  deleteTemplateAdmin,
  fetchRecentResumesAdmin,
  updateResumeAdmin,
  deleteResumeAdmin,
  fetchAllAiUsageAdmin,
} from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ResumeFlowLogo } from '../common/ResumeFlowLogo';

const TEMPLATE_OPTIONS = [
  'professional-classic',
  'modern-minimalist',
  'executive-slate',
  'tech-monochrome',
  'creative-accent',
];

export const AdminDashboard: React.FC = () => {
  const { user, profile, signOut, setConfigModalOpen } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'templates' | 'resumes' | 'site' | 'activity'>('users');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsageRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rlsWarning, setRlsWarning] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // User inline edit
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin'>('user');
  const [savingUser, setSavingUser] = useState(false);

  // Add/edit template
  const [newTplName, setNewTplName] = useState('');
  const [newTplDesc, setNewTplDesc] = useState('');
  const [addingTpl, setAddingTpl] = useState(false);
  const [seedingTpl, setSeedingTpl] = useState(false);
  const [editingTplId, setEditingTplId] = useState<string | null>(null);
  const [editTplName, setEditTplName] = useState('');
  const [editTplDesc, setEditTplDesc] = useState('');

  // Resume inline edit
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editResumeTitle, setEditResumeTitle] = useState('');
  const [editResumeTpl, setEditResumeTpl] = useState('professional-classic');

  // Site settings save
  const [savingSite, setSavingSite] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setRlsWarning(null);
    try {
      const [profRes, tplRes, resRes, aiRes, siteCfg] = await Promise.all([
        fetchAllProfilesAdmin(),
        fetchAllTemplatesAdmin(),
        fetchRecentResumesAdmin(),
        fetchAllAiUsageAdmin(),
        fetchSiteSettings(),
      ]);

      const firstErr = profRes.error || tplRes.error || resRes.error || aiRes.error;
      if (firstErr) {
        const msg = String(firstErr.message || firstErr);
        if (
          msg.toLowerCase().includes('policy') ||
          msg.toLowerCase().includes('permission') ||
          msg.toLowerCase().includes('column') ||
          msg.toLowerCase().includes('does not exist')
        ) {
          setRlsWarning(
            'Your Supabase database still needs the updated Admin SQL (adds profiles.role, site_settings, and Admin RLS policies). Click "View SQL Setup" to run it in Supabase SQL Editor.'
          );
        } else {
          setFeedback({ type: 'error', text: msg });
        }
      }

      setProfiles(profRes.data || []);
      setTemplates(tplRes.data || []);
      setResumes(resRes.data || []);
      setAiUsage(aiRes.data || []);
      setSiteSettings(siteCfg);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load admin console data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const startEditUser = (target: UserProfile) => {
    setEditingUserId(target.id);
    setEditUserName(target.full_name || '');
    setEditUserRole(target.role === 'admin' ? 'admin' : 'user');
  };

  const handleSaveUser = async (target: UserProfile) => {
    if (target.id === user?.id && editUserRole === 'user') {
      setFeedback({ type: 'error', text: 'You cannot remove your own active admin role.' });
      return;
    }

    setSavingUser(true);
    const { data, error } = await updateProfileAdmin(target.id, {
      full_name: editUserName.trim(),
      role: editUserRole,
    });
    setSavingUser(false);

    if (error) {
      setFeedback({
        type: 'error',
        text: `${error.message || 'Failed to update user.'} (Ensure the Admin SQL has been run in Supabase SQL Editor.)`,
      });
      return;
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? {
              ...p,
              full_name: data?.full_name ?? editUserName.trim(),
              role: data?.role ?? editUserRole,
            }
          : p
      )
    );
    setEditingUserId(null);
    setFeedback({
      type: 'success',
      text: `Saved changes for ${target.email || editUserName || 'user'}.`,
    });
  };

  const handleQuickToggleRole = async (target: UserProfile) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    if (target.id === user?.id && nextRole === 'user') {
      setFeedback({ type: 'error', text: 'You cannot remove your own active admin role.' });
      return;
    }
    const { data, error } = await updateProfileAdmin(target.id, { role: nextRole });
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to update role.' });
      return;
    }
    setProfiles((prev) =>
      prev.map((p) => (p.id === target.id ? { ...p, role: data?.role || nextRole } : p))
    );
    setFeedback({
      type: 'success',
      text: `Updated ${target.email || target.full_name || 'user'} to ${nextRole}.`,
    });
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim()) return;
    setAddingTpl(true);
    setFeedback(null);

    const { data, error } = await createTemplateAdmin({
      name: newTplName,
      description: newTplDesc || 'ATS-ready resume layout.',
      is_active: true,
    });
    setAddingTpl(false);

    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to create template.' });
      return;
    }

    if (data) setTemplates((prev) => [...prev, data]);
    setNewTplName('');
    setNewTplDesc('');
    setFeedback({ type: 'success', text: 'Template created in Supabase.' });
  };

  const handleSeedDefaults = async () => {
    setSeedingTpl(true);
    setFeedback(null);
    const { data, error } = await seedDefaultTemplatesAdmin();
    setSeedingTpl(false);
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to seed templates.' });
      return;
    }
    setTemplates((prev) => [...prev, ...data]);
    setFeedback({ type: 'success', text: `Added ${data.length} default templates to Supabase.` });
  };

  const handleSaveTemplateEdit = async (tplId: string) => {
    if (!editTplName.trim()) return;
    const { data, error } = await updateTemplateAdmin(tplId, {
      name: editTplName.trim(),
      description: editTplDesc.trim(),
    });
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to update template.' });
      return;
    }
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === tplId
          ? {
              ...t,
              name: data?.name ?? editTplName.trim(),
              description: data?.description ?? editTplDesc.trim(),
            }
          : t
      )
    );
    setEditingTplId(null);
    setFeedback({ type: 'success', text: 'Template changes saved.' });
  };

  const handleToggleTemplate = async (tpl: TemplateDefinition) => {
    const nextState = !(tpl.is_active ?? true);
    const { error } = await toggleTemplateActiveAdmin(tpl.id, nextState);
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to update template.' });
      return;
    }
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, is_active: nextState } : t))
    );
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await deleteTemplateAdmin(id);
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to delete template.' });
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setFeedback({ type: 'success', text: 'Template deleted.' });
  };

  const handleSaveResumeEdit = async (resumeId: string) => {
    if (!editResumeTitle.trim()) return;
    const { data, error } = await updateResumeAdmin(resumeId, {
      title: editResumeTitle.trim(),
      template: editResumeTpl,
    });
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to update resume.' });
      return;
    }
    setResumes((prev) =>
      prev.map((r) =>
        r.id === resumeId
          ? {
              ...r,
              title: data?.title ?? editResumeTitle.trim(),
              template: data?.template ?? editResumeTpl,
            }
          : r
      )
    );
    setEditingResumeId(null);
    setFeedback({ type: 'success', text: 'Resume updated.' });
  };

  const handleDeleteResume = async (resumeId: string) => {
    const { error } = await deleteResumeAdmin(resumeId);
    if (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to delete resume.' });
      return;
    }
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    setFeedback({ type: 'success', text: 'Resume deleted.' });
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSite(true);
    setFeedback(null);
    const { savedToDb, error } = await saveSiteSettingsAdmin(siteSettings);
    setSavingSite(false);

    if (savedToDb) {
      setFeedback({ type: 'success', text: 'Site changes saved to Supabase and applied live.' });
    } else if (error) {
      setFeedback({
        type: 'success',
        text: 'Site changes applied locally in this browser. Run the updated SQL Schema to sync site_settings across all users.',
      });
    } else {
      setFeedback({ type: 'success', text: 'Site changes saved.' });
    }
  };

  const quickAdminSql = `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR LOWER(COALESCE(email, '')) IN ('noreply@resume-flow-eight.vercel.app', 'kunjrastogi62@gmail.com'))
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
UPDATE public.profiles SET role = 'admin' WHERE LOWER(COALESCE(email, '')) IN ('noreply@resume-flow-eight.vercel.app', 'kunjrastogi62@gmail.com');`;

  const handleCopyQuickSql = () => {
    navigator.clipboard.writeText(quickAdminSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        (p.email || '').toLowerCase().includes(q) ||
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.role || 'user').toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  const filteredResumes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.template.toLowerCase().includes(q)
    );
  }, [resumes, searchQuery]);

  const profileEmailById = useMemo(() => {
    const map = new Map<string, string>();
    profiles.forEach((p) => {
      if (p.id) map.set(p.id, p.email || p.full_name || p.id.slice(0, 8));
    });
    return map;
  }, [profiles]);

  const aiFeatureCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    aiUsage.forEach((item) => {
      counts[item.feature] = (counts[item.feature] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [aiUsage]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0]">
      {/* Header */}
      <header className="border-b border-[#181c28] bg-[#0e1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:opacity-90 transition">
              <ResumeFlowLogo size="sm" />
            </Link>
            <span className="text-neutral-700 hidden sm:inline">/</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-neutral-400 hover:text-rose-300 rounded-lg hover:bg-[#141724] transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Control Panel</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Signed in as <span className="text-indigo-300 font-medium">{profile?.email || user?.email}</span> • Edit users, templates, resumes, and live site settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuickSql}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-[#141724] hover:bg-[#1a1f31] text-neutral-200 border border-[#232736] flex items-center gap-1.5 transition"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copiedSql ? 'Copied Admin SQL' : 'Copy Admin SQL'}</span>
            </button>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#141724] hover:bg-[#1a1f31] text-neutral-200 border border-[#232736] flex items-center gap-2 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full SQL Schema</span>
            </button>
          </div>
        </div>

        {rlsWarning && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 max-w-3xl">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{rlsWarning}</span>
            </div>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold transition shrink-0"
            >
              View SQL Setup
            </button>
          </div>
        )}

        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white ml-2">
              ×
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Registered Users', value: profiles.length, icon: Users, color: 'text-indigo-400' },
            { label: 'Saved Resumes', value: resumes.length, icon: FileText, color: 'text-emerald-400' },
            {
              label: 'Active Templates',
              value: templates.filter((t) => t.is_active !== false).length,
              icon: LayoutTemplate,
              color: 'text-violet-400',
            },
            { label: 'AI Actions Logged', value: aiUsage.length, icon: Sparkles, color: 'text-sky-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#101219] border border-[#1f2433] rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] text-neutral-400 font-medium">{stat.label}</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {loading ? '—' : stat.value}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#161925] border border-[#232736]">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-[#1c202e] overflow-x-auto">
          {[
            { id: 'users' as const, label: 'Users & Roles', icon: Users },
            { id: 'templates' as const, label: 'Templates', icon: LayoutTemplate },
            { id: 'resumes' as const, label: 'Resumes', icon: FileText },
            { id: 'site' as const, label: 'Site Changes', icon: Sliders },
            { id: 'activity' as const, label: 'AI Activity', icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-xs text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading platform data from Supabase...</span>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by email, name, or role..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#101219] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-[#101219] border border-[#1f2433] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0d0f17] border-b border-[#1f2433] text-neutral-400">
                    <tr>
                      <th className="py-3 px-4 font-medium">Full Name</th>
                      <th className="py-3 px-4 font-medium">Email</th>
                      <th className="py-3 px-4 font-medium">Role</th>
                      <th className="py-3 px-4 font-medium">Joined</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181c28]">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-neutral-500">
                          No user profiles found.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((p) => {
                        const role = p.role === 'admin' ? 'admin' : 'user';
                        const isEditing = editingUserId === p.id;
                        return (
                          <tr key={p.id} className="hover:bg-[#141724]/60 transition">
                            <td className="py-3 px-4 font-medium text-white">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editUserName}
                                  onChange={(e) => setEditUserName(e.target.value)}
                                  className="px-2.5 py-1 text-xs bg-[#090b10] border border-indigo-500/60 rounded text-white focus:outline-none w-44"
                                />
                              ) : (
                                p.full_name || 'Unnamed User'
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-300">{p.email || '—'}</td>
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <select
                                  value={editUserRole}
                                  onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin')}
                                  className="px-2 py-1 text-xs bg-[#090b10] border border-indigo-500/60 rounded text-white focus:outline-none"
                                >
                                  <option value="user">user</option>
                                  <option value="admin">admin</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md border ${
                                    role === 'admin'
                                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                      : 'bg-neutral-800/70 text-neutral-400 border-neutral-700'
                                  }`}
                                >
                                  {role}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-500">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isEditing ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleSaveUser(p)}
                                    disabled={savingUser}
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1 transition"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    className="p-1 text-neutral-400 hover:text-white rounded-md bg-[#161925]"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => startEditUser(p)}
                                    className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#161925] hover:bg-[#1e2334] text-neutral-200 border border-[#252b3d] inline-flex items-center gap-1 transition"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickToggleRole(p)}
                                    className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#161925] hover:bg-[#1e2334] text-neutral-200 border border-[#252b3d] transition"
                                  >
                                    {role === 'admin' ? 'Set User' : 'Make Admin'}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'templates' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <form
                onSubmit={handleAddTemplate}
                className="bg-[#101219] border border-[#1f2433] rounded-xl p-5 space-y-3.5"
              >
                <h2 className="text-sm font-semibold text-white">Add Resume Template</h2>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTplName}
                    onChange={(e) => setNewTplName(e.target.value)}
                    placeholder="e.g. Executive Minimal"
                    className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newTplDesc}
                    onChange={(e) => setNewTplDesc(e.target.value)}
                    placeholder="Clean typography designed for senior roles..."
                    className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingTpl}
                  className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-1.5 transition"
                >
                  {addingTpl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Template</span>
                </button>
              </form>

              {templates.length === 0 && (
                <div className="bg-[#101219] border border-[#1f2433] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-semibold text-white">Seed Default Templates</div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Your Supabase `templates` table is currently empty. Seed all 5 built-in ResumeFlow templates in one click.
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedDefaults}
                    disabled={seedingTpl}
                    className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-[#161925] hover:bg-[#1e2334] text-indigo-300 border border-[#252b3d] flex items-center justify-center gap-1.5 transition"
                  >
                    {seedingTpl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>Seed 5 Default Templates</span>
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-[#101219] border border-[#1f2433] rounded-xl divide-y divide-[#181c28]">
              {templates.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No templates found in Supabase yet. Click "Seed 5 Default Templates" or create one on the left.
                </div>
              ) : (
                templates.map((tpl) => {
                  const active = tpl.is_active !== false;
                  const isEditing = editingTplId === tpl.id;
                  return (
                    <div key={tpl.id} className="p-4 flex items-start justify-between gap-4">
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editTplName}
                            onChange={(e) => setEditTplName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#090b10] border border-indigo-500/60 rounded text-white"
                          />
                          <textarea
                            rows={2}
                            value={editTplDesc}
                            onChange={(e) => setEditTplDesc(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-[#090b10] border border-[#232736] rounded text-white resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveTemplateEdit(tpl.id)}
                              className="px-3 py-1 text-[11px] font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingTplId(null)}
                              className="px-3 py-1 text-[11px] rounded bg-[#161925] text-neutral-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{tpl.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                active
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                              }`}
                            >
                              {active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                            {tpl.description}
                          </p>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingTplId(tpl.id);
                              setEditTplName(tpl.name);
                              setEditTplDesc(tpl.description || '');
                            }}
                            className="p-2 rounded-lg bg-[#161925] hover:bg-[#1e2334] text-neutral-300 border border-[#252b3d] transition"
                            title="Edit template"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleTemplate(tpl)}
                            className="p-2 rounded-lg bg-[#161925] hover:bg-[#1e2334] text-neutral-300 border border-[#252b3d] transition"
                            title={active ? 'Hide template' : 'Activate template'}
                          >
                            {active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="p-2 rounded-lg bg-[#161925] hover:bg-rose-500/15 text-neutral-400 hover:text-rose-300 border border-[#252b3d] transition"
                            title="Delete template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'resumes' ? (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes by title or template..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#101219] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-[#101219] border border-[#1f2433] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0d0f17] border-b border-[#1f2433] text-neutral-400">
                    <tr>
                      <th className="py-3 px-4 font-medium">Resume Title</th>
                      <th className="py-3 px-4 font-medium">Owner</th>
                      <th className="py-3 px-4 font-medium">Template</th>
                      <th className="py-3 px-4 font-medium">Updated</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181c28]">
                    {filteredResumes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-neutral-500">
                          No resumes found.
                        </td>
                      </tr>
                    ) : (
                      filteredResumes.map((r) => {
                        const isEditing = editingResumeId === r.id;
                        return (
                          <tr key={r.id} className="hover:bg-[#141724]/60 transition">
                            <td className="py-3 px-4 font-medium text-white">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editResumeTitle}
                                  onChange={(e) => setEditResumeTitle(e.target.value)}
                                  className="px-2.5 py-1 text-xs bg-[#090b10] border border-indigo-500/60 rounded text-white w-48"
                                />
                              ) : (
                                r.title
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-400">
                              {profileEmailById.get(r.user_id) || r.user_id.slice(0, 8)}
                            </td>
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <select
                                  value={editResumeTpl}
                                  onChange={(e) => setEditResumeTpl(e.target.value)}
                                  className="px-2 py-1 text-xs bg-[#090b10] border border-indigo-500/60 rounded text-white"
                                >
                                  {TEMPLATE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-neutral-300">{r.template}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-500">
                              {new Date(r.updated_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isEditing ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleSaveResumeEdit(r.id)}
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingResumeId(null)}
                                    className="p-1 text-neutral-400 hover:text-white rounded bg-[#161925]"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <Link
                                    to={`/builder/${r.id}`}
                                    className="p-1.5 rounded bg-[#161925] hover:bg-[#1e2334] text-neutral-300 border border-[#252b3d]"
                                    title="Open in Builder"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setEditingResumeId(r.id);
                                      setEditResumeTitle(r.title);
                                      setEditResumeTpl(r.template || 'professional-classic');
                                    }}
                                    className="p-1.5 rounded bg-[#161925] hover:bg-[#1e2334] text-neutral-300 border border-[#252b3d]"
                                    title="Edit resume metadata"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResume(r.id)}
                                    className="p-1.5 rounded bg-[#161925] hover:bg-rose-500/15 text-neutral-400 hover:text-rose-300 border border-[#252b3d]"
                                    title="Delete resume"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'site' ? (
          <form
            onSubmit={handleSaveSiteSettings}
            className="max-w-3xl bg-[#101219] border border-[#1f2433] rounded-xl p-6 space-y-5"
          >
            <div>
              <h2 className="text-sm font-semibold text-white">Live Website Changes</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Customize landing page copy, top announcement bar, support contact, and registration controls.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090b10] border border-[#1f2433] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Top Announcement Banner</div>
                  <div className="text-[11px] text-neutral-400">Display a highlighted notice bar at the top of the Landing Page</div>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={siteSettings.announcementEnabled}
                    onChange={(e) =>
                      setSiteSettings((s) => ({ ...s, announcementEnabled: e.target.checked }))
                    }
                    className="rounded border-[#232736] bg-[#101219] text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-neutral-300">{siteSettings.announcementEnabled ? 'Enabled' : 'Hidden'}</span>
                </label>
              </div>
              <input
                type="text"
                value={siteSettings.announcementText}
                onChange={(e) =>
                  setSiteSettings((s) => ({ ...s, announcementText: e.target.value }))
                }
                placeholder="Announcement message..."
                className="w-full px-3 py-2 text-xs bg-[#101219] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Hero Badge / Tagline
                </label>
                <input
                  type="text"
                  value={siteSettings.heroBadgeText}
                  onChange={(e) =>
                    setSiteSettings((s) => ({ ...s, heroBadgeText: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Support Email (Footer Contact Modal)
                </label>
                <input
                  type="email"
                  value={siteSettings.supportEmail}
                  onChange={(e) =>
                    setSiteSettings((s) => ({ ...s, supportEmail: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Hero Heading
              </label>
              <input
                type="text"
                value={siteSettings.heroTitle}
                onChange={(e) =>
                  setSiteSettings((s) => ({ ...s, heroTitle: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Hero Subheading
              </label>
              <textarea
                rows={2}
                value={siteSettings.heroTagline}
                onChange={(e) =>
                  setSiteSettings((s) => ({ ...s, heroTagline: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#090b10] border border-[#1f2433] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Allow New User Signups</div>
                <div className="text-[11px] text-neutral-400">Turn off to temporarily pause new account registrations</div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={siteSettings.allowSignups}
                  onChange={(e) =>
                    setSiteSettings((s) => ({ ...s, allowSignups: e.target.checked }))
                  }
                  className="rounded border-[#232736] bg-[#101219] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-neutral-300">{siteSettings.allowSignups ? 'Open' : 'Paused'}</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSiteSettings(DEFAULT_SITE_SETTINGS)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#161925] hover:bg-[#1e2334] text-neutral-300 border border-[#252b3d] transition"
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                disabled={savingSite}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2 transition"
              >
                {savingSite ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Site Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {aiFeatureCounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {aiFeatureCounts.map(([feature, count]) => (
                  <div
                    key={feature}
                    className="px-3 py-1.5 rounded-lg bg-[#101219] border border-[#1f2433] text-xs flex items-center gap-2"
                  >
                    <span className="text-indigo-300 font-medium">{feature}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#161925] text-white font-semibold text-[11px]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#101219] border border-[#1f2433] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1f2433] bg-[#0d0f17] text-xs font-semibold text-white">
                Recent AI Generations ({aiUsage.length})
              </div>
              <div className="divide-y divide-[#181c28] max-h-[460px] overflow-y-auto">
                {aiUsage.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">No AI usage events yet.</div>
                ) : (
                  aiUsage.map((ev) => (
                    <div key={ev.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-medium text-indigo-300">{ev.feature}</div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {profileEmailById.get(ev.user_id) || ev.user_id.slice(0, 8)}
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-500 shrink-0">
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
