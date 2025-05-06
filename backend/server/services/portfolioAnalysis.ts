import { SelectedAsset, DateRange, PortfolioAnalysisResponse, AssetPerformance } from '../../client/src/lib/types';
import { getHistoricalData } from './yahooFinance';

// Risk-free rate for Sharpe ratio calculation (approximate 3-month T-bill rate)
const RISK_FREE_RATE = 0.05; // 5%

// Calculate daily returns from price series
function calculateDailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] / prices[i - 1]) - 1;
    returns.push(dailyReturn);
  }
  return returns;
}

// Calculate mean (average) of an array of numbers
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Calculate standard deviation of an array of numbers
function calculateStdDev(values: number[], mean?: number): number {
  if (values.length <= 1) return 0;
  
  const avg = mean !== undefined ? mean : calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
  const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / (values.length - 1);
  
  return Math.sqrt(variance);
}

// Calculate annualized return from daily returns
function annualizeReturn(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0;
  
  const meanDailyReturn = calculateMean(dailyReturns);
  // Assuming 252 trading days in a year
  return (Math.pow(1 + meanDailyReturn, 252) - 1) * 100;
}

// Calculate annualized risk (standard deviation) from daily returns
function annualizeRisk(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0;
  
  const dailyStdDev = calculateStdDev(dailyReturns);
  // Assuming 252 trading days in a year
  return dailyStdDev * Math.sqrt(252) * 100;
}

// Calculate Sharpe ratio
function calculateSharpeRatio(annualizedReturn: number, annualizedRisk: number): number {
  if (annualizedRisk === 0) return 0;
  return (annualizedReturn - RISK_FREE_RATE) / annualizedRisk;
}

// Calculate maximum drawdown
function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length <= 1) return 0;
  
  let maxDrawdown = 0;
  let peak = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    } else {
      const drawdown = (peak - prices[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown * 100; // Convert to percentage
}

// Calculate portfolio prices based on asset prices and weights
function calculatePortfolioPrices(
  assetPrices: Array<number[]>,
  weights: number[]
): number[] {
  if (assetPrices.length === 0 || assetPrices[0].length === 0) {
    return [];
  }
  
  // Find the minimum length of all price series
  const minLength = Math.min(...assetPrices.map(prices => prices.length));
  
  // Normalize weights (ensure they sum to 1)
  const normalizedWeights = weights.map(w => w / 100);
  
  // Create portfolio price series, starting at 100
  const portfolioPrices: number[] = [];
  
  // For each time period
  for (let i = 0; i < minLength; i++) {
    let portfolioValue = 0;
    
    // Calculate value contribution of each asset for this period
    for (let j = 0; j < assetPrices.length; j++) {
      if (i === 0) {
        // First period, use initial allocation 
        portfolioValue += 100 * normalizedWeights[j];
      } else {
        // Subsequent periods, scale by price change
        const priceChange = assetPrices[j][i] / assetPrices[j][0];
        portfolioValue += 100 * normalizedWeights[j] * priceChange;
      }
    }
    
    portfolioPrices.push(portfolioValue);
  }
  
  return portfolioPrices;
}

// Normalize a price series to start at 100
function normalizePrices(prices: number[]): number[] {
  if (prices.length === 0) return [];
  const initialPrice = prices[0];
  return prices.map(price => (price / initialPrice) * 100);
}

// Calculate the contribution of each asset to portfolio return
function calculateContribution(
  assetReturns: number[],
  assetWeights: number[]
): number[] {
  const portReturn = assetReturns.reduce((sum, ret, i) => sum + ret * assetWeights[i] / 100, 0);
  if (portReturn === 0) return assetWeights.map(() => 0);
  
  return assetReturns.map((ret, i) => {
    const contribution = (ret * assetWeights[i] / 100) / portReturn * 100;
    return isNaN(contribution) ? 0 : contribution;
  });
}

export async function analyzePortfolio(
  assets: SelectedAsset[],
  dateRange: DateRange
): Promise<PortfolioAnalysisResponse> {
  // Fetch historical data for all assets
  const symbols = assets.map(asset => asset.symbol);
  const assetData = await getHistoricalData(symbols, dateRange.startDate, dateRange.endDate);
  
  // Get S&P 500 as benchmark
  const benchmarkData = await getHistoricalData(['SPY'], dateRange.startDate, dateRange.endDate);
  const benchmarkPrices = benchmarkData[0]?.prices || [];
  const dates = benchmarkData[0]?.dates || [];
  
  // Calculate asset metrics
  const assetPerformance: AssetPerformance[] = [];
  const assetReturns: number[] = [];
  const assetRisks: number[] = [];
  const assetPrices: Array<number[]> = [];
  const assetWeights = assets.map(asset => asset.weight);
  
  for (const asset of assets) {
    const data = assetData.find(a => a.symbol === asset.symbol);
    if (!data || data.prices.length <= 1) {
      throw new Error(`Insufficient price data for ${asset.symbol}`);
    }
    
    const dailyReturns = calculateDailyReturns(data.prices);
    const annualReturn = annualizeReturn(dailyReturns);
    const risk = annualizeRisk(dailyReturns);
    const sharpeRatio = calculateSharpeRatio(annualReturn, risk);
    
    assetReturns.push(annualReturn);
    assetRisks.push(risk);
    assetPrices.push(data.prices);
    
    assetPerformance.push({
      symbol: asset.symbol,
      name: asset.name,
      weight: asset.weight,
      annualReturn,
      risk,
      sharpeRatio,
      contribution: 0, // Placeholder, calculated below
    });
  }
  
  // Calculate portfolio prices and metrics
  const portfolioPrices = calculatePortfolioPrices(assetPrices, assetWeights);
  const portfolioDailyReturns = calculateDailyReturns(portfolioPrices);
  const portfolioReturn = annualizeReturn(portfolioDailyReturns);
  const portfolioRisk = annualizeRisk(portfolioDailyReturns);
  const portfolioSharpe = calculateSharpeRatio(portfolioReturn, portfolioRisk);
  const maxDrawdown = calculateMaxDrawdown(portfolioPrices);
  
  // Calculate contributions to return
  const contributions = calculateContribution(assetReturns, assetWeights);
  assetPerformance.forEach((asset, i) => {
    asset.contribution = contributions[i];
  });
  
  // Normalize price series for comparison
  const normalizedPortfolioPrices = normalizePrices(portfolioPrices);
  const normalizedBenchmarkPrices = normalizePrices(benchmarkPrices);
  
  // Prepare risk-return data for scatter plot
  const riskReturnData = {
    assets: assetPerformance.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      risk: asset.risk,
      return: asset.annualReturn,
    })),
    portfolio: {
      risk: portfolioRisk,
      return: portfolioReturn,
    },
  };
  
  return {
    summary: {
      annualReturn: portfolioReturn,
      risk: portfolioRisk,
      sharpeRatio: portfolioSharpe,
      maxDrawdown: -maxDrawdown, // Convert to negative number for display
    },
    assetPerformance,
    timeSeriesData: {
      dates,
      portfolioValues: normalizedPortfolioPrices,
      benchmarkValues: normalizedBenchmarkPrices,
    },
    riskReturnData,
  };
}
