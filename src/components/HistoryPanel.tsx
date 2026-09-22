import React from 'react';
import { History, Clock, ArrowUpRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  currentTicker?: string;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  currentTicker,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) {
    return null;
  }

  const formatTime = (ts: number) => {
    const diffMins = Math.round((Date.now() - ts) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'bg-emerald-500/12 text-emerald-800 border-emerald-500/25';
      case 'Medium':
        return 'bg-amber-500/12 text-amber-800 border-amber-500/25';
      case 'Low':
      default:
        return 'bg-white/80 text-slate-700 border-white/90';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 rounded-3xl apple-glass p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-900/[0.06] mb-3">
        <div className="flex items-center space-x-2 font-mono">
          <History className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider">
            Recent Queries
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-slate-700 border border-white/90 font-mono shadow-2xs">
            {history.length}/5
          </span>
        </div>
        <button
          onClick={onClear}
          type="button"
          className="text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          Clear Log
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {history.map((item) => {
          const isSelected = currentTicker === item.ticker;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              id={`history-card-${item.ticker}`}
              type="button"
              className={`text-left p-3 rounded-2xl transition-all flex flex-col justify-between group font-mono ${
                isSelected
                  ? 'border border-sky-400/50 bg-white/90 shadow-md ring-2 ring-sky-400/20'
                  : 'apple-glass-subtle hover:bg-white/90 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-numbers font-bold text-sm text-slate-900 group-hover:text-sky-600 flex items-center space-x-1 transition-colors">
                    <span>${item.ticker}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${getConfidenceBadge(item.confidence)}`}>
                    {item.confidence}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate font-sans font-medium" title={item.companyName}>
                  {item.companyName}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-900/[0.06] flex items-center justify-between text-[10px]">
                <span className="font-mono-numbers font-bold text-slate-900">
                  {item.currentPrice}
                </span>
                <span className="text-slate-500 flex items-center space-x-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatTime(item.timestamp)}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
