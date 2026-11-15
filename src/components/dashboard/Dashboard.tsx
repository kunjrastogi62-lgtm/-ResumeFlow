import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  FileText,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Database,
  ArrowRight,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { ResumeRecord, INITIAL_RESUME } from '../../types/resume';
import {
  fetchUserResumes,
  saveResumeToDb,
  deleteResumeFromDb,
  duplicateResumeInDb,
} from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onOpenResume: (record: ResumeRecord) => void;
  onCreateNew: () => void;
  onBackToHome: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenResume,
  onCreateNew,
  onBackToHome,
}) => {
  const { user, profile, signOut, setAuthModalOpen, setAuthModalTab, setConfigModalOpen, isConfigured } = useAuth();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [renameModal, setRenameModal] = useState<{ open: boolean; resume: ResumeRecord | null; newTitle: string }>({
    open: false,
    resume: null,
    newTitle: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const list = await fetchUserResumes(user?.id || 'guest');
      // If user is logged in and has 0 resumes, create a starter resume for them in Supabase
      if (list.length === 0 && user) {
        const { data: starter } = await saveResumeToDb({
          user_id: user.id,
          title: 'My First AI Resume',
          template: 'professional-classic',
          resume_data: INITIAL_RESUME,
        });
        if (starter) {
          setResumes([starter]);
          setLoading(false);
          return;
        }
      }
      setResumes(list);
    } catch (e: any) {
      console.error('Failed to load resumes:', e);
      setFeedbackMsg({ type: 'error', text: 'Failed to load resumes from Supabase.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [user]);

  const handleCreate = async () => {
    if (!user) {
      onCreateNew();
      return;
    }

    try {
      const { data, error } = await saveResumeToDb({
        user_id: user.id,
        title: `Resume ${resumes.length + 1} (${new Date().toLocaleDateString()})`,
        template: 'professional-classic',
        resume_data: INITIAL_RESUME,
      });
      if (error) throw error;
      if (data) {
        onOpenResume(data);
      }
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Could not create resume in database.' });
    }
  };

  const handleDuplicate = async (id: string) => {
    setActiveMenuId(null);
    try {
      const { data, error } = await duplicateResumeInDb(id, user?.id || 'guest');
      if (error) throw error;
      setFeedbackMsg({ type: 'success', text: 'Resume duplicated successfully.' });
      loadResumes();
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'Failed to duplicate resume.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await deleteResumeFromDb(id, user?.id || 'guest');
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
    if (!renameModal.resume || !renameModal.newTitle.trim()) return;

    try {
      const { data, error } = await saveResumeToDb({
        id: renameModal.resume.id,
        user_id: user?.id || 'guest',
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

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e8f0]">
      {/* Top Navbar */}
      <header className="border-b border-[#1b1f2d] bg-[#0e1017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 font-bold text-white hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-base tracking-tight">ResumeFlow</span>
            </button>
            <span className="text-neutral-600 hidden sm:inline">/</span>
            <span className="text-xs font-semibold text-neutral-400 hidden sm:inline">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-[#141724] border border-[#232736] rounded-lg flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Supabase DB</span>
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-[#141724] rounded-lg border border-[#232736] text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-neutral-300 font-medium max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setAuthModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Sign In to Save
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner if not logged in or Supabase pending */}
        {!user && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="text-xs text-neutral-300">
                <span className="font-semibold text-white">Previewing Guest Mode:</span> Sign in to automatically persist and sync your resumes in Supabase PostgreSQL with Row Level Security.
              </div>
            </div>
            <button
              onClick={() => {
                setAuthModalTab('signup');
                setAuthModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Create Free Account
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-neutral-400 hover:text-white ml-2">
              ×
            </button>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Resumes</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Manage, edit, duplicate, and tailor your career resumes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes..."
                className="pl-9 pr-3 py-2 text-xs bg-[#11131a] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>

            <button
              onClick={handleCreate}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Resume</span>
            </button>
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-neutral-400">Loading your resumes from Supabase PostgreSQL...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="p-12 text-center bg-[#11131a] border border-[#232736] rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No resumes found</h3>
              <p className="text-xs text-neutral-400 mt-1">
                {searchQuery ? 'Try matching a different keyword' : 'Create your first AI-optimized resume in seconds.'}
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Resume Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="group p-5 bg-[#11131a] border border-[#232736] hover:border-indigo-500/40 rounded-2xl transition flex flex-col justify-between relative shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                          {resume.title}
                        </h3>
                        <p className="text-[11px] text-neutral-400 capitalize">
                          {resume.template.replace('-', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === resume.id ? null : resume.id)}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === resume.id && (
                        <div className="absolute right-0 top-7 w-40 bg-[#161924] border border-[#232736] rounded-xl shadow-2xl py-1 z-20 text-xs">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setRenameModal({ open: true, resume, newTitle: resume.title });
                            }}
                            className="w-full px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleDuplicate(resume.id)}
                            className="w-full px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
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

                  <div className="mt-4 p-3 bg-[#0a0c12] rounded-xl border border-[#1b1f2d] space-y-1 text-xs">
                    <div className="text-neutral-300 font-medium truncate">
                      {resume.resume_data?.basics?.name || 'Untitled Candidate'}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {resume.resume_data?.basics?.label || 'Professional Headline'}
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>Updated {new Date(resume.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1b1f2d] flex items-center justify-between">
                  <button
                    onClick={() => onOpenResume(resume)}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Open Editor</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#11131a] border border-[#232736] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Rename Resume</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                value={renameModal.newTitle}
                onChange={(e) => setRenameModal({ ...renameModal, newTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#11131a] border border-[#232736] rounded-xl p-5 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete Resume?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                This action permanently removes this resume from your Supabase database.
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
