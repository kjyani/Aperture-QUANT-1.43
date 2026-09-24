import React, { useState } from 'react';
import {
  Target,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Radio,
  FileText
} from 'lucide-react';
import { ResearchReport } from '../types';
import { LiveTechnicalChart } from './LiveTechnicalChart';
import { DisciplinedStrategyView } from './DisciplinedStrategyView';

interface ReportViewProps {
  report: ResearchReport;
}

export const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    const summaryText = `APERTURE RESEARCH: ${report.ticker} (${report.companyName})
Price: ${report.currentPrice} ${report.currency} (As of ${report.asOf})
Confidence: ${report.confidence} | Risk/Reward: ${report.riskRewardRatio}

THESIS:
${report.thesis}

LEVELS:
• Suggested Entry: ${report.suggestedEntry?.priceRange || 'N/A'} (${report.suggestedEntry?.context || ''})
• Stop Loss: ${report.stopLoss?.level || 'N/A'} (${report.stopLoss?.reasoning || ''})
• Take Profit 1: ${report.takeProfitLevels?.[0]?.level || 'N/A'}
• Take Profit 2: ${report.takeProfitLevels?.[1]?.level || 'N/A'}

EARNINGS & CATALYSTS:
• Next Earnings: ${report.earningsInfo?.nextEarningsDate || 'N/A'}
• EPS: ${report.earningsInfo?.lastQuarterEPS || 'N/A'}
• Revenue: ${report.earningsInfo?.lastQuarterRevenue || 'N/A'}
• Sentiment: ${report.earningsInfo?.earningsSentiment || 'N/A'}

DISCLAIMER: AI-generated research for informational purposes only. Not financial advice.`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return {
          pill: 'bg-emerald-500/12 text-emerald-800 border-emerald-500/25',
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
        };
      case 'Medium':
        return {
          pill: 'bg-amber-500/12 text-amber-800 border-amber-500/25',
          dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
        };
      case 'Low':
      default:
        return {
          pill: 'bg-white/80 text-slate-700 border-white/90',
          dot: 'bg-slate-400',
        };
    }
  };

  const getSentimentPill = (sentiment?: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'bg-emerald-500/12 text-emerald-800 border border-emerald-500/25';
      case 'Bearish':
        return 'bg-rose-500/12 text-rose-800 border border-rose-500/25';
      case 'Neutral':
      default:
        return 'bg-white/80 text-slate-700 border border-white/90';
    }
  };

  const confMeta = getConfidenceBadge(report.confidence);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 mt-6 animate-in fade-in duration-300 font-sans">
      {/* 1. Ticker Header & Live Price Card */}
      <div className="rounded-3xl apple-glass p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-900/[0.06]">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-3 py-1 rounded-xl bg-white/90 text-slate-900 font-mono-numbers font-bold text-xl sm:text-2xl tracking-tight border border-white shadow-xs">
                ${report.ticker}
              </span>
              {report.bitgetTokenSymbol && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/80 text-slate-600 border border-white/90 shadow-2xs">
                  {report.bitgetTokenSymbol}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                {report.companyName}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-mono-numbers">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>As Of: <strong className="text-slate-900 font-semibold">{report.asOf}</strong></span>
              </span>
              <span>•</span>
              <span>Currency: <strong className="text-slate-900 font-semibold">{report.currency}</strong></span>
              {report.priceChangeContext && (
                <>
                  <span>•</span>
                  <span className="text-sky-700 font-medium">{report.priceChangeContext}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500 tracking-wider uppercase font-semibold">
                SPOT PRICE
              </div>
              <div className="font-mono-numbers text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight drop-shadow-xs">
                {report.currentPrice}
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              type="button"
              className="p-2.5 rounded-xl border border-white/90 hover:border-white bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 transition-all shadow-xs shrink-0"
              title="Copy Research Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Signal Confidence & Risk/Reward Telemetry */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold">CONFIDENCE:</span>
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border font-semibold ${confMeta.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${confMeta.dot}`}></span>
              <span>{report.confidence}</span>
            </span>
            {report.confidenceReasoning && (
              <span className="text-slate-600 hidden sm:inline">
                — {report.confidenceReasoning}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold">RISK / REWARD:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 font-mono-numbers font-bold border border-white shadow-2xs">
              {report.riskRewardRatio}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Live Technical Chart & Pattern Recognition Overlay */}
      <LiveTechnicalChart
        ticker={report.ticker}
        initialCandles={report.chartCandles}
        initialIndicators={report.indicators}
        initialPattern={report.detectedPattern}
        currentPrice={report.currentPrice}
        currency={report.currency}
        companyName={report.companyName}
      />

      {/* 3. Improved Institutional Strategy & Capital Preservation Guard */}
      <DisciplinedStrategyView
        strategy={report.strategy}
        currentPrice={report.currentPrice}
        currency={report.currency}
        ticker={report.ticker}
        tp1={report.takeProfitLevels?.[0]?.level}
        tp2={report.takeProfitLevels?.[1]?.level}
        stopLoss={report.stopLoss?.level}
      />

      {/* 4. Analyst Thesis & Market Context */}
      <div className="rounded-3xl apple-glass p-6 sm:p-7">
        <div className="flex items-center space-x-2 pb-3 mb-3.5 border-b border-slate-900/[0.06] font-mono">
          <FileText className="w-4 h-4 text-sky-600" />
          <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
            Analyst Thesis & Market Context
          </h3>
        </div>
        <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
          {report.thesis}
        </p>
      </div>

      {/* 3. KEY LEVELS & GEOMETRIC SETUP (Placed above Earnings) */}
      <div className="rounded-3xl apple-glass p-6 sm:p-7">
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-900/[0.06]">
          <div className="flex items-center space-x-2 font-mono">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
              Key Levels & Risk / Reward Geometry
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-600">
            R/R Ratio: <strong className="font-mono-numbers text-slate-900 font-bold">{report.riskRewardRatio}</strong>
          </span>
        </div>

        {/* 4-Card Structural Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Stop Loss Card */}
          <div className="p-4 rounded-2xl bg-rose-500/[0.08] border border-rose-500/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-rose-800 uppercase mb-1">
                <span className="font-semibold">Stop Loss</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-900 border border-rose-500/30 font-bold">
                  Invalidation
                </span>
              </div>
              <div className="font-mono-numbers text-xl font-bold text-slate-900 mt-1 drop-shadow-xs">
                {report.stopLoss.level}
              </div>
            </div>
            <p className="text-xs text-rose-800 mt-2.5 leading-snug">
              {report.stopLoss.reasoning}
            </p>
          </div>

          {/* Suggested Entry Zone Card */}
          <div className="p-4 rounded-2xl bg-sky-500/[0.08] border border-sky-500/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-sky-800 uppercase mb-1">
                <span className="font-semibold">Suggested Entry</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-900 border border-sky-500/30 font-bold">
                  Reference
                </span>
              </div>
              <div className="font-mono-numbers text-xl font-bold text-slate-900 mt-1 drop-shadow-xs">
                {report.suggestedEntry.priceRange}
              </div>
            </div>
            <p className="text-xs text-sky-800 mt-2.5 leading-snug">
              {report.suggestedEntry.context}
            </p>
          </div>

          {/* Take Profit 1 Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-800 uppercase mb-1">
                <span className="font-semibold">Take Profit 1</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-900 border border-emerald-500/30 font-bold">
                  Target 1
                </span>
              </div>
              <div className="font-mono-numbers text-xl font-bold text-slate-900 mt-1 drop-shadow-xs">
                {report.takeProfitLevels[0]?.level || 'N/A'}
              </div>
            </div>
            <p className="text-xs text-emerald-800 mt-2.5 leading-snug">
              {report.takeProfitLevels[0]?.reasoning || 'Initial structural target.'}
            </p>
          </div>

          {/* Take Profit 2 Card */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-800 uppercase mb-1">
                <span className="font-semibold">Take Profit 2</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-900 border border-emerald-500/30 font-bold">
                  Target 2
                </span>
              </div>
              <div className="font-mono-numbers text-xl font-bold text-slate-900 mt-1 drop-shadow-xs">
                {report.takeProfitLevels[1]?.level || 'N/A'}
              </div>
            </div>
            <p className="text-xs text-emerald-800 mt-2.5 leading-snug">
              {report.takeProfitLevels[1]?.reasoning || 'Secondary expansion target.'}
            </p>
          </div>
        </div>

        {/* Minimal Context Note */}
        <div className="p-3 rounded-2xl apple-glass-subtle text-xs text-slate-600 font-mono">
          <span className="text-slate-900 font-semibold">Analytical Reference:</span> Suggested entry is calculated from structural market levels and recent order volume. It is not an automated execution signal.
        </div>
      </div>

      {/* 4. TECHNICAL STRUCTURE & MOMENTUM CONTEXT (Placed above Earnings) */}
      <div className="rounded-3xl apple-glass p-6 sm:p-7">
        <div className="flex items-center space-x-2 pb-3.5 mb-5 border-b border-slate-900/[0.06] font-mono">
          <Layers className="w-4 h-4 text-purple-600" />
          <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
            Technical Structure & Momentum Context
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Trend & Momentum */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                Trend Direction
              </div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl apple-glass-subtle text-slate-900 font-mono font-bold text-sm border border-white/80">
                <span>{report.technicalRead.trendDirection}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                Momentum Context
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed apple-glass-subtle p-3.5 rounded-2xl border border-white/80">
                {report.technicalRead.momentumContext || 'Momentum consolidating within normal volatility parameters.'}
              </p>
            </div>
          </div>

          {/* Support & Resistance Levels Ladder */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                Support Levels
              </div>
              <ul className="space-y-1.5">
                {(report.technicalRead?.supportLevels || []).map((lvl, idx) => (
                  <li
                    key={idx}
                    className="text-xs font-mono-numbers text-slate-900 apple-glass-subtle px-3 py-2 rounded-xl flex items-center space-x-2 border border-white/80 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 shadow-[0_0_6px_rgba(14,165,233,0.8)]"></span>
                    <span className="font-semibold">{lvl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                Resistance Levels
              </div>
              <ul className="space-y-1.5">
                {(report.technicalRead?.resistanceLevels || []).map((lvl, idx) => (
                  <li
                    key={idx}
                    className="text-xs font-mono-numbers text-slate-900 apple-glass-subtle px-3 py-2 rounded-xl flex items-center space-x-2 border border-white/80 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_6px_rgba(168,85,247,0.8)]"></span>
                    <span className="font-semibold">{lvl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EARNINGS INTELLIGENCE & MARKET CATALYSTS */}
      <div className="rounded-3xl apple-glass p-6 sm:p-7">
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-900/[0.06]">
          <div className="flex items-center space-x-2 font-mono">
            <Radio className="w-4 h-4 text-sky-600" />
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
              Earnings Intelligence & Market Catalysts
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-white/70 px-2 py-0.5 rounded border border-white/90 shadow-2xs">
            Event Telemetry
          </span>
        </div>

        {/* Earnings Metrics Cards */}
        {report.earningsInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl apple-glass-subtle flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Next Earnings</span>
              <div className="text-sm sm:text-base font-mono-numbers font-bold text-slate-900 mt-1">
                {report.earningsInfo.nextEarningsDate || 'Upcoming Window'}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">
                {report.earningsInfo.fiscalQuarter || 'Fiscal Period'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl apple-glass-subtle flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Reported EPS</span>
              <div className="text-sm sm:text-base font-mono-numbers font-bold text-slate-900 mt-1">
                {report.earningsInfo.lastQuarterEPS || 'Consensus Met'}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">Reported vs estimate</span>
            </div>

            <div className="p-3.5 rounded-2xl apple-glass-subtle flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Revenue Metric</span>
              <div className="text-sm sm:text-base font-mono-numbers font-bold text-slate-900 mt-1">
                {report.earningsInfo.lastQuarterRevenue || 'In Line'}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">Top-line trajectory</span>
            </div>

            <div className="p-3.5 rounded-2xl apple-glass-subtle flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Guidance Sentiment</span>
              <div className="mt-1">
                <span className={`inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded ${getSentimentPill(report.earningsInfo.earningsSentiment)}`}>
                  {report.earningsInfo.earningsSentiment || 'Neutral'}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 mt-1 truncate font-medium" title={report.earningsInfo.guidanceSummary}>
                {report.earningsInfo.guidanceSummary || 'Forward commentary'}
              </span>
            </div>
          </div>
        )}

        {/* Catalysts Breakdown */}
        {report.catalysts && report.catalysts.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Near-Term Market Catalysts:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.catalysts.map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl apple-glass-subtle hover:bg-white/80 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-slate-900 truncate">{cat.title}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 font-medium ${getSentimentPill(cat.impact)}`}>
                      {cat.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{cat.description}</p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900/[0.06]">
                    <span>Category: <strong className="text-slate-800 font-medium">{cat.category}</strong></span>
                    <span>Horizon: <strong className="text-slate-800 font-medium">{cat.timeHorizon}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Real-Time Breaking News Wire & Grounding Citations */}
      <div className="rounded-3xl apple-glass p-6 sm:p-7">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-900/[0.06]">
          <div className="flex items-center space-x-2 font-mono">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-800">
              News Wire & Grounded Sources
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Financial Citations
          </span>
        </div>

        {/* News Stream */}
        {report.enrichedNews && report.enrichedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {report.enrichedNews.map((news, idx) => (
              <a
                key={idx}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 rounded-2xl apple-glass-subtle hover:bg-white/80 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">
                      {news.publisher}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-medium ${getSentimentPill(news.sentiment)}`}>
                      {news.sentiment}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                    {news.title}
                  </h4>
                  {news.summary && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {news.summary}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900/[0.06] flex items-center justify-end text-[11px] text-slate-500 group-hover:text-slate-800 transition-colors">
                  <span className="font-mono text-[10px] mr-1">Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {report.sources.map((src, i) => (
              <div
                key={i}
                className="text-xs text-slate-700 apple-glass-subtle px-3.5 py-2.5 rounded-xl flex items-start space-x-2.5 border border-white/80 shadow-2xs"
              >
                <span className="text-sky-600 font-mono">•</span>
                <span>{src}</span>
              </div>
            ))}
          </div>
        )}

        {/* Live Grounding Reference URLs */}
        {report.groundingSources && report.groundingSources.length > 0 && (
          <div className="pt-3 border-t border-slate-900/[0.06]">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-semibold">
              Grounding Citations:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.groundingSources.map((g, idx) => (
                <a
                  key={idx}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-700 hover:text-slate-950 apple-glass-subtle hover:bg-white/80 p-2.5 rounded-xl transition-all flex items-center justify-between truncate group font-mono border border-white/80 shadow-2xs"
                >
                  <span className="truncate pr-2">{g.title || g.url}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
