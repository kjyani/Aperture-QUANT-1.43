/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ReportView } from './components/ReportView';
import { HistoryPanel } from './components/HistoryPanel';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ResearchReport, HistoryItem } from './types';
import {
  Loader2,
  AlertCircle,
  Radio,
  Calendar,
  ArrowUpRight,
  Cpu,
  BarChart3
} from 'lucide-react';

const STORAGE_KEY = 'aperture_research_history_v2';

interface MarketPulseItem {
  ticker: string;
  name: string;
  rToken: string;
  sector: string;
  theme: string;
}

const MARKET_PULSE_ITEMS: MarketPulseItem[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', rToken: 'rNVDA', sector: 'AI & Semi', theme: 'Data Center GPU Compute' },
  { ticker: 'TSLA', name: 'Tesla Inc', rToken: 'rTSLA', sector: 'Mega Tech', theme: 'Autonomous Fleet & Energy' },
  { ticker: 'MSTR', name: 'MicroStrategy', rToken: 'rMSTR', sector: 'Crypto / Beta', theme: 'Bitcoin Treasury Reserve' },
  { ticker: 'AAPL', name: 'Apple Inc', rToken: 'rAAPL', sector: 'Mega Tech', theme: 'Apple Intelligence Ecosystem' },
  { ticker: 'PLTR', name: 'Palantir Tech', rToken: 'rPLTR', sector: 'AI & Semi', theme: 'Enterprise AIP Deployment' },
  { ticker: 'QQQ', name: 'Invesco QQQ', rToken: 'rQQQ', sector: 'Indices', theme: 'Nasdaq 100 Benchmark' },
  { ticker: 'COIN', name: 'Coinbase Global', rToken: 'rCOIN', sector: 'Crypto / Beta', theme: 'Exchange Volume & Base L2' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', rToken: 'rAMD', sector: 'AI & Semi', theme: 'MI350 GPU Architecture' },
];

const UPCOMING_EARNINGS_RADAR = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    rToken: 'rNVDA',
    period: 'Q3 FY27',
    dateEstimate: 'November 2026',
    keyFocus: 'Hyperscaler CapEx commitments & Blackwell rack shipments',
    sentiment: 'Bullish Focus'
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    rToken: 'rTSLA',
    period: 'Q3 2026',
    dateEstimate: 'October 2026',
    keyFocus: 'Automotive gross margin ex-regulatory credits & energy storage deployment',
    sentiment: 'High Volatility'
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    rToken: 'rAAPL',
    period: 'Q4 FY26',
    dateEstimate: 'October 2026',
    keyFocus: 'iPhone replacement cycle & services revenue expansion',
    sentiment: 'Moderate Growth'
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    rToken: 'rMSFT',
    period: 'Q1 FY27',
    dateEstimate: 'October 2026',
    keyFocus: 'Azure Cloud revenue acceleration & Copilot monetization',
    sentiment: 'Steady Outperform'
  }
];

