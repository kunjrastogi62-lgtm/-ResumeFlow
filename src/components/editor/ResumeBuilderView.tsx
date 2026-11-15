import React, { useState, useEffect } from 'react';
import {
  ResumeData,
  ResumeRecord,
  INITIAL_RESUME,
} from '../../types/resume';
import { ResumeEditorForm } from './ResumeEditorForm';
import { ResumeRenderer } from '../templates/ResumeRenderer';
import { saveResumeToDb } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Save,
  Download,
  Share2,
  Sparkles,
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
  Database,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResumeBuilderViewProps {
  initialRecord?: ResumeRecord | null;
  onResumeDataChange?: (updated: ResumeData) => void;
  onBackToDashboard: () => void;
  onOpenATSModal: () => void;
  onOpenTailorModal: () => void;
  onOpenCoverLetterModal: () => void;
  onOpenSummaryModal: () => void;
  onOpenBulletModal: (bullet: string, roleContext: string, onApply: (newBullet: string) => void) => void;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  initialRecord,
  onResumeDataChange,
  onBackToDashboard,
  onOpenATSModal,
  onOpenTailorModal,
  onOpenCoverLetterModal,
  onOpenSummaryModal,
  onOpenBulletModal,
}) => {
  const { user, setAuthModalOpen, setAuthModalTab } = useAuth();
  const [currentId, setCurrentId] = useState<string | undefined>(initialRecord?.id);
  const [title, setTitle] = useState(initialRecord?.title || 'Untitled Professional Resume');
  const [template, setTemplate] = useState(initialRecord?.template || 'professional-classic');
  const [resumeData, setResumeData] = useState<ResumeData>(initialRecord?.resume_data || INITIAL_RESUME);
  const [zoom, setZoom] = useState(0.85);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync when initialRecord changes
  useEffect(() => {
    if (initialRecord) {
      setCurrentId(initialRecord.id);
      setTitle(initialRecord.title);
      setTemplate(initialRecord.template);
      setResumeData(initialRecord.resume_data || INITIAL_RESUME);
      setHasUnsavedChanges(false);
    }
  }, [initialRecord]);

  // Handle Save
  const handleSave = async () => {
    // 1. Validate the resume data
    if (!title.trim()) {
      setSaveToast({ show: true, msg: 'Resume title cannot be empty.', type: 'error' });
      return;
    }
    if (!resumeData.basics.name.trim()) {
      setSaveToast({ show: true, msg: 'Candidate name is required.', type: 'error' });
      return;
    }

    // 2. Verify the authenticated Supabase session
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      // 3. Save title, template, and resume_data to the resumes table with auth.uid()
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
      }
      setHasUnsavedChanges(false);
      // 6. Show: "Resume saved successfully."
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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
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
          onResumeDataChange?.(parsed.resumeData);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.template) setTemplate(parsed.template);
          setHasUnsavedChanges(true);
        } else if (parsed.basics) {
          setResumeData(parsed);
          onResumeDataChange?.(parsed);
          setHasUnsavedChanges(true);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0d13] text-[#e2e8f0] overflow-hidden">
      {/* 1. Header Toolbar */}
      <header className="no-print h-14 bg-[#11131a] border-b border-[#232736] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition flex items-center gap-1.5 text-xs font-medium"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-4 w-px bg-[#232736]" />

          {/* Editable Title */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-[#232736] focus:border-indigo-500 focus:outline-none px-1.5 py-0.5 rounded max-w-[200px] sm:max-w-[280px]"
            />
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
            )}
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Template Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 hidden md:inline">Template:</span>
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="px-2.5 py-1 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="professional-classic">Professional Classic</option>
              <option value="modern-minimalist">Modern Minimalist</option>
              <option value="executive-slate">Executive Slate</option>
              <option value="tech-monochrome">Tech Monochrome</option>
              <option value="creative-accent">Creative Accent</option>
            </select>
          </div>

          {/* AI Tools Menu */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={onOpenATSModal}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ATS Score</span>
            </button>
            <button
              onClick={onOpenTailorModal}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 flex items-center gap-1.5 transition"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Tailor to Job</span>
            </button>
            <button
              onClick={onOpenCoverLetterModal}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 flex items-center gap-1.5 transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Cover Letter</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#232736] hidden sm:block" />

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save to Supabase'}</span>
            <span className="sm:hidden">Save</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1a1e2c] hover:bg-[#23283a] text-white border border-[#2e344a] flex items-center gap-1.5 transition"
            title="Download PDF via Vector Print Engine"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* Save Toast Notification */}
      {saveToast.show && (
        <div
          className={`no-print fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-medium animate-in slide-in-from-top-2 duration-200 ${
            saveToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {saveToast.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{saveToast.msg}</span>
        </div>
      )}

      {/* 2. Workspace Body: Split Form + Live Preview Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Editor Form */}
        <section className="no-print w-full md:w-[480px] lg:w-[540px] shrink-0 border-r border-[#232736] flex flex-col bg-[#11131a] overflow-hidden">
          <ResumeEditorForm
            data={resumeData}
            onChange={(updated) => {
              setResumeData(updated);
              onResumeDataChange?.(updated);
              setHasUnsavedChanges(true);
            }}
            onOpenBulletEnhancer={onOpenBulletModal}
            onOpenSummaryGenerator={onOpenSummaryModal}
          />
        </section>

        {/* Right Pane: Live Resume Canvas */}
        <section className="flex-1 flex flex-col bg-[#07080c] overflow-hidden relative">
          {/* Canvas Floating Controls */}
          <div className="no-print absolute top-3 right-4 z-20 flex items-center gap-1.5 bg-[#141724]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#232736] text-xs">
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
              title="Export Resume JSON"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <label className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer" title="Import Resume JSON">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          {/* Scrollable Canvas Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center">
            <div className="py-2">
              <ResumeRenderer data={resumeData} template={template} zoom={zoom} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
