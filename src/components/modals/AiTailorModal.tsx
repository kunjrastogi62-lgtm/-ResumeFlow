import React, { useState, useEffect } from 'react';
import { X, Target, Sparkles, Loader2, Check, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { tailorResumeToJob, TailorResult } from '../../lib/ai-service';
import { ResumeData } from '../../types/resume';
import { useAuth } from '../../context/AuthContext';

interface AiTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  onApplyBullet?: (sectionIndex: number, itemIndex: number, newBullet: string, originalBullet?: string) => void;
}

export const AiTailorModal: React.FC<AiTailorModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  onApplyBullet,
}) => {
  const { user } = useAuth();
  const [targetTitle, setTargetTitle] = useState(resumeData.basics.label || '');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedIndices, setAppliedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTargetTitle((prev) => prev || resumeData.basics.label || '');
      setError(null);
    }
  }, [isOpen, resumeData.basics.label]);

  if (!isOpen) return null;

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tailorResumeToJob({
        resume: resumeData,
        jobDescription: jobDescription.trim(),
        targetTitle: targetTitle.trim() || undefined,
        userId: user?.id,
      });
      setResult(data);
      setAppliedIndices([]);
    } catch (err: any) {
      setError(err.message || 'Failed to tailor resume');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (idx: number, b: any) => {
    if (onApplyBullet) {
      onApplyBullet(b.sectionIndex ?? 0, b.itemIndex ?? 0, b.suggested, b.original);
      setAppliedIndices((prev) => [...prev, idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#11131a] border border-[#232736] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232736] bg-[#161922]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Job Description Tailor</h2>
              <p className="text-xs text-neutral-400">Match keywords, compare candidate fit, and rewrite bullets for the role</p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Target Job Title</label>
              <input
                type="text"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer, VP of Product"
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Paste Job Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting, requirements, and responsibilities here..."
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleTailor}
                disabled={loading || !jobDescription.trim()}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {result ? 'Re-Analyze Match' : 'Run Job Tailoring'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-5 pt-3 border-t border-[#232736]">
              {/* Match Score & Analysis */}
              <div className="bg-[#0a0c12] p-4 rounded-xl border border-[#232736] flex items-center gap-5">
                <div className="text-center shrink-0 border-r border-[#232736] pr-5">
                  <div className="text-3xl font-extrabold text-sky-400">{result.matchScore}%</div>
                  <div className="text-[10px] uppercase font-semibold text-neutral-400">Match Score</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white mb-1">Recruiter Match Summary</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{result.matchAnalysis}</p>
                </div>
              </div>

              {/* Keywords Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#0a0c12] rounded-xl border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Keywords Found in Resume ({result.keywordsFound.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordsFound.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-[#0a0c12] rounded-xl border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Keywords from Posting ({result.keywordsMissing.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordsMissing.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tailoring Recommendations</h4>
                  <ul className="space-y-1 text-xs text-neutral-300 pl-4 list-disc">
                    {result.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tailored Bullets */}
              {result.tailoredBullets && result.tailoredBullets.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Targeted Bullet Rewrites
                  </h4>
                  {result.tailoredBullets.map((b, idx) => (
                    <div key={idx} className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl text-xs space-y-2">
                      <div className="text-neutral-400">
                        <span className="font-semibold text-neutral-500">Original:</span> {b.original}
                      </div>
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-200">
                        <span className="font-semibold text-sky-300">Suggested:</span> {b.suggested}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-neutral-400 italic">{b.rationale}</span>
                        {onApplyBullet && (
                          <button
                            onClick={() => handleApply(idx, b)}
                            disabled={appliedIndices.includes(idx)}
                            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                              appliedIndices.includes(idx)
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {appliedIndices.includes(idx) ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Applied</span>
                              </>
                            ) : (
                              <>
                                <span>Apply Rewrite</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#232736] bg-[#161922]">
          <span className="text-[11px] text-neutral-500">Gemini Job Match Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
