import React from 'react';

interface ResumeFlowLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTag?: boolean;
}

export const ResumeFlowLogo: React.FC<ResumeFlowLogoProps> = ({ size = 'md', showTag = false }) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${iconSize} rounded-lg bg-[#141724] border border-indigo-500/30 flex items-center justify-center shadow-sm relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4/6 h-4/6 text-indigo-400"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" className="text-violet-400" stroke="currentColor" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <span className={`${textSize} font-bold tracking-tight text-white`}>
          Resume<span className="text-indigo-400">Flow</span>
        </span>
        {showTag && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            AI
          </span>
        )}
      </div>
    </div>
  );
};
