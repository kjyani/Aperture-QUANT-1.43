import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, ArrowRight, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
  currentTicker?: string;
}

interface StockItem {
  ticker: string;
  name: string;
  category: 'AI & Semi' | 'Mega Tech' | 'Crypto / Beta' | 'Indices' | 'Growth';
  rToken: string;
}

export const BITGET_TOKENIZED_EQUITIES: StockItem[] = [
  // AI & Semiconductors
  { ticker: 'NVDA', name: 'NVIDIA Corp', category: 'AI & Semi', rToken: 'rNVDA' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', category: 'AI & Semi', rToken: 'rAMD' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'AI & Semi', rToken: 'rTSM' },
  { ticker: 'AVGO', name: 'Broadcom Inc', category: 'AI & Semi', rToken: 'rAVGO' },
  { ticker: 'ASML', name: 'ASML Holding NV', category: 'AI & Semi', rToken: 'rASML' },
  { ticker: 'INTC', name: 'Intel Corp', category: 'AI & Semi', rToken: 'rINTC' },
  { ticker: 'MU', name: 'Micron Technology', category: 'AI & Semi', rToken: 'rMU' },
  { ticker: 'ARM', name: 'Arm Holdings', category: 'AI & Semi', rToken: 'rARM' },
  { ticker: 'QCOM', name: 'Qualcomm Inc', category: 'AI & Semi', rToken: 'rQCOM' },
  { ticker: 'MRVL', name: 'Marvell Technology', category: 'AI & Semi', rToken: 'rMRVL' },

  // Mega Tech
  { ticker: 'AAPL', name: 'Apple Inc', category: 'Mega Tech', rToken: 'rAAPL' },
  { ticker: 'MSFT', name: 'Microsoft Corp', category: 'Mega Tech', rToken: 'rMSFT' },
  { ticker: 'GOOGL', name: 'Alphabet Inc', category: 'Mega Tech', rToken: 'rGOOGL' },
  { ticker: 'AMZN', name: 'Amazon.com Inc', category: 'Mega Tech', rToken: 'rAMZN' },
  { ticker: 'META', name: 'Meta Platforms', category: 'Mega Tech', rToken: 'rMETA' },
  { ticker: 'TSLA', name: 'Tesla Inc', category: 'Mega Tech', rToken: 'rTSLA' },
  { ticker: 'NFLX', name: 'Netflix Inc', category: 'Mega Tech', rToken: 'rNFLX' },

  // Crypto / High-Beta
  { ticker: 'MSTR', name: 'MicroStrategy Inc', category: 'Crypto / Beta', rToken: 'rMSTR' },
  { ticker: 'COIN', name: 'Coinbase Global', category: 'Crypto / Beta', rToken: 'rCOIN' },
  { ticker: 'PLTR', name: 'Palantir Technologies', category: 'Crypto / Beta', rToken: 'rPLTR' },
  { ticker: 'HOOD', name: 'Robinhood Markets', category: 'Crypto / Beta', rToken: 'rHOOD' },
  { ticker: 'MARA', name: 'MARA Holdings', category: 'Crypto / Beta', rToken: 'rMARA' },
  { ticker: 'RIOT', name: 'Riot Platforms', category: 'Crypto / Beta', rToken: 'rRIOT' },

  // Indices & Benchmark ETFs
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', category: 'Indices', rToken: 'rQQQ' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Indices', rToken: 'rSPY' },
  { ticker: 'IWM', name: 'iShares Russell 2000', category: 'Indices', rToken: 'rIWM' },
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF', category: 'Indices', rToken: 'rSMH' },

  // Growth & Cloud
  { ticker: 'CRM', name: 'Salesforce Inc', category: 'Growth', rToken: 'rCRM' },
  { ticker: 'UBER', name: 'Uber Technologies', category: 'Growth', rToken: 'rUBER' },
  { ticker: 'DIS', name: 'Walt Disney Co', category: 'Growth', rToken: 'rDIS' },
  { ticker: 'BABA', name: 'Alibaba Group', category: 'Growth', rToken: 'rBABA' },
  { ticker: 'SNOW', name: 'Snowflake Inc', category: 'Growth', rToken: 'rSNOW' },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings', category: 'Growth', rToken: 'rCRWD' },
];

const CATEGORIES = ['All', 'AI & Semi', 'Mega Tech', 'Crypto / Beta', 'Indices', 'Growth'] as const;

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, currentTicker }) => {
  const [tickerInput, setTickerInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Synchronize tickerInput with active currentTicker when selected from Market Pulse, History, or chips
  useEffect(() => {
    if (currentTicker) {
      setTickerInput(currentTicker);
    }
  }, [currentTicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tickerInput.trim().toUpperCase().replace(/^[$#]/, '');
    if (trimmed && !isLoading) {
      onSearch(trimmed);
    }
  };

  const handleSelectTicker = (ticker: string) => {
    if (!isLoading) {
      setTickerInput(ticker);
      onSearch(ticker);
    }
  };

  // Filter tokenized equities by selected category. Always display category items reliably.
  const filteredEquities = useMemo(() => {
    if (activeCategory === 'All') {
      return BITGET_TOKENIZED_EQUITIES;
    }
    return BITGET_TOKENIZED_EQUITIES.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center rounded-2xl apple-glass-input focus-within:border-sky-500/50 transition-all duration-200">
          <div className="pl-4 sm:pl-5 text-slate-400 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <input
            type="text"
            id="ticker-search-input"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            placeholder="Search ticker or asset (e.g. NVDA, AAPL, TSLA, MSTR, QQQ)..."
            disabled={isLoading}
            autoFocus
            className="w-full py-4 pl-3.5 pr-36 text-base sm:text-lg font-mono-numbers font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-hidden bg-transparent tracking-wide uppercase"
          />

          <div className="absolute right-2 sm:right-2.5 flex items-center space-x-1.5">
            {tickerInput && !isLoading && (
              <button
                type="button"
                onClick={() => setTickerInput('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              id="analyze-ticker-button"
              disabled={!tickerInput.trim() || isLoading}
              className="inline-flex items-center space-x-1.5 px-4 sm:px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs font-mono tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <span>{isLoading ? 'ANALYZING' : 'RESEARCH'}</span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </form>

      {/* Asset Explorer Glass Panel */}
      <div className="rounded-2xl apple-glass p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-900/[0.06] text-xs">
          <div className="flex items-center space-x-2 text-slate-600 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]"></span>
            <span className="uppercase tracking-wider font-semibold text-slate-700">
              Tokenized Equities & ETFs
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                id={`cat-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  activeCategory === cat
                    ? 'bg-white text-slate-900 border border-white/90 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Badges Grid */}
        <div className="mt-3 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {filteredEquities.map((item) => {
            const isSelected = currentTicker === item.ticker || currentTicker === item.rToken;
            return (
              <button
                key={item.ticker}
                type="button"
                id={`chip-${item.ticker}`}
                onClick={() => handleSelectTicker(item.ticker)}
                disabled={isLoading}
                title={`${item.name} (${item.rToken})`}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-white/60 hover:bg-white/95 text-slate-800 hover:text-slate-950 border border-white/80 shadow-xs'
                }`}
              >
                <span className="font-semibold">${item.ticker}</span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.rToken}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