export default function App() {
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentTicker, setCurrentTicker] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed.slice(0, 5));
        }
      }
    } catch (e) {
      console.warn('Failed to parse search history from localStorage:', e);
    }
  }, []);

  // Save history to localStorage whenever updated
  const saveHistory = (newItems: HistoryItem[]) => {
    const capped = newItems.slice(0, 5);
    setHistory(capped);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    } catch (e) {
      console.warn('Failed to save search history to localStorage:', e);
    }
  };

  const executeResearch = async (tickerSymbol: string) => {
    const ticker = tickerSymbol.trim().toUpperCase();
    if (!ticker) return;

    setCurrentTicker(ticker);
    setError(null);
    setIsLoading(true);
    setLoadingStep(`Connecting live telemetry for $${ticker}...`);

    const stepTimer1 = setTimeout(() => {
      setLoadingStep(`Grounding spot quote, earnings calendar & financial news...`);
    }, 2000);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(`Calculating key levels, risk/reward geometry & thesis...`);
    }, 5500);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Research request failed with status ${res.status}`);
      }

      const data: ResearchReport = await res.json();
      setReport(data);

      // Add to recent history
      const newHistoryItem: HistoryItem = {
        id: `${ticker}-${Date.now()}`,
        ticker: data.ticker,
        companyName: data.companyName,
        currentPrice: data.currentPrice,
        confidence: data.confidence,
        trendDirection: data.technicalRead.trendDirection,
        timestamp: Date.now(),
        report: data,
      };

      const updatedHistory = [
        newHistoryItem,
        ...history.filter((h) => h.ticker !== data.ticker),
      ].slice(0, 5);

      saveHistory(updatedHistory);
    } catch (err: any) {
      console.error('Research error:', err);
      setError(
        err.message ||
          'Failed to complete stock research. Please check the ticker symbol or verify live feed status.'
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentTicker(item.ticker);
    setReport(item.report);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear search history:', e);
    }
  };

  const handleResetToDesk = () => {
    setReport(null);
    setCurrentTicker('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col apple-aurora-bg text-slate-900 selection:bg-sky-500/20 selection:text-sky-900 relative overflow-x-hidden">
      {/* Soft Multicolor Ambient Gradients flowing behind the UI (blue, purple, pink, green) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft sky-blue orb - top center/left */}
        <div className="absolute -top-[10%] left-[12%] w-[680px] h-[580px] rounded-full bg-sky-400/[0.28] blur-[110px] transform-gpu animate-ambient-1" />
        
        {/* Soft purple/violet orb - top right */}
        <div className="absolute top-[4%] right-[5%] w-[600px] h-[540px] rounded-full bg-purple-400/[0.24] blur-[120px] transform-gpu animate-ambient-2" />
        
        {/* Soft pink/rose orb - mid left */}
        <div className="absolute top-[32%] -left-[6%] w-[620px] h-[600px] rounded-full bg-pink-400/[0.22] blur-[125px] transform-gpu animate-ambient-3" />
        
        {/* Soft emerald/sage orb - mid/bottom right */}
        <div className="absolute top-[52%] right-[6%] w-[580px] h-[540px] rounded-full bg-emerald-400/[0.22] blur-[115px] transform-gpu animate-ambient-1" />
        
        {/* Soft indigo/blue orb - bottom center */}
        <div className="absolute -bottom-[8%] left-[22%] w-[700px] h-[560px] rounded-full bg-indigo-400/[0.24] blur-[130px] transform-gpu animate-ambient-2" />
      </div>

      {/* Top Application Glass Header */}
      <Header
        onReset={handleResetToDesk}
        activeTicker={report?.ticker}
      />

      {/* Main Research Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 z-10">
        {/* Terminal Title & Minimal Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-9">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full apple-glass-pill text-slate-700 text-xs font-mono tracking-wider uppercase mb-3 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="font-semibold text-slate-800">Institutional Quant Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            Institutional Research.{' '}
            <span className="text-slate-500 font-mono-numbers">
              Live Grounded.
            </span>
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-mono leading-relaxed">
            Search-grounded technical geometry, earnings intelligence, and live market catalysts for equities & tokenized assets.
          </p>
        </div>

        {/* Primary Search Bar with Tokenized Equities Explorer */}
        <SearchBar
          onSearch={executeResearch}
          isLoading={isLoading}
          currentTicker={currentTicker}
        />

        {/* Loading State Glass Skeleton */}
        {isLoading && (
          <div className="w-full max-w-4xl mx-auto mt-8 rounded-3xl apple-glass p-8 sm:p-12 text-center shadow-xl">
            <div className="w-12 h-12 rounded-2xl apple-glass-subtle text-slate-900 mx-auto flex items-center justify-center mb-4 border border-white/80 shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 font-mono tracking-wide">
              Grounding & Telemetry Synthesis
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-mono mt-2 max-w-md mx-auto min-h-[22px]">
              {loadingStep || `Analyzing live data for $${currentTicker}...`}
            </p>
            <div className="w-48 h-1 bg-slate-200/80 rounded-full mx-auto mt-5 overflow-hidden">
              <div className="w-full h-full bg-slate-800 origin-left animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && !isLoading && (
          <div className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-5 rounded-3xl bg-rose-50/90 border border-rose-200/80 backdrop-blur-xl text-rose-950 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-mono text-xs">
              <h4 className="font-semibold text-rose-900 text-sm">Telemetry Error</h4>
              <p className="text-rose-700 mt-1 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => currentTicker && executeResearch(currentTicker)}
                className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs transition-all shadow-xs"
              >
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Structured Research Report */}
        {report && !isLoading && (
          <ReportView report={report} />
        )}

        {/* ============================================================ */}
        {/* HOMEPAGE SECTIONS (Displays when no report is active) */}
        {/* ============================================================ */}
        {!report && !isLoading && (
          <div className="space-y-6 mt-8">
            {/* SECTION 1: LIVE TOKENIZED EQUITIES PULSE MATRIX */}
            <div className="rounded-3xl apple-glass p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-900/[0.06]">
                <div className="flex items-center space-x-2 font-mono">
                  <BarChart3 className="w-4 h-4 text-sky-600" />
                  <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
                    Market Pulse: High-Volume Tokenized Assets
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Select card for live research
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MARKET_PULSE_ITEMS.map((item) => (
                  <button
                    key={item.ticker}
                    onClick={() => executeResearch(item.ticker)}
                    className="p-4 rounded-2xl apple-glass-subtle hover:bg-white/80 hover:shadow-md transition-all text-left group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-numbers font-semibold text-base text-slate-900 group-hover:text-sky-600 flex items-center space-x-1 transition-colors">
                          <span>${item.ticker}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                        </span>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/80 border border-white/90 text-slate-600 shadow-2xs">
                          {item.rToken}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 truncate font-medium">
                        {item.name}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-900/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{item.sector}</span>
                      <span className="text-slate-700 font-medium truncate max-w-[120px]" title={item.theme}>
                        {item.theme}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2: UPCOMING EARNINGS & CATALYSTS RADAR */}
            <div className="rounded-3xl apple-glass p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-900/[0.06]">
                <div className="flex items-center space-x-2 font-mono">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
                    Earnings Calendar & Macro Radar
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-600 bg-white/70 px-2 py-0.5 rounded border border-white/90 shadow-2xs">
                  Forward Quarters
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {UPCOMING_EARNINGS_RADAR.map((radar) => (
                  <div
                    key={radar.ticker}
                    className="p-4 rounded-2xl apple-glass-subtle hover:bg-white/80 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => executeResearch(radar.ticker)}
                            className="font-mono-numbers font-semibold text-base text-slate-900 hover:text-sky-600 underline underline-offset-2 transition-colors"
                          >
                            ${radar.ticker}
                          </button>
                          <span className="text-xs text-slate-600 truncate">
                            {radar.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 text-slate-700 border border-white/90 shadow-2xs">
                          {radar.sentiment}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono text-slate-600 mt-1.5 mb-2">
                        <span>Period: <strong className="text-slate-900 font-semibold">{radar.period}</strong></span>
                        <span>•</span>
                        <span>Estimate: <strong className="text-slate-900 font-semibold">{radar.dateEstimate}</strong></span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-white/75">
                        <span className="font-semibold text-slate-900 font-mono text-[11px]">Key Focus: </span>
                        {radar.keyFocus}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-900/[0.06] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        {radar.rToken}
                      </span>
                      <button
                        onClick={() => executeResearch(radar.ticker)}
                        className="inline-flex items-center space-x-1 text-xs font-mono font-medium text-slate-700 hover:text-slate-950 transition-colors"
                      >
                        <span>Analyze Setup</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: APERTURE QUANTITATIVE SYNTHESIS PROTOCOL */}
            <div className="rounded-3xl apple-glass p-6 sm:p-7">
              <div className="flex items-center space-x-2 pb-3.5 mb-4 border-b border-slate-900/[0.06] font-mono">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
                  Aperture Quant Synthesis Protocol
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl apple-glass-subtle">
                  <div className="w-7 h-7 rounded-lg bg-white/90 text-slate-900 font-mono font-bold text-xs flex items-center justify-center mb-2.5 border border-white shadow-2xs">
                    01
                  </div>
                  <h4 className="font-semibold text-xs font-mono uppercase text-slate-900">
                    Live Web Grounding
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Queries Google Search grounding to retrieve real-time quotes, intraday ranges, and official financial press.
                  </p>
                </div>

                <div className="p-4 rounded-2xl apple-glass-subtle">
                  <div className="w-7 h-7 rounded-lg bg-white/90 text-slate-900 font-mono font-bold text-xs flex items-center justify-center mb-2.5 border border-white shadow-2xs">
                    02
                  </div>
                  <h4 className="font-semibold text-xs font-mono uppercase text-slate-900">
                    Market Structure
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Evaluates multi-timeframe trend orientation, key support ladders, resistance boundaries, and momentum flow.
                  </p>
                </div>

                <div className="p-4 rounded-2xl apple-glass-subtle">
                  <div className="w-7 h-7 rounded-lg bg-white/90 text-slate-900 font-mono font-bold text-xs flex items-center justify-center mb-2.5 border border-white shadow-2xs">
                    03
                  </div>
                  <h4 className="font-semibold text-xs font-mono uppercase text-slate-900">
                    Earnings & Catalysts
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tracks upcoming earnings schedule, historical EPS beats/misses, forward guidance tone, and macro catalysts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl apple-glass-subtle">
                  <div className="w-7 h-7 rounded-lg bg-white/90 text-slate-900 font-mono font-bold text-xs flex items-center justify-center mb-2.5 border border-white shadow-2xs">
                    04
                  </div>
                  <h4 className="font-semibold text-xs font-mono uppercase text-slate-900">
                    Geometric Setup
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Calculates invalidation stop-loss levels, reference entry zones, dual profit targets, and risk/reward ratio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Panel (Last 5 searches) */}
        <HistoryPanel
          history={history}
          currentTicker={report?.ticker}
          onSelect={handleSelectHistoryItem}
          onClear={handleClearHistory}
        />
      </main>

      {/* Persistent Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
}
