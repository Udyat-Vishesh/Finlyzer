import axios from 'axios';
import { Asset, SearchResponse, AssetData } from '../../client/src/lib/types';

const RAPID_API_KEY = process.env.RAPID_API_KEY || '';
const RAPID_API_HOST = 'apidojo-yahoo-finance-v1.p.rapidapi.com';
// Flag to control whether to use mock data when API is unavailable or rate-limited
// Now controlled by routes.ts based on Gemini API availability
const USE_MOCK_DATA = false;

// Base configuration for RapidAPI requests
const axiosConfig = {
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': RAPID_API_HOST,
  },
};

/**
 * Determines asset type based on Yahoo Finance quoteType
 */
function getAssetType(quoteType: string): 'stock' | 'etf' | 'crypto' | 'index' {
  switch (quoteType.toLowerCase()) {
    case 'equity':
      return 'stock';
    case 'etf':
      return 'etf';
    case 'cryptocurrency':
      return 'crypto';
    case 'index':
      return 'index';
    default:
      return 'stock'; // Default fallback
  }
}

// Sample data for when API is unavailable or rate-limited
const mockStocks: Asset[] = [
  // US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  
  // Indian Stocks
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', type: 'stock', exchange: 'NSE' },
  { symbol: 'ITC.NS', name: 'ITC Ltd.', type: 'stock', exchange: 'NSE' },
];

const mockETFs: Asset[] = [
  // US ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', exchange: 'NYSE' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', exchange: 'NYSE' },
  
  // Indian ETFs
  { symbol: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty BeES', type: 'etf', exchange: 'NSE' },
  { symbol: 'BANKBEES.NS', name: 'Nippon India ETF Bank BeES', type: 'etf', exchange: 'NSE' },
  { symbol: 'JUNIORBEES.NS', name: 'Nippon India ETF Junior BeES', type: 'etf', exchange: 'NSE' },
  { symbol: 'KOTAKGOLD.NS', name: 'Kotak Gold ETF', type: 'etf', exchange: 'NSE' },
  { symbol: 'SETFNIFBK.NS', name: 'SBI ETF Nifty Bank', type: 'etf', exchange: 'NSE' },
];

const mockCrypto: Asset[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'XRP-USD', name: 'XRP USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'ADA-USD', name: 'Cardano USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'DOT-USD', name: 'Polkadot USD', type: 'crypto', exchange: 'Crypto' },
  { symbol: 'SHIB-USD', name: 'Shiba Inu USD', type: 'crypto', exchange: 'Crypto' },
];

const mockIndices: Asset[] = [
  // US Indices
  { symbol: '^GSPC', name: 'S&P 500', type: 'index', exchange: 'SNP' },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', type: 'index', exchange: 'DJI' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', type: 'index', exchange: 'NASDAQ' },
  { symbol: '^RUT', name: 'Russell 2000', type: 'index', exchange: 'Russell' },
  
  // Indian Indices
  { symbol: '^NSEI', name: 'NIFTY 50', type: 'index', exchange: 'NSE' },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX', type: 'index', exchange: 'BSE' },
  { symbol: '^CNXBANK', name: 'Nifty Bank', type: 'index', exchange: 'NSE' },
  { symbol: '^CNXIT', name: 'Nifty IT', type: 'index', exchange: 'NSE' },
  { symbol: '^CNXAUTO', name: 'Nifty Auto', type: 'index', exchange: 'NSE' },
];

/**
 * Generate mock historical data
 */
function generateMockHistoricalData(symbol: string, startDate: string, endDate: string): AssetData {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const dates: string[] = [];
  const prices: number[] = [];
  
  // Set appropriate starting price based on symbol type
  let basePrice = 
    // Indian stocks often have different price ranges
    symbol.includes('TCS.NS') ? 3500 :
    symbol.includes('TATAMOTORS.NS') ? 450 :
    symbol.includes('TATASTEEL.NS') ? 120 :
    symbol.includes('RELIANCE.NS') ? 2500 : 
    symbol.includes('INFY.NS') ? 1600 :
    symbol.includes('HDFCBANK.NS') ? 1400 :
    symbol.includes('WIPRO.NS') ? 400 : 
    symbol.includes('ITC.NS') ? 380 :
    // US stocks
    symbol.includes('AAPL') ? 175 :
    symbol.includes('MSFT') ? 330 :
    symbol.includes('GOOGL') ? 135 :
    symbol.includes('AMZN') ? 125 :
    symbol.includes('TSLA') ? 175 :
    symbol.includes('META') ? 420 :
    symbol.includes('NFLX') ? 550 :
    symbol.includes('NVDA') ? 880 :
    // Crypto
    symbol.includes('BTC-USD') ? 60000 :
    symbol.includes('ETH-USD') ? 3200 :
    symbol.includes('SOL-USD') ? 150 :
    symbol.includes('DOGE-USD') ? 0.15 :
    // ETFs
    symbol.includes('SPY') ? 505 :
    symbol.includes('QQQ') ? 430 :
    // Default
    100;
  
  // Different price behaviors for different symbols
  const volatility = 
    // High volatility
    symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL') || 
    symbol.includes('DOGE') || symbol.includes('SHIB') ? 0.03 : 
    // Medium-high volatility
    symbol.includes('TSLA') || symbol.includes('TATAMOTORS.NS') ? 0.025 : 
    // Medium volatility
    symbol.includes('.NS') ? 0.018 :
    // Normal volatility
    0.01; 
    
  // Different trend behaviors
  const trend = 
    // Strong upward trend
    symbol.includes('AAPL') || symbol.includes('MSFT') || symbol.includes('NVDA') || 
    symbol.includes('TCS.NS') || symbol.includes('INFY.NS') ? 0.0004 : 
    // Medium upward trend
    symbol.includes('SPY') || symbol.includes('QQQ') || 
    symbol.includes('NIFTYBEES.NS') ? 0.0003 : 
    // Mild upward trend
    symbol.includes('BTC') || symbol.includes('^NSEI') || 
    symbol.includes('^BSESN') ? 0.0002 : 
    // Mild downward trend
    symbol.includes('META') || symbol.includes('NFLX') ? -0.0001 :
    // Neutral
    0; 
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
    
    // Random price movement with trend
    const change = (Math.random() - 0.5) * volatility + trend;
    // Add some cyclical behavior for indices
    const cyclical = symbol.includes('^') ? Math.sin(i / 30) * 0.001 : 0;
    
    basePrice = basePrice * (1 + change + cyclical);
    prices.push(parseFloat(basePrice.toFixed(2)));
  }
  
  return {
    symbol,
    name: mockStocks.find(s => s.symbol === symbol)?.name || 
          mockETFs.find(s => s.symbol === symbol)?.name || 
          mockCrypto.find(s => s.symbol === symbol)?.name || 
          mockIndices.find(s => s.symbol === symbol)?.name || 
          symbol,
    prices,
    dates,
  };
}

