import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  Loader2,
  ArrowRight,
  LogOut,
  Settings,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import { ResumeRecord, INITIAL_RESUME } from '../../types/resume';
import {
  fetchUserResumes,
  saveResumeToDb,
  deleteResumeFromDb,
  duplicateResumeInDb,
} from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ResumeFlowLogo } from '../common/ResumeFlowLogo';

export const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [renameModal, setRenameModal] = useState<{ open: boolean; resume: ResumeRecord | null; newTitle: string }>({
    open: false,
    resume: null,
    newTitle: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadResumes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await fetchUserResumes(user.id);
      setResumes(list);
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Failed to load resumes from Supabase.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [user?.id]);

  useEffect(() => {
    if (!activeMenuId) return;
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [activeMenuId]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    setFeedbackMsg(null);
    try {
      const { data, error } = await saveResumeToDb({
        user_id: user.id,
        title: `Resume ${resumes.length + 1}`,
        template: 'professional-classic',
        resume_data: INITIAL_RESUME,
      });
      if (error) throw error;
      if (data) {
        navigate(`/builder/${data.id}`);
      }
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Could not create resume in database.' });
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!user) return;
    setActiveMenuId(null);
    try {
      const { error } = await duplicateResumeInDb(id, user.id);
      if (error) throw error;
      setFeedbackMsg({ type: 'success', text: 'Resume duplicated successfully.' });
      loadResumes();
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Failed to duplicate resume.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await deleteResumeFromDb(id, user.id);
      if (error) throw error;
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirm(null);
      setFeedbackMsg({ type: 'success', text: 'Resume deleted.' });
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Failed to delete resume.' });
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !renameModal.resume || !renameModal.newTitle.trim()) return;

    try {
      const { error } = await saveResumeToDb({
        id: renameModal.resume.id,
        user_id: user.id,
        title: renameModal.newTitle.trim(),
        template: renameModal.resume.template,
        resume_data: renameModal.resume.resume_data,
      });
      if (error) throw error;
      setRenameModal({ open: false, resume: null, newTitle: '' });
      setFeedbackMsg({ type: 'success', text: 'Resume renamed successfully.' });
      loadResumes();
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Failed to rename resume.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const filteredResumes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q ? resumes.filter((r) => r.title.toLowerCase().includes(q)) : [...resumes];
    list.sort((a, b) => {
      const ta = new Date(a.updated_at).getTime();
      const tb = new Date(b.updated_at).getTime();
      return sortOrder === 'desc' ? tb - ta : ta - tb;
    });
    return list;
  }, [resumes, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0]">
      {/* Top Navbar */}
      <header className="border-b border-[#181c28] bg-[#0e1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:opacity-90 transition">
              <ResumeFlowLogo size="sm" />
            </Link>
            <span className="text-neutral-700 hidden sm:inline">/</span>
            <span className="text-xs font-medium text-neutral-400 hidden sm:inline">Dashboard</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/settings"
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {user && (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#141724] rounded-lg border border-[#232736] text-xs hover:border-[#343a52] transition"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-neutral-300 font-medium max-w-[130px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-neutral-400 hover:text-rose-300 rounded-lg hover:bg-[#141724] transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-neutral-400 hover:text-white ml-2">
              ×
            </button>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Resumes</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Manage, tailor, and export your resumes stored in Supabase PostgreSQL
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes..."
                className="pl-9 pr-3 py-2 text-xs bg-[#101219] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-60"
              />
            </div>

            <button
              type="button"
              onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-[#101219] hover:bg-[#161925] border border-[#232736] text-neutral-300 flex items-center gap-1.5 transition"
              title="Toggle sort by last updated"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Create Resume</span>
            </button>
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-neutral-400">Loading your resumes...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="p-12 text-center bg-[#101219] border border-[#1d2130] rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#161925] border border-[#23283b] text-neutral-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No resumes yet</h3>
              <p className="text-xs text-neutral-400 mt-1">
                {searchQuery ? 'No resumes match your search query.' : 'Create your first AI-optimized resume in seconds.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Resume</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="group p-5 bg-[#101219] border border-[#1d2130] hover:border-indigo-500/40 rounded-2xl transition flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
                          {resume.title}
                        </h3>
                        <p className="text-[11px] text-neutral-400 capitalize">
                          {resume.template.replace('-', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === resume.id ? null : resume.id)}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1a1e2e] transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === resume.id && (
                        <div className="absolute right-0 top-7 w-40 bg-[#151824] border border-[#232736] rounded-xl shadow-2xl py-1 z-20 text-xs">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setRenameModal({ open: true, resume, newTitle: resume.title });
                            }}
                            className="w-full px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-[#1d2233] flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(resume.id)}
                            className="w-full px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-[#1d2233] flex items-center gap-2"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                          <div className="border-t border-[#232736] my-1" />
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteConfirm(resume.id);
                            }}
                            className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#090b10] rounded-xl border border-[#181c28] space-y-1 text-xs">
                    <div className="text-neutral-200 font-medium truncate">
                      {resume.resume_data?.basics?.name || 'Untitled Candidate'}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {resume.resume_data?.basics?.label || 'Professional Headline'}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>Updated {new Date(resume.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#181c28]">
                  <button
                    onClick={() => navigate(`/builder/${resume.id}`)}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-[#161925] hover:bg-indigo-600 text-indigo-300 hover:text-white border border-[#23283b] hover:border-transparent flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Open Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rename Dialog */}
      {renameModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#101219] border border-[#232736] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Rename Resume</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                value={renameModal.newTitle}
                onChange={(e) => setRenameModal({ ...renameModal, newTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameModal({ open: false, resume: null, newTitle: '' })}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#101219] border border-[#232736] rounded-xl p-5 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete Resume?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                This permanently removes this resume from your Supabase PostgreSQL database.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
