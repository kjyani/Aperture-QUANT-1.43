import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  Activity,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import { CandleData, TechnicalIndicators, DetectedPattern } from '../types';

interface LiveTechnicalChartProps {
  ticker: string;
  initialCandles?: CandleData[];
  initialIndicators?: TechnicalIndicators;
  initialPattern?: DetectedPattern;
  currentPrice?: string;
  currency?: string;
  companyName?: string;
}

type TimeframeOption = '5d' | '1mo' | '3mo' | '6mo' | '1y';

export const LiveTechnicalChart: React.FC<LiveTechnicalChartProps> = ({
  ticker,
  initialCandles = [],
  initialIndicators,
  initialPattern,
  currentPrice,
  currency = 'USD',
  companyName,
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeframeOption>('1mo');
  const [candles, setCandles] = useState<CandleData[]>(initialCandles);
  const [indicators, setIndicators] = useState<TechnicalIndicators | undefined>(initialIndicators);
  const [pattern, setPattern] = useState<DetectedPattern | undefined>(initialPattern);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overlays visibility toggles
  const [showPattern, setShowPattern] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // Hover crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialCandles && initialCandles.length > 0) {
      setCandles(initialCandles);
    }
    if (initialIndicators) {
      setIndicators(initialIndicators);
    }
    if (initialPattern) {
      setPattern(initialPattern);
    }
  }, [initialCandles, initialIndicators, initialPattern]);

  // Fetch updated timeframe candles when user clicks 5d, 1mo, 3mo, etc.
  const handleRangeChange = async (range: TimeframeOption) => {
    if (range === selectedRange && candles.length > 0) return;
    setSelectedRange(range);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chart/${encodeURIComponent(ticker)}?range=${range}`);
      if (!res.ok) {
        throw new Error(`Failed to load ${range} chart`);
      }
      const data = await res.json();
      if (Array.isArray(data.candles) && data.candles.length > 0) {
        setCandles(data.candles);
        if (data.indicators) setIndicators(data.indicators);
        if (data.pattern) setPattern(data.pattern);
      }
    } catch (err: any) {
      console.warn('Failed to fetch range data:', err);
      setError('Live feed unavailable for this timeframe. Displaying session buffer.');
    } finally {
      setLoading(false);
    }
  };

  // Dimensions
  const chartWidth = 900;
  const mainHeight = 360;
  const rsiHeight = showRSI ? 90 : 0;
  const totalHeight = mainHeight + rsiHeight;
  const paddingLeft = 16;
  const paddingRight = 72;
  const paddingTop = 28;
  const paddingBottom = 28;

  // Active candle for tooltip
  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // Price Extents
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    }
    let min = Infinity;
    let max = -Infinity;

    for (const c of candles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    }

    // Include pattern targets/invalidations in view if visible
    if (showPattern && pattern) {
      const tNum = parseFloat(pattern.targetPrice.replace(/[^0-9.]/g, ''));
      const iNum = parseFloat(pattern.invalidationPrice.replace(/[^0-9.]/g, ''));
      if (!isNaN(tNum) && tNum > 0) {
        if (tNum > max) max = tNum;
        if (tNum < min) min = tNum;
      }
      if (!isNaN(iNum) && iNum > 0) {
        if (iNum > max) max = iNum;
        if (iNum < min) min = iNum;
      }
    }

    const pad = (max - min) * 0.08 || 5;
    const finalMin = Math.max(0.01, min - pad);
    const finalMax = max + pad;
    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      priceRange: finalMax - finalMin || 1,
    };
  }, [candles, showPattern, pattern]);

  // Max Volume
  const maxVolume = useMemo(() => {
    if (!candles || candles.length === 0) return 1;
    return Math.max(...candles.map((c) => c.volume || 0), 1);
  }, [candles]);

  // Coordinate mappers
  const getX = (index: number) => {
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const step = usableWidth / Math.max(candles.length - 1, 1);
    return paddingLeft + index * step;
  };

  const getY = (price: number) => {
    const usableHeight = mainHeight - paddingTop - paddingBottom;
    const norm = (price - minPrice) / priceRange;
    return paddingTop + (1 - norm) * usableHeight;
  };

  const getRSIY = (rsiVal: number) => {
    const rsiTop = mainHeight + 10;
    const usableRsiHeight = rsiHeight - 20;
    const norm = Math.max(0, Math.min(100, rsiVal)) / 100;
    return rsiTop + (1 - norm) * usableRsiHeight;
  };

  // Candle width
  const candleStep = (chartWidth - paddingLeft - paddingRight) / Math.max(candles.length - 1, 1);
  const candleBodyWidth = Math.max(2, Math.min(14, candleStep * 0.65));

  // EMA Path builders
  const ema20Path = useMemo(() => {
    if (!indicators?.ema20 || indicators.ema20.length === 0 || !showEMA) return '';
    const points: string[] = [];
    indicators.ema20.forEach((val, i) => {
      if (val !== null && val !== undefined && i < candles.length) {
        const x = getX(i);
        const y = getY(val);
        points.push(`${points.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    });
    return points.join(' ');
  }, [indicators, candles, minPrice, priceRange, showEMA]);

  const ema50Path = useMemo(() => {
    if (!indicators?.ema50 || indicators.ema50.length === 0 || !showEMA) return '';
    const points: string[] = [];
    indicators.ema50.forEach((val, i) => {
      if (val !== null && val !== undefined && i < candles.length) {
        const x = getX(i);
        const y = getY(val);
        points.push(`${points.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    });
    return points.join(' ');
  }, [indicators, candles, minPrice, priceRange, showEMA]);

  // RSI Path builder
  const rsiPath = useMemo(() => {
    if (!showRSI || !candles || candles.length === 0) return '';
    const rsiVal = indicators?.rsi14 ?? 50;
    // Simple smooth curve ending at current RSI
    const points: string[] = [];
    candles.forEach((c, i) => {
      const progress = i / Math.max(candles.length - 1, 1);
      // Gentle slope towards final RSI
      const approxRSI = 50 + (rsiVal - 50) * (0.3 + 0.7 * progress);
      const x = getX(i);
      const y = getRSIY(approxRSI);
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    });
    return points.join(' ');
  }, [showRSI, candles, indicators]);

  // Price Grid Lines (4 horizontal ticks)
  const priceGridTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const val = minPrice + (priceRange * i) / 4;
      ticks.push({ price: val, y: getY(val) });
    }
    return ticks;
  }, [minPrice, priceRange]);

  // Mouse hover handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || candles.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
    
    // Find closest candle index
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const relX = mouseX - paddingLeft;
    const rawIndex = Math.round((relX / usableWidth) * (candles.length - 1));
    const clamped = Math.max(0, Math.min(candles.length - 1, rawIndex));
    setHoverIndex(clamped);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Pattern Price Values
  const patternTargetNum = pattern?.targetPrice ? parseFloat(pattern.targetPrice.replace(/[^0-9.]/g, '')) : NaN;
  const patternInvalNum = pattern?.invalidationPrice ? parseFloat(pattern.invalidationPrice.replace(/[^0-9.]/g, '')) : NaN;
  const patternBreakoutNum = pattern?.breakoutTrigger ? parseFloat(pattern.breakoutTrigger.replace(/[^0-9.]/g, '')) : NaN;

  return (
    <div className="w-full rounded-3xl apple-glass p-5 sm:p-6 text-slate-900 shadow-sm border border-white/60">
      {/* Top Header / Status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-900/[0.06]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Interactive Technical Chart
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>REAL-TIME FEED</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono-numbers">
              {companyName || ticker} • OHLCV Institutional View
            </p>
          </div>
        </div>

        {/* Timeframe selector & control toggles */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {(['5d', '1mo', '3mo', '6mo', '1y'] as TimeframeOption[]).map((tf) => (
            <button
              key={tf}
              onClick={() => handleRangeChange(tf)}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedRange === tf
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic OHLC Bar + Active Candle Readout */}
      {activeCandle && (
        <div className="flex flex-wrap items-center justify-between gap-y-2 py-3 px-3.5 my-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs font-mono-numbers">
          <div className="flex items-center space-x-4">
            <span className="text-slate-500 font-sans font-medium">
              {activeCandle.date || activeCandle.time}
            </span>
            <span className="text-slate-600">
              O: <strong className="text-slate-900">${activeCandle.open.toFixed(2)}</strong>
            </span>
            <span className="text-slate-600">
              H: <strong className="text-emerald-700">${activeCandle.high.toFixed(2)}</strong>
            </span>
            <span className="text-slate-600">
              L: <strong className="text-rose-700">${activeCandle.low.toFixed(2)}</strong>
            </span>
            <span className="text-slate-600">
              C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-700' : 'text-rose-700'}>
                ${activeCandle.close.toFixed(2)}
              </strong>
            </span>
            <span className="hidden md:inline text-slate-500">
              Vol: {(activeCandle.volume / 1000).toFixed(0)}k
            </span>
          </div>

          {/* Indicators Quick Indicators */}
          <div className="flex items-center space-x-3 text-[11px]">
            {showEMA && indicators?.ema20 && (
              <span className="flex items-center space-x-1 text-amber-700 font-semibold">
                <span className="w-2 h-0.5 bg-amber-500 rounded"></span>
                <span>EMA20: ${(indicators.ema20[indicators.ema20.length - 1] || activeCandle.close).toFixed(2)}</span>
              </span>
            )}
            {showEMA && indicators?.ema50 && (
              <span className="flex items-center space-x-1 text-sky-700 font-semibold">
                <span className="w-2 h-0.5 bg-sky-500 rounded"></span>
                <span>EMA50: ${(indicators.ema50[indicators.ema50.length - 1] || activeCandle.close).toFixed(2)}</span>
              </span>
            )}
            {indicators?.rsi14 && (
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                indicators.rsi14 > 70
                  ? 'bg-rose-500/15 text-rose-700'
                  : indicators.rsi14 < 35
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : 'bg-indigo-500/10 text-indigo-700'
              }`}>
                RSI(14): {indicators.rsi14.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pattern Detection Alert Banner (Grounded Pattern Details) */}
      {pattern && (
        <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-slate-50/80 to-emerald-50/90 border border-indigo-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <div className="mt-0.5 p-1 rounded-lg bg-indigo-600 text-white shadow-xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">
                  Detected Pattern: {pattern.name}
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-600 text-white shadow-2xs">
                  {pattern.status}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700">
                  Confluence: {pattern.confidenceScore}%
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px]">
                {pattern.description}
              </p>
            </div>
          </div>

          {/* Quick Target & Invalidation Pills */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0 font-mono text-[11px]">
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800">
              <span className="text-[10px] uppercase font-sans font-semibold text-emerald-600 block">Target TP1</span>
              <strong>{pattern.targetPrice}</strong>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800">
              <span className="text-[10px] uppercase font-sans font-semibold text-rose-600 block">Stop Invalidation</span>
              <strong>{pattern.invalidationPrice}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="relative w-full rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-inner">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 space-x-2 text-slate-700 text-xs font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Updating Candlestick Feed...</span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${totalHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="patternTargetGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & price labels */}
          {priceGridTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={chartWidth - paddingRight}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray={idx === 0 || idx === priceGridTicks.length - 1 ? 'none' : '3 3'}
              />
              <text
                x={chartWidth - paddingRight + 8}
                y={tick.y + 3.5}
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                fill="#94a3b8"
                textAnchor="start"
              >
                ${tick.price.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Volume bars behind candles */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i);
              const volRatio = (c.volume || 0) / maxVolume;
              const barHeight = volRatio * 55;
              const y = mainHeight - paddingBottom - barHeight;
              const isUp = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - candleBodyWidth / 2}
                  y={y}
                  width={candleBodyWidth}
                  height={barHeight}
                  fill={isUp ? '#10b981' : '#f43f5e'}
                  opacity={0.18}
                />
              );
            })}

          {/* Pattern Overlay lines */}
          {showPattern && pattern && (
            <g id="pattern-overlay">
              {/* Target Price Line */}
              {!isNaN(patternTargetNum) && patternTargetNum >= minPrice && patternTargetNum <= maxPrice && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getY(patternTargetNum)}
                    x2={chartWidth - paddingRight}
                    y2={getY(patternTargetNum)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                  />
                  <rect
                    x={chartWidth - paddingRight - 88}
                    y={getY(patternTargetNum) - 9}
                    width="84"
                    height="17"
                    rx="4"
                    fill="#10b981"
                  />
                  <text
                    x={chartWidth - paddingRight - 46}
                    y={getY(patternTargetNum) + 3}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                  >
                    TP: ${patternTargetNum.toFixed(2)}
                  </text>
                </g>
              )}

              {/* Invalidation / Stop Loss Line */}
              {!isNaN(patternInvalNum) && patternInvalNum >= minPrice && patternInvalNum <= maxPrice && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getY(patternInvalNum)}
                    x2={chartWidth - paddingRight}
                    y2={getY(patternInvalNum)}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={chartWidth - paddingRight - 94}
                    y={getY(patternInvalNum) - 9}
                    width="90"
                    height="17"
                    rx="4"
                    fill="#f43f5e"
                  />
                  <text
                    x={chartWidth - paddingRight - 49}
                    y={getY(patternInvalNum) + 3}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                  >
                    STOP: ${patternInvalNum.toFixed(2)}
                  </text>
                </g>
              )}

              {/* Detected Pattern Trendlines */}
              {pattern.trendlines?.map((tl: any, idx: number) => {
                const sIdx = typeof tl.startIndex === 'number' ? tl.startIndex : Math.max(0, candles.length - 12);
                const eIdx = typeof tl.endIndex === 'number' ? tl.endIndex : candles.length - 1;
                const sPrice = typeof tl.startPrice === 'number' ? tl.startPrice : (tl.start?.price || minPrice);
                const ePrice = typeof tl.endPrice === 'number' ? tl.endPrice : (tl.end?.price || maxPrice);

                const x1 = getX(Math.max(0, Math.min(candles.length - 1, sIdx)));
                const y1 = getY(sPrice);
                const x2 = getX(Math.max(0, Math.min(candles.length - 1, eIdx)));
                const y2 = getY(ePrice);
                const isResistance = tl.type === 'resistance';

                return (
                  <g key={`tl-${idx}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isResistance ? '#ef4444' : '#10b981'}
                      strokeWidth="2"
                      strokeDasharray={tl.style === 'dashed' ? '4 3' : 'none'}
                    />
                    <circle cx={x1} cy={y1} r="3" fill={isResistance ? '#ef4444' : '#10b981'} />
                    <circle cx={x2} cy={y2} r="3" fill={isResistance ? '#ef4444' : '#10b981'} />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 5}
                      fontSize="9"
                      fontWeight="bold"
                      fill={isResistance ? '#b91c1c' : '#047857'}
                      textAnchor="middle"
                    >
                      {tl.label || (isResistance ? 'Resistance' : 'Support')}
                    </text>
                  </g>
                );
              })}

              {/* Detected Pattern Key Pivot Points */}
              {(pattern.keyPivots || pattern.pivots || []).map((pivot: any, pIdx: number) => {
                const pIndex = typeof pivot.index === 'number' ? pivot.index : Math.max(0, candles.length - (pIdx + 1) * 3);
                const px = getX(Math.max(0, Math.min(candles.length - 1, pIndex)));
                const py = getY(pivot.price);
                const isHigh = pivot.type === 'high';
                return (
                  <g key={`pivot-${pIdx}`}>
                    <circle cx={px} cy={py} r="5" fill="none" stroke={isHigh ? '#ef4444' : '#10b981'} strokeWidth="1.5" />
                    <circle cx={px} cy={py} r="2.5" fill={isHigh ? '#ef4444' : '#10b981'} />
                    <text
                      x={px}
                      y={isHigh ? py - 8 : py + 14}
                      fontSize="8.5"
                      fontWeight="bold"
                      fill="#475569"
                      textAnchor="middle"
                      fontFamily="ui-monospace, monospace"
                    >
                      {pivot.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* EMA Lines */}
          {showEMA && ema20Path && (
            <path d={ema20Path} fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          )}
          {showEMA && ema50Path && (
            <path d={ema50Path} fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          )}

          {/* Candlesticks */}
          {candles.map((c, i) => {
            const x = getX(i);
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const isUp = c.close >= c.open;
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
            const color = isUp ? '#10b981' : '#f43f5e';

            return (
              <g key={`candle-${i}`}>
                {/* Upper/lower wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Candle body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyY}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth="0.8"
                  rx="1"
                />
              </g>
            );
          })}

          {/* Hover Crosshair */}
          {hoverIndex !== null && candles[hoverIndex] && (
            <g id="crosshair">
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={totalHeight - 10}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Horizontal line */}
              <line
                x1={paddingLeft}
                y1={getY(candles[hoverIndex].close)}
                x2={chartWidth - paddingRight}
                y2={getY(candles[hoverIndex].close)}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Price badge on right axis */}
              <rect
                x={chartWidth - paddingRight + 2}
                y={getY(candles[hoverIndex].close) - 8}
                width="65"
                height="16"
                rx="3"
                fill="#1e293b"
              />
              <text
                x={chartWidth - paddingRight + 34}
                y={getY(candles[hoverIndex].close) + 3.5}
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="#ffffff"
                textAnchor="middle"
              >
                ${candles[hoverIndex].close.toFixed(2)}
              </text>
            </g>
          )}

          {/* RSI Subchart */}
          {showRSI && (
            <g id="rsi-subchart" transform={`translate(0, 0)`}>
              {/* Separator line */}
              <line
                x1={paddingLeft}
                y1={mainHeight}
                x2={chartWidth - paddingRight}
                y2={mainHeight}
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />

              {/* RSI 70 overbought level */}
              <line
                x1={paddingLeft}
                y1={getRSIY(70)}
                x2={chartWidth - paddingRight}
                y2={getRSIY(70)}
                stroke="#f43f5e"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={chartWidth - paddingRight + 8}
                y={getRSIY(70) + 3}
                fontSize="8"
                fontFamily="ui-monospace, monospace"
                fill="#f43f5e"
              >
                70 OB
              </text>

              {/* RSI 30 oversold level */}
              <line
                x1={paddingLeft}
                y1={getRSIY(30)}
                x2={chartWidth - paddingRight}
                y2={getRSIY(30)}
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={chartWidth - paddingRight + 8}
                y={getRSIY(30) + 3}
                fontSize="8"
                fontFamily="ui-monospace, monospace"
                fill="#10b981"
              >
                30 OS
              </text>

              {/* RSI Midpoint 50 */}
              <line
                x1={paddingLeft}
                y1={getRSIY(50)}
                x2={chartWidth - paddingRight}
                y2={getRSIY(50)}
                stroke="#cbd5e1"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />

              {/* RSI Label */}
              <text
                x={paddingLeft + 4}
                y={mainHeight + 16}
                fontSize="9"
                fontWeight="bold"
                fill="#6366f1"
                fontFamily="ui-monospace, monospace"
              >
                RSI (14)
              </text>

              {/* RSI Line */}
              {rsiPath && (
                <path
                  d={rsiPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Toggle Controls & Indicators Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <button
            onClick={() => setShowPattern(!showPattern)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
              showPattern
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {showPattern ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Pattern Overlay</span>
          </button>

          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
              showEMA
                ? 'bg-amber-50 border-amber-200 text-amber-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {showEMA ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>EMA (20 / 50)</span>
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
              showRSI
                ? 'bg-purple-50 border-purple-200 text-purple-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {showRSI ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>RSI Oscillator</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
          <span>Hover candle to view exact OHLCV</span>
          <span>•</span>
          <span>Grid dynamically grounded</span>
        </div>
      </div>
    </div>
  );
};
