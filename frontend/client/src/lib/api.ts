import { apiRequest } from "@/lib/queryClient";
import { 
  Asset, 
  AssetData, 
  DateRange, 
  PortfolioAnalysisResponse, 
  SearchResponse, 
  SelectedAsset 
} from "./types";

export async function searchAssets(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { stocks: [], etfs: [], crypto: [], indices: [] };
  }
  
  const response = await apiRequest('GET', `/api/search?q=${encodeURIComponent(query)}`, undefined);
  return await response.json();
}

export async function getAssetData(
  assets: SelectedAsset[], 
  dateRange: DateRange
): Promise<AssetData[]> {
  const symbols = assets.map(asset => asset.symbol).join(',');
  const response = await apiRequest(
    'GET', 
    `/api/assets?symbols=${encodeURIComponent(symbols)}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
    undefined
  );
  return await response.json();
}

export async function getApiStatus(): Promise<{ dataSource: string; ready: boolean; message: string }> {
  const response = await apiRequest('GET', '/api/status', undefined);
  return await response.json();
}

export async function getPortfolioInsights(
  assets: SelectedAsset[],
  analysisData: PortfolioAnalysisResponse
): Promise<{ insights: string }> {
  const response = await apiRequest(
    'POST',
    '/api/insights',
    { assets, analysisData }
  );
  return await response.json();
}

export async function analyzePortfolio(
  assets: SelectedAsset[],
  dateRange: DateRange
): Promise<PortfolioAnalysisResponse> {
  const response = await apiRequest(
    'POST',
    '/api/analyze',
    { assets, dateRange }
  );
  return await response.json();
}
