import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Loader2, BarChart2 } from 'lucide-react';
import { reviewResumeATS, ATSReviewResult } from '../../lib/ai-service';
import { ResumeData } from '../../types/resume';
import { useAuth } from '../../context/AuthContext';

interface AiAtsReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export const AiAtsReviewModal: React.FC<AiAtsReviewModalProps> = ({
  isOpen,
  onClose,
  resumeData,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState('Technology & Software');
  const [result, setResult] = useState<ATSReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewResumeATS({
        resume: resumeData,
        targetIndustry: industry,
        userId: user?.id,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#11131a] border border-[#232736] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232736] bg-[#161922]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI ATS Resume Auditor & Score</h2>
              <p className="text-xs text-neutral-400">Scan for recruiter filters, keyword density, and formatting flaws</p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0c12] p-4 rounded-xl border border-[#232736]">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-neutral-400 mb-1">Target Industry / Domain</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#11131a] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Technology & Software">Technology & Software Engineering</option>
                <option value="Product Management & Design">Product Management & UI/UX Design</option>
                <option value="Finance & Investment Banking">Finance & Investment Banking</option>
                <option value="Marketing & Growth">Marketing, Growth & Communications</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Corporate & Operations">Operations, Supply Chain & Logistics</option>
              </select>
            </div>
            <div className="self-end">
              <button
                onClick={handleReview}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {result ? 'Re-Analyze Resume' : 'Run Deep ATS Audit'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                <BarChart2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-neutral-300">Ready to simulate an enterprise ATS parser</p>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Gemini 3.8 evaluates your bullet action verbs, quantifiable metrics, section hierarchy, and keyword density.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${getScoreColor(result.overallScore)}`}>
                  <span className="text-xs font-semibold uppercase tracking-wider">Overall ATS Score</span>
                  <div className="text-4xl font-extrabold mt-1">{result.overallScore} <span className="text-lg font-normal text-neutral-400">/ 100</span></div>
                  <span className="text-[11px] mt-1 text-neutral-400">
                    {result.overallScore >= 85 ? 'Outstanding (Top 5% candidate)' : result.overallScore >= 70 ? 'Good (Passes standard screens)' : 'Needs attention to pass filters'}
                  </span>
                </div>

                <div className="md:col-span-2 bg-[#0a0c12] p-4 rounded-xl border border-[#232736] space-y-2.5">
                  <div className="text-xs font-semibold text-neutral-300 mb-1">Sub-Category Breakdown</div>
                  {Object.entries(result.breakdown).map(([key, val]) => {
                    const label =
                      key === 'formatting' ? 'Layout & Readability' :
                      key === 'actionVerbs' ? 'Power Action Verbs' :
                      key === 'metricsAndQuantification' ? 'Quantifiable Metrics' :
                      key === 'brevityAndImpact' ? 'Brevity & Conciseness' : 'Profile Completeness';
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-neutral-400">{label}</span>
                          <span className="font-semibold text-neutral-200">{val}%</span>
                        </div>
                        <div className="w-full bg-[#1b1f2d] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              val >= 80 ? 'bg-emerald-500' : val >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0c12] p-4 rounded-xl border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0a0c12] p-4 rounded-xl border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Areas to Improve</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Fixes */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Targeted Action Plan
                </h3>
                <div className="space-y-2.5">
                  {result.actionableFixes.map((fix, idx) => (
                    <div key={idx} className="p-3.5 bg-[#0a0c12] border border-[#232736] rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold uppercase">
                          {fix.category}
                        </span>
                        <span className="text-[11px] text-neutral-500">Fix #{idx + 1}</span>
                      </div>
                      <p className="text-neutral-300"><span className="text-neutral-500 font-medium">Issue:</span> {fix.issue}</p>
                      <p className="text-emerald-400"><span className="text-neutral-400 font-medium">Recommendation:</span> {fix.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#232736] bg-[#161922]">
          <span className="text-[11px] text-neutral-500">Evaluated with Google Gemini ATS heuristics</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
