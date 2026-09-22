import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <footer className="w-full bg-[#0b0f19]/80 backdrop-blur-2xl border-t border-white/[0.08] text-slate-300 py-3.5 px-4 z-20 font-mono text-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-center text-center space-x-2">
        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <p className="text-slate-300 text-[11px] sm:text-xs">
          <span className="font-semibold text-white">Notice:</span> AI-generated research for informational purposes only. Not financial advice.
        </p>
      </div>
    </footer>
  );
};
