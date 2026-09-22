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
}

export interface TakeProfitLevel {
  level: string;
  label: string;
  reasoning: string;
}

export interface StopLossLevel {
  level: string;
  reasoning: string;
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
