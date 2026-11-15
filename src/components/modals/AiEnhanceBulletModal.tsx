import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { enhanceBulletPoint, EnhanceBulletResult } from '../../lib/ai-service';
import { useAuth } from '../../context/AuthContext';

interface AiEnhanceBulletModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalBullet: string;
  roleContext?: string;
  onApply: (newBullet: string) => void;
}

export const AiEnhanceBulletModal: React.FC<AiEnhanceBulletModalProps> = ({
  isOpen,
  onClose,
  originalBullet,
  roleContext = '',
  onApply,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(roleContext);
  const [result, setResult] = useState<EnhanceBulletResult | null>(null);
  const [selectedBullet, setSelectedBullet] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!originalBullet.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await enhanceBulletPoint({
        bullet: originalBullet,
        role: role.trim() || undefined,
        userId: user?.id,
      });
      setResult(data);
      setSelectedBullet(data.enhanced);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance bullet point');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedBullet) {
      onApply(selectedBullet);
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
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Bullet Point Enhancer</h2>
              <p className="text-xs text-neutral-400">Transform weak duties into high-impact Google XYZ metrics</p>
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
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Original Bullet Point</label>
            <div className="p-3 bg-[#0a0c12] border border-[#232736] rounded-lg text-xs text-neutral-300 font-mono">
              {originalBullet || 'No bullet text provided.'}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-400 mb-1">Target Role Context (Optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Product Manager"
                className="w-full px-3 py-2 text-xs bg-[#0a0c12] border border-[#232736] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="self-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !originalBullet.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {result ? 'Regenerate' : 'Enhance with Gemini'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Coach Rationale: {result.rationale}</span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-400">Select Best Version to Apply:</label>

                {/* Primary recommendation */}
                <div
                  onClick={() => setSelectedBullet(result.enhanced)}
                  className={`p-3 rounded-lg border cursor-pointer transition text-xs relative ${
                    selectedBullet === result.enhanced
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-[#232736] bg-[#0d0f17] text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{result.enhanced}</span>
                    {selectedBullet === result.enhanced && (
                      <span className="shrink-0 p-1 bg-indigo-500 text-white rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Recommended (Highest ATS Impact)
                  </span>
                </div>

                {/* Variations */}
                {result.variations.map((v, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedBullet(v)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                      selectedBullet === v
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-[#232736] bg-[#0d0f17] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span>{v}</span>
                      {selectedBullet === v && (
                        <span className="shrink-0 p-1 bg-indigo-500 text-white rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#232736] bg-[#161922]">
          <span className="text-[11px] text-neutral-500">Google Gemini 3.8 Flash model</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedBullet}
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
