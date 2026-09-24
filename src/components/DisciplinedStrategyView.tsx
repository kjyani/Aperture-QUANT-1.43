import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calculator,
  Compass,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  DollarSign,
  Percent,
  Layers,
  Scale
} from 'lucide-react';
import { TradeStrategy } from '../types';

interface DisciplinedStrategyViewProps {
  strategy?: TradeStrategy;
  currentPrice: string;
  currency?: string;
  ticker: string;
  tp1?: string;
  tp2?: string;
  stopLoss?: string;
}

export const DisciplinedStrategyView: React.FC<DisciplinedStrategyViewProps> = ({
  strategy,
  currentPrice,
  currency = 'USD',
  ticker,
  tp1,
  tp2,
  stopLoss,
}) => {
  // Risk calculator state
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5); // 1.5% default institutional risk

  // Parse numeric values
  const rawCurrent = parseFloat(currentPrice.replace(/[^0-9.]/g, '')) || 100;
  const rawStop = parseFloat((stopLoss || strategy?.invalidationTrigger || '').replace(/[^0-9.]/g, '')) || (rawCurrent * 0.95);
  const rawTp1 = parseFloat((tp1 || '').replace(/[^0-9.]/g, '')) || (rawCurrent * 1.06);
  const rawTp2 = parseFloat((tp2 || '').replace(/[^0-9.]/g, '')) || (rawCurrent * 1.12);

  // Position Sizing Math
  const maxDollarRisk = (accountSize * riskPercent) / 100;
  const perShareRisk = Math.abs(rawCurrent - rawStop);
  const calculatedShares = perShareRisk > 0 ? Math.floor(maxDollarRisk / perShareRisk) : 0;
  const totalPositionCost = calculatedShares * rawCurrent;
  const potentialGainTp1 = calculatedShares * Math.abs(rawTp1 - rawCurrent);
  const potentialGainTp2 = calculatedShares * Math.abs(rawTp2 - rawCurrent);
  const actualRiskReward = perShareRisk > 0 ? (Math.abs(rawTp1 - rawCurrent) / perShareRisk).toFixed(2) : '1.8';

  if (!strategy) {
    return null;
  }

  const getDirectionBadge = () => {
    switch (strategy.direction) {
      case 'LONG':
        return {
          bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25',
          icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
          label: 'DISCIPLINED LONG STANCE',
        };
      case 'SHORT':
        return {
          bg: 'bg-rose-500/10 text-rose-800 border-rose-500/25',
          icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
          label: 'DEFENSIVE / SHORT STANCE',
        };
      case 'NEUTRAL_WAIT':
      default:
        return {
          bg: 'bg-amber-500/10 text-amber-800 border-amber-500/25',
          icon: <Clock className="w-4 h-4 text-amber-600" />,
          label: 'NEUTRAL / WAIT FOR CONFIRMATION',
        };
    }
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-600 text-white shadow-xs';
      case 'A':
        return 'bg-emerald-500 text-white';
      case 'B':
        return 'bg-blue-600 text-white';
      case 'AVOID':
      default:
        return 'bg-rose-600 text-white';
    }
  };

  const dirBadge = getDirectionBadge();

  return (
    <div className="w-full rounded-3xl apple-glass p-5 sm:p-6 text-slate-900 shadow-sm border border-white/60 space-y-5">
      {/* 1. Header: Strategy Stance & Confluence Grade */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900/[0.06]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Institutional Analysis Strategy
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center space-x-1 ${dirBadge.bg}`}>
                {dirBadge.icon}
                <span>{dirBadge.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono-numbers">
              Disciplined Technical Filter to prevent false calls & FOMO traps
            </p>
          </div>
        </div>

        {/* Quality Score & Grade */}
        <div className="flex items-center space-x-2 self-start sm:self-auto font-mono text-xs">
          <div className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 font-sans">Setup Grade:</span>
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${getGradeBadge(strategy.grade)}`}>
              {strategy.grade}
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-500 font-sans">Confluence:</span>
            <span className="font-bold text-slate-900 font-mono-numbers">
              {strategy.confluenceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Anti-Trap Discipline Warning Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs leading-relaxed flex items-start space-x-3">
        <div className="mt-0.5 p-1 rounded-lg bg-amber-500/20 text-amber-800 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <strong className="font-semibold block text-amber-950 mb-0.5">
            Strategy Discipline & False-Signal Invalidation Guard
          </strong>
          <p className="text-amber-900/90 text-[11px]">
            {strategy.antiTrapWarning}
          </p>
        </div>
      </div>

      {/* 3. Five-Point Technical Confluence Checklist */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-medium uppercase tracking-wider text-[10px]">
            5-Point Algorithmic Confluence Validation
          </span>
          <span className="font-mono text-[11px]">
            Pass Requirement: High Probability Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {strategy.checklist.map((item, idx) => {
            const itemStatus = item.status || (item.passed ? 'PASS' : 'FAIL');
            const isPass = itemStatus === 'PASS';
            const isWatch = itemStatus === 'WATCH';
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs transition-all ${
                  isPass
                    ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-slate-800'
                    : isWatch
                    ? 'bg-amber-500/[0.04] border-amber-500/20 text-slate-800'
                    : 'bg-rose-500/[0.04] border-rose-500/20 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900 text-[11px]">
                    {item.criterion}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center space-x-0.5 ${
                      isPass
                        ? 'bg-emerald-500/15 text-emerald-800'
                        : isWatch
                        ? 'bg-amber-500/15 text-amber-800'
                        : 'bg-rose-500/15 text-rose-800'
                    }`}
                  >
                    {isPass ? (
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    ) : isWatch ? (
                      <Clock className="w-2.5 h-2.5" />
                    ) : (
                      <XCircle className="w-2.5 h-2.5" />
                    )}
                    <span>{itemStatus}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {item.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Execution vs Invalidation Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-emerald-800 mb-1">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] uppercase tracking-wide">Execution Trigger</span>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {strategy.executionTrigger}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-rose-800 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[11px] uppercase tracking-wide">Invalidation Trigger (Stop Out)</span>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {strategy.invalidationTrigger}
          </p>
        </div>
      </div>

      {/* 5. Useful Feature: Real-Time Position Size & Capital Risk Calculator */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold tracking-tight text-white uppercase">
              Position Sizing & Capital Preservation Calculator
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Never risk more than selected allocation per trade
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-sans block">
              Trading Account Balance ($)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-500">$</span>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(Math.max(100, Number(e.target.value) || 0))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-6 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-sans block">
              Maximum Risk Per Trade (%)
            </label>
            <div className="flex items-center space-x-1.5">
              {[1, 1.5, 2].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    riskPercent === pct
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Math.max(0.1, Number(e.target.value) || 0.1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Output Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-sans block">Max Risk (1R)</span>
            <strong className="text-rose-400 font-semibold text-sm">
              ${maxDollarRisk.toFixed(2)}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-sans block">Suggested Shares</span>
            <strong className="text-white font-semibold text-sm">
              {calculatedShares.toLocaleString()} <span className="text-[10px] text-slate-400">rTokens</span>
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-sans block">TP1 Expected Gain</span>
            <strong className="text-emerald-400 font-semibold text-sm">
              +${potentialGainTp1.toFixed(2)}
            </strong>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-sans block">Realized R / R</span>
            <strong className="text-sky-400 font-semibold text-sm">
              1 : {actualRiskReward}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
