import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2, FileText } from 'lucide-react';
import { generateSummary, SummaryVariation } from '../../lib/ai-service';
import { ResumeData } from '../../types/resume';
import { useAuth } from '../../context/AuthContext';

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onApply: (summary: string) => void;
}

export const AiSummaryModal: React.FC<AiSummaryModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  onApply,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(resumeData.basics.label || '');
  const [targetRole, setTargetRole] = useState(resumeData.basics.label || '');
  const [experienceYears, setExperienceYears] = useState('5-8 years (Senior)');
  const [summaries, setSummaries] = useState<SummaryVariation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(resumeData.basics.label || '');
      setTargetRole(resumeData.basics.label || '');
      setError(null);
    }
  }, [isOpen, resumeData.basics.label]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const skillsFlat = resumeData.skills.flatMap((s) => s.items).slice(0, 10);
      const data = await generateSummary({
        title: title || resumeData.basics.label,
        targetRole: targetRole || title,
        experienceYears,
        keySkills: skillsFlat,
        rawExperience: resumeData.basics.summary,
        userId: user?.id,
      });
      setSummaries(data.summaries);
      if (data.summaries.length > 0) {
        setSelectedText(data.summaries[0].text);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedText) {
      onApply(selectedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#232736] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232736] bg-[#161922]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Professional Summary Generator</h2>
              <p className="text-xs text-neutral-400">Craft a high-conviction executive summary that hooks recruiters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Current Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Software Architect"
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Principal Engineer"
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Experience Level</label>
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="1-2 years (Early Career)">1-2 years (Early Career)</option>
                <option value="3-5 years (Mid-Level)">3-5 years (Mid-Level)</option>
                <option value="5-8 years (Senior)">5-8 years (Senior)</option>
                <option value="8-12+ years (Staff / Principal)">8-12+ years (Staff / Principal)</option>
                <option value="12+ years (Executive / VP)">12+ years (Executive / VP)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {summaries.length > 0 ? 'Generate More' : 'Generate with Gemini'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {summaries.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-neutral-400">Choose a Persona Style:</label>
              <div className="space-y-2.5">
                {summaries.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedText(s.text)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition text-xs space-y-1.5 ${
                      selectedText === s.text
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-[#232736] bg-[#0d0f17] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[11px]">
                        {s.style}
                      </span>
                      {selectedText === s.text && (
                        <span className="p-0.5 bg-indigo-500 text-white rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#232736] bg-[#161922]">
          <span className="text-[11px] text-neutral-500">Powered by Google Gemini AI</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedText}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <span>Apply to Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