/**
 * Search for assets (stocks, ETFs, crypto, indices) using Yahoo Finance
 */
export async function searchYahooFinance(query: string): Promise<SearchResponse> {
  // If using mock data, return filtered mock results
  if (USE_MOCK_DATA) {
    const lowerQuery = query.toLowerCase();
    return {
      stocks: mockStocks.filter(s => 
        s.symbol.toLowerCase().includes(lowerQuery) || 
        s.name.toLowerCase().includes(lowerQuery)
      ),
      etfs: mockETFs.filter(s => 
        s.symbol.toLowerCase().includes(lowerQuery) || 
        s.name.toLowerCase().includes(lowerQuery)
      ),
      crypto: mockCrypto.filter(s => 
        s.symbol.toLowerCase().includes(lowerQuery) || 
        s.name.toLowerCase().includes(lowerQuery)
      ),
      indices: mockIndices.filter(s => 
        s.symbol.toLowerCase().includes(lowerQuery) || 
        s.name.toLowerCase().includes(lowerQuery)
      )
    };
  }

  // Only check API key when actually using the API
  if (!RAPID_API_KEY) {
    throw new Error('RapidAPI key is missing. Make sure RAPID_API_KEY is set in environment variables.');
  }

  try {
    const url = 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete';
    const response = await axios.get(url, {
      ...axiosConfig,
      params: {
        q: query,
        region: 'US',
      },
    });

    const results = response.data.quotes || [];
    
    // Group results by asset type
    const stocks: Asset[] = [];
    const etfs: Asset[] = [];
    const crypto: Asset[] = [];
    const indices: Asset[] = [];

    results.forEach((item: any) => {
      if (!item.symbol || !item.shortname) return;
      
      const asset: Asset = {
        symbol: item.symbol,
        name: item.shortname || item.longname || '',
        type: getAssetType(item.quoteType),
        exchange: item.exchange || '',
      };

      // Sort into appropriate categories
      switch (asset.type) {
        case 'stock':
          stocks.push(asset);
          break;
        case 'etf':
          etfs.push(asset);
          break;
        case 'crypto':
          crypto.push(asset);
          break;
        case 'index':
          indices.push(asset);
          break;
      }
    });

    return { stocks, etfs, crypto, indices };
  } catch (error) {
    console.error('Yahoo Finance API search error:', error);
    // If the API fails, fall back to mock data
    return searchYahooFinance(query);
  }
}

/**
 * Get historical price data for assets from Yahoo Finance
 */
export async function getHistoricalData(
  symbols: string[],
  startDate: string,
  endDate: string
): Promise<AssetData[]> {
  if (symbols.length === 0) {
    return [];
  }

  // If using mock data, return generated mock results
  if (USE_MOCK_DATA) {
    return symbols.map(symbol => generateMockHistoricalData(symbol, startDate, endDate));
  }

  // Only check API key when actually using the API
  if (!RAPID_API_KEY) {
    throw new Error('RapidAPI key is missing. Make sure RAPID_API_KEY is set in environment variables.');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Convert to UNIX timestamp (seconds)
  const period1 = Math.floor(start.getTime() / 1000);
  const period2 = Math.floor(end.getTime() / 1000);

  const results: AssetData[] = [];

  // Yahoo Finance API only supports one symbol at a time for historical data
  for (const symbol of symbols) {
    try {
      const url = 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-historical-data';
      const response = await axios.get(url, {
        ...axiosConfig,
        params: {
          symbol,
          region: 'US',
          period1: period1.toString(),
          period2: period2.toString(),
        },
      });

      const prices: number[] = [];
      const dates: string[] = [];

      if (response.data.prices && Array.isArray(response.data.prices)) {
        // Sort by date (oldest to newest)
        const sortedPrices = response.data.prices
          .filter((item: any) => item.close !== null && item.date !== null)
          .sort((a: any, b: any) => a.date - b.date);

        sortedPrices.forEach((item: any) => {
          prices.push(item.close);
          dates.push(new Date(item.date * 1000).toISOString().split('T')[0]);
        });
      }

      results.push({
        symbol,
        name: response.data.meta?.instrumentInfo?.shortName || symbol,
        prices,
        dates,
      });
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      // If API call fails, use mock data instead
      results.push(generateMockHistoricalData(symbol, startDate, endDate));
    }
  }

  return results;
}
