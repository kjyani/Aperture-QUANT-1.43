export interface GroundingSource {
  title: string;
  url: string;
}

export interface TechnicalRead {
  trendDirection: string;
  supportLevels: string[];
  resistanceLevels: string[];
  momentumContext: string;
}

export interface SuggestedEntry {
  priceRange: string;
  context: string;
  exactTriggerPrice?: number;
}

export interface TakeProfitLevel {
  level: string;
  label: string;
  reasoning: string;
  price?: number;
}

export interface StopLossLevel {
  level: string;
  reasoning: string;
  price?: number;
}

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type DataStatus = 'verified' | 'thin_data' | 'not_found';

export interface EarningsInfo {
  nextEarningsDate: string;
  fiscalQuarter?: string;
  lastQuarterEPS?: string;
  lastQuarterRevenue?: string;
  guidanceSummary?: string;
  earningsSentiment: 'Bullish' | 'Neutral' | 'Bearish' | 'Pending';
}

export interface MarketCatalyst {
  title: string;
  category: 'Earnings' | 'AI / Product' | 'Macro' | 'Regulatory' | 'Guidance';
  impact: 'Bullish' | 'Neutral' | 'Bearish';
  timeHorizon: string;
  description: string;
}

export interface EnrichedNews {
  title: string;
  publisher: string;
  link: string;
  publishedAt?: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  summary?: string;
}

export interface CandleData {
  time: string;
  date?: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  ema20?: (number | null)[];
  ema50?: (number | null)[];
  rsi14?: number;
  atr14?: number;
  vwap?: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  rangePositionPercent?: number; // 0 - 100 where spot sits in 52W range
}

export interface PatternPivot {
  label: string;
  time: string;
  price: number;
  type: 'low' | 'high' | 'breakout' | 'retest';
  index?: number;
}

export interface PatternTrendline {
  type: 'resistance' | 'support' | 'neckline' | 'target';
  start: { time: string; price: number };
  end: { time: string; price: number };
  startIndex?: number;
  endIndex?: number;
  startPrice?: number;
  endPrice?: number;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface DetectedPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  status: 'Confirmed Breakout' | 'Consolidating in Pattern' | 'Testing Key Support' | 'Approaching Resistance' | 'Pattern Invalidation Risk';
  confidenceScore: number; // 0 - 100
  description: string;
  breakoutTrigger: string;
  targetPrice: string;
  invalidationPrice: string;
  pivots: PatternPivot[];
  keyPivots?: PatternPivot[];
  trendlines: PatternTrendline[];
}

export interface StrategyChecklistItem {
  criterion: string;
  passed: boolean;
  status?: 'PASS' | 'WATCH' | 'FAIL';
  details: string;
}

export interface TradeStrategy {
  direction: 'LONG' | 'SHORT' | 'NEUTRAL_WAIT';
  strategyName: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'AVOID';
  executionTrigger: string; // "Wait for 1H candle close above $X..."
  invalidationTrigger: string; // "Immediate stop-out if 4H candle closes below $Y..."
  antiTrapWarning: string; // "Do not chase. If price rejects at $X, wait for pullback to $Y."
  confluenceScore: number; // 0 - 100
  checklist: StrategyChecklistItem[];
}

export interface ResearchReport {
  ticker: string;
  companyName: string;
  bitgetTokenSymbol?: string;
  currentPrice: string;
  currency: string;
  priceChangeContext: string;
  asOf: string;
  thesis: string;
  technicalRead: TechnicalRead;
  suggestedEntry: SuggestedEntry;
  takeProfitLevels: TakeProfitLevel[];
  stopLoss: StopLossLevel;
  riskRewardRatio: string;
  confidence: ConfidenceLevel;
  confidenceReasoning: string;
  earningsInfo?: EarningsInfo;
  catalysts?: MarketCatalyst[];
  enrichedNews?: EnrichedNews[];
  sources: string[];
  groundingSources: GroundingSource[];
  dataStatus: DataStatus;
  dataNotes?: string;
  timestamp: number;
  
  // Enhanced chart & strategy capabilities
  chartCandles?: CandleData[];
  chartRange?: string;
  indicators?: TechnicalIndicators;
  detectedPattern?: DetectedPattern;
  strategy?: TradeStrategy;
}

export interface HistoryItem {
  id: string;
  ticker: string;
  companyName: string;
  currentPrice: string;
  confidence: ConfidenceLevel;
  trendDirection: string;
  timestamp: number;
  report: ResearchReport;
}

