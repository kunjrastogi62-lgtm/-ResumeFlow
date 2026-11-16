import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Loader2, Copy, Check, Download } from 'lucide-react';
import { generateCoverLetter } from '../../lib/ai-service';
import { ResumeData } from '../../types/resume';
import { useAuth } from '../../context/AuthContext';

interface AiCoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export const AiCoverLetterModal: React.FC<AiCoverLetterModalProps> = ({
  isOpen,
  onClose,
  resumeData,
}) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState(resumeData.basics.label || '');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Confident, high-impact, and strategic');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRoleTitle((prev) => prev || resumeData.basics.label || '');
      setError(null);
    }
  }, [isOpen, resumeData.basics.label]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!companyName.trim() || !roleTitle.trim()) {
      setError('Please provide company name and target role title.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generateCoverLetter({
        resume: resumeData,
        companyName: companyName.trim(),
        roleTitle: roleTitle.trim(),
        jobDescription: jobDescription.trim(),
        tone,
        userId: user?.id,
      });
      setCoverLetter(data.coverLetter);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#232736] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232736] bg-[#161922]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Cover Letter Generator</h2>
              <p className="text-xs text-neutral-400">Tailored specifically to this role using your active resume</p>
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
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Linear, OpenAI"
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Role Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Staff Software Engineer"
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Writing Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Confident, high-impact, and strategic">Strategic & Impactful</option>
                <option value="Concise, direct, and technical">Concise & Technical</option>
                <option value="Executive, visionary, and leadership-focused">Executive Leadership</option>
                <option value="Warm, collaborative, and mission-driven">Warm & Mission-Driven</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Key Requirements or Notes (Optional)</label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste any specific requirements you want highlighted..."
              className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading || !companyName.trim() || !roleTitle.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {coverLetter ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {coverLetter && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-neutral-400">Generated Cover Letter</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-[#0a0c12] border border-[#232736] rounded flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-[#0a0c12] border border-[#232736] rounded flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={9}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full p-3 bg-[#0a0c12] border border-[#232736] rounded-lg text-xs text-neutral-200 leading-relaxed font-sans focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#232736] bg-[#161922]">
          <span className="text-[11px] text-neutral-500">Powered by Google Gemini AI</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
