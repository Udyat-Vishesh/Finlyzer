export interface Asset {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'index';
  exchange?: string;
}

export interface AssetData {
  symbol: string;
  name: string;
  prices: number[];
  dates: string[];
}

export interface SelectedAsset extends Asset {
  weight: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AssetPerformance {
  symbol: string;
  name: string;
  weight: number;
  annualReturn: number;
  risk: number;
  sharpeRatio: number;
  contribution: number;
}

export interface PortfolioSummary {
  annualReturn: number;
  risk: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface PortfolioAnalysisResponse {
  summary: PortfolioSummary;
  assetPerformance: AssetPerformance[];
  timeSeriesData: {
    dates: string[];
    portfolioValues: number[];
    benchmarkValues: number[];
  };
  riskReturnData: {
    assets: Array<{
      symbol: string;
      name: string;
      risk: number;
      return: number;
    }>;
    portfolio: {
      risk: number;
      return: number;
    };
  };
}

export interface SearchResponse {
  stocks: Asset[];
  etfs: Asset[];
  crypto: Asset[];
  indices: Asset[];
}
