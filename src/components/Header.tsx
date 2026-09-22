import React from 'react';
import { Crosshair, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  activeTicker?: string;
}

export const Header: React.FC<HeaderProps> = ({ onReset, activeTicker }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Terminal Identifier */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            type="button"
            className="group flex items-center space-x-2.5 text-left focus:outline-hidden"
            title="Reset to Desk Overview"
          >
            <div className="w-8 h-8 rounded-xl bg-white/80 text-sky-600 flex items-center justify-center border border-white/90 group-hover:bg-white transition-all shadow-xs">
              <Crosshair className="w-4 h-4 text-sky-600 transition-transform group-hover:rotate-45" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-slate-900 font-mono-numbers">
                Aperture
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono tracking-widest font-semibold text-slate-600 bg-slate-900/5 border border-slate-900/10">
                QUANT
              </span>
            </div>
          </button>
        </div>

        {/* Top Menu Actions: Restored 24/7 rTokens Status & Overview Reset */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 text-xs">
          {/* Restored 24/7 rTokens Active Status Indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/12 text-emerald-800 border border-emerald-500/25 text-[11px] sm:text-xs font-mono font-medium shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
            <span className="tracking-wide">24/7 rTokens Active</span>
          </div>

          {/* Quick Return to Overview */}
          {activeTicker && (
            <button
              onClick={onReset}
              type="button"
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900 border border-white/90 transition-all text-xs font-medium shadow-xs"
              title="Return to Desk Overview"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline font-mono">Overview</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
