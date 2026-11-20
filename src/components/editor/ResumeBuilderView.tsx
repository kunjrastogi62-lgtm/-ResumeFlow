import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ResumeData,
  INITIAL_RESUME,
} from '../../types/resume';
import { ResumeEditorForm } from './ResumeEditorForm';
import { ResumeRenderer } from '../templates/ResumeRenderer';
import { AiEnhanceBulletModal } from '../modals/AiEnhanceBulletModal';
import { AiAtsReviewModal } from '../modals/AiAtsReviewModal';
import { AiTailorModal } from '../modals/AiTailorModal';
import { AiCoverLetterModal } from '../modals/AiCoverLetterModal';
import { AiSummaryModal } from '../modals/AiSummaryModal';
import { fetchResumeById, saveResumeToDb } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Save,
  Download,
  ShieldCheck,
  Target,
  Mail,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  AlertCircle,
  Loader2,
  FileDown,
  Upload,
  Settings,
  Eye,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ResumeBuilderView: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const templateParam = searchParams.get('template');

  const [currentId, setCurrentId] = useState<string | undefined>(id);
  const [title, setTitle] = useState('Untitled Professional Resume');
  const [template, setTemplate] = useState(templateParam || 'professional-classic');
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [loadingResume, setLoadingResume] = useState(Boolean(id));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [zoom, setZoom] = useState(0.85);
  const [mobilePane, setMobilePane] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  // AI Modals state
  const [bulletModal, setBulletModal] = useState<{
    open: boolean;
    original: string;
    role: string;
    onApply: (b: string) => void;
  }>({
    open: false,
    original: '',
    role: '',
    onApply: () => {},
  });
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  // Load resume from Supabase PostgreSQL when route id changes
  useEffect(() => {
    let active = true;
    if (!id || !user) {
      setCurrentId(undefined);
      if (templateParam) setTemplate(templateParam);
      setLoadingResume(false);
      return;
    }

    setLoadingResume(true);
    setLoadError(null);
    fetchResumeById(id, user.id)
      .then((record) => {
        if (!active) return;
        if (!record) {
          setLoadError('Resume not found or you do not have permission to view it.');
        } else {
          setCurrentId(record.id);
          setTitle(record.title);
          setTemplate(record.template || 'professional-classic');
          setResumeData(record.resume_data || INITIAL_RESUME);
          setHasUnsavedChanges(false);
        }
      })
      .catch((err: any) => {
        if (active) setLoadError(err.message || 'Failed to load resume.');
      })
      .finally(() => {
        if (active) setLoadingResume(false);
      });

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setSaveToast({ show: true, msg: 'Resume title cannot be empty.', type: 'error' });
      return;
    }
    if (!resumeData.basics.name.trim()) {
      setSaveToast({ show: true, msg: 'Candidate name is required.', type: 'error' });
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await saveResumeToDb({
        id: currentId,
        user_id: user.id,
        title: title.trim(),
        template,
        resume_data: resumeData,
      });

      if (error) throw error;

      if (data) {
        setCurrentId(data.id);
        if (!id) {
          navigate(`/builder/${data.id}`, { replace: true });
        }
      }
      setHasUnsavedChanges(false);
      setSaveToast({ show: true, msg: 'Resume saved successfully.', type: 'success' });
      setTimeout(() => setSaveToast({ show: false, msg: '', type: 'success' }), 3500);
    } catch (err: any) {
      setSaveToast({ show: true, msg: err.message || 'Failed to save resume.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
    window.print();
  };

  const handleExportJson = () => {
    const payload = {
      title,
      template,
      resumeData,
      version: '1.0',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.resumeData) {
          setResumeData(parsed.resumeData);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.template) setTemplate(parsed.template);
          setHasUnsavedChanges(true);
        } else if (parsed.basics) {
          setResumeData(parsed);
          setHasUnsavedChanges(true);
        } else {
          setSaveToast({ show: true, msg: 'Unrecognized JSON resume format.', type: 'error' });
        }
      } catch {
        setSaveToast({ show: true, msg: 'Invalid JSON file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  if (loadingResume) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-3 text-xs text-white">
        <div className="px-6 py-5 rounded-2xl bg-[#0b0f1e]/82 backdrop-blur-xl border border-white/12 shadow-2xl flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          <span>Loading resume from Supabase PostgreSQL...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-xl bg-[#0d111e]/90 backdrop-blur-xl border border-rose-500/30 text-rose-300 text-xs max-w-md flex items-center gap-2.5 shadow-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{loadError}</span>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="print-shell flex flex-col h-screen bg-transparent text-[#e2e8f0] overflow-hidden">
      {/* Header Toolbar */}
      <header className="no-print h-14 bg-[#0a0d1a]/85 backdrop-blur-xl border-b border-white/12 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#191d2b] transition flex items-center gap-1.5 text-xs font-medium shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-[#232736] shrink-0" />

          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-[#232736] focus:border-indigo-500 focus:outline-none px-1.5 py-0.5 rounded w-32 sm:w-56 truncate"
            />
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="px-2.5 py-1 text-xs bg-[#090b10] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="professional-classic">Professional Classic</option>
              <option value="modern-minimalist">Modern Minimalist</option>
              <option value="executive-slate">Executive Slate</option>
              <option value="tech-monochrome">Tech Monochrome</option>
              <option value="creative-accent">Creative Accent</option>
            </select>
          </div>

          {/* AI Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAtsModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition"
              title="ATS Score"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ATS Score</span>
            </button>
            <button
              onClick={() => setTailorModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 flex items-center gap-1.5 transition"
              title="Tailor to Job"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Tailor to Job</span>
            </button>
            <button
              onClick={() => setCoverLetterModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 flex items-center gap-1.5 transition"
              title="Cover Letter"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Cover Letter</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#232736] hidden sm:block" />

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#181c29] hover:bg-[#212638] text-white border border-[#2a3045] flex items-center gap-1.5 transition"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PDF</span>
          </button>

          <Link
            to="/settings"
            className="hidden sm:flex p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#191d2b] transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Mobile Edit / Preview Toggle */}
      <div className="no-print md:hidden flex border-b border-[#1f2433] bg-[#0d0f17] text-xs">
        <button
          type="button"
          onClick={() => setMobilePane('edit')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition ${
            mobilePane === 'edit' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Content</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePane('preview')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition ${
            mobilePane === 'preview' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Save Toast Notification */}
      {saveToast.show && (
        <div
          className={`no-print fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-medium ${
            saveToast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
          }`}
        >
          {saveToast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{saveToast.msg}</span>
        </div>
      )}

      {/* Workspace Split Panes */}
      <div className="print-canvas flex-1 flex overflow-hidden">
        {/* Editor Form */}
        <section
          className={`no-print w-full md:w-[460px] lg:w-[520px] shrink-0 border-r border-white/12 flex-col bg-[#0d111e]/92 backdrop-blur-xl overflow-hidden ${
            mobilePane === 'edit' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ResumeEditorForm
            data={resumeData}
            onChange={(updated) => {
              setResumeData(updated);
              setHasUnsavedChanges(true);
            }}
            onOpenBulletEnhancer={(bullet, role, onApply) => {
              setBulletModal({ open: true, original: bullet, role, onApply });
            }}
            onOpenSummaryGenerator={() => setSummaryModalOpen(true)}
          />
        </section>

        {/* Live Canvas */}
        <section
          className={`print-canvas flex-1 flex-col bg-[#070b18]/55 backdrop-blur-[2px] overflow-hidden relative ${
            mobilePane === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="no-print absolute top-3 right-4 z-20 flex items-center gap-1.5 bg-[#121521]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#232736] text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.05).toFixed(2))))}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-neutral-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.05).toFixed(2))))}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-[#232736] mx-0.5" />

            <button
              onClick={handleExportJson}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
              title="Export JSON"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <label className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer" title="Import JSON">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          <div className="print-canvas flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center">
            <div className="py-2 print:py-0">
              <ResumeRenderer data={resumeData} template={template} zoom={zoom} />
            </div>
          </div>
        </section>
      </div>

      {/* AI Modals */}
      <AiEnhanceBulletModal
        isOpen={bulletModal.open}
        onClose={() => setBulletModal((prev) => ({ ...prev, open: false }))}
        originalBullet={bulletModal.original}
        roleContext={bulletModal.role}
        onApply={(newBullet) => {
          bulletModal.onApply(newBullet);
          setHasUnsavedChanges(true);
        }}
      />

      <AiAtsReviewModal
        isOpen={atsModalOpen}
        onClose={() => setAtsModalOpen(false)}
        resumeData={resumeData}
      />

      <AiTailorModal
        isOpen={tailorModalOpen}
        onClose={() => setTailorModalOpen(false)}
        resumeData={resumeData}
        onApplyBullet={(secIdx, itemIdx, suggested, originalBullet) => {
          setResumeData((prev) => {
            // Try exact text match first if originalBullet was supplied
            if (originalBullet) {
              const normOriginal = originalBullet.trim().toLowerCase();
              let matched = false;
              const matchedWork = prev.work.map((w) => ({
                ...w,
                highlights: w.highlights.map((h) => {
                  if (!matched && h.trim().toLowerCase() === normOriginal) {
                    matched = true;
                    return suggested;
                  }
                  return h;
                }),
              }));
              if (matched) {
                return { ...prev, work: matchedWork };
              }
            }

            // Fallback to valid index bounds
            const targetWorkIdx = prev.work[secIdx] ? secIdx : 0;
            return {
              ...prev,
              work: prev.work.map((w, idx) => {
                if (idx !== targetWorkIdx) return w;
                const targetBulletIdx = w.highlights[itemIdx] !== undefined ? itemIdx : 0;
                return {
                  ...w,
                  highlights: w.highlights.map((h, hIdx) => (hIdx === targetBulletIdx ? suggested : h)),
                };
              }),
            };
          });
          setHasUnsavedChanges(true);
        }}
      />

      <AiCoverLetterModal
        isOpen={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        resumeData={resumeData}
      />

      <AiSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        resumeData={resumeData}
        onApply={(summary) => {
          setResumeData((prev) => ({
            ...prev,
            basics: {
              ...prev.basics,
              summary,
            },
          }));
          setHasUnsavedChanges(true);
        }}
      />
    </div>
  );
};
