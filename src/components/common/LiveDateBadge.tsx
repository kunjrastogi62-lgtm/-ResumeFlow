import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface LiveDateBadgeProps {
  className?: string;
}

export const LiveDateBadge: React.FC<LiveDateBadgeProps> = ({ className = '' }) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      title={now.toLocaleString()}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141724]/90 border border-white/12 text-[11px] font-medium text-neutral-200 whitespace-nowrap select-none shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      <span className="tabular-nums">{dateLabel}</span>
      <span className="text-neutral-600 hidden xl:inline">•</span>
      <span className="tabular-nums text-neutral-300 hidden xl:inline">{timeLabel}</span>
    </div>
  );
};
