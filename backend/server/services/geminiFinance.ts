import { GoogleGenerativeAI } from '@google/generative-ai';
import { Asset, SearchResponse, AssetData, DateRange } from '../../client/src/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = "gemini-1.5-pro";

/**
 * Initialize the Gemini API client
 */
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Search for assets using Gemini API
 */
export async function searchWithGemini(query: string): Promise<SearchResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Make sure GEMINI_API_KEY is set in environment variables.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const searchQuery = `
      Generate a JSON list of financial assets matching the search term "${query}".
      Include stocks (US and Indian), ETFs, cryptocurrencies, and indices.
      Results should be categorized by type.
      Especially include Indian stocks like TCS, Tata Motors, Reliance, etc. if the query mentions them.
      
      Return ONLY a valid JSON response with the following structure:
      {
        "stocks": [{"symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "exchange": "NASDAQ"}, ...],
        "etfs": [{"symbol": "SPY", "name": "SPDR S&P 500 ETF Trust", "type": "etf", "exchange": "NYSE"}, ...],
        "crypto": [{"symbol": "BTC-USD", "name": "Bitcoin USD", "type": "crypto", "exchange": "Crypto"}, ...],
        "indices": [{"symbol": "^GSPC", "name": "S&P 500", "type": "index", "exchange": "SNP"}, ...]
      }
      
      For Indian stocks, use the format SYMBOL.NS (e.g., "TCS.NS", "RELIANCE.NS", etc.)
      Limit results to 5 items per category that best match the query.
    `;

    const result = await model.generateContent(searchQuery);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from Gemini API');
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]);
    
    return {
      stocks: Array.isArray(jsonResponse.stocks) ? jsonResponse.stocks : [],
      etfs: Array.isArray(jsonResponse.etfs) ? jsonResponse.etfs : [],
      crypto: Array.isArray(jsonResponse.crypto) ? jsonResponse.crypto : [],
      indices: Array.isArray(jsonResponse.indices) ? jsonResponse.indices : []
    };
  } catch (error) {
    console.error('Gemini API search error:', error);
    throw new Error('Failed to search for assets via Gemini API');
  }
}

/**
 * Get historical price data for assets through Gemini API
 */
export async function getHistoricalDataWithGemini(
  symbols: string[],
  dateRange: DateRange
): Promise<AssetData[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Make sure GEMINI_API_KEY is set in environment variables.');
  }

  if (symbols.length === 0) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const results: AssetData[] = [];

    for (const symbol of symbols) {
      const historyQuery = `
        Generate historical price data for the asset with symbol "${symbol}" from ${dateRange.startDate} to ${dateRange.endDate}.
        
        Return ONLY a valid JSON array of objects with the following structure:
        {
          "symbol": "${symbol}",
          "name": "Full company or asset name",
          "prices": [price1, price2, price3, ...],
          "dates": ["YYYY-MM-DD", "YYYY-MM-DD", "YYYY-MM-DD", ...]
        }
        
        Ensure the dates array and prices array are of the same length, with dates in ascending order.
        Include a representative price for each day in the date range (closing price).
        If the exact data is unavailable, provide a realistic approximation based on known market behavior for this asset.
        For weekends or holidays when markets are closed, interpolate data or omit those dates.
        
        Use realistic price levels for the asset during the specified time period.
        If it's a well-known asset, reflect any major price movements that occurred during that time.
      `;

      const result = await model.generateContent(historyQuery);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Failed to parse JSON response from Gemini API for symbol ${symbol}`);
      }
      
      const assetData = JSON.parse(jsonMatch[0]);
      
      // Validate the data structure
      if (!assetData.symbol || !Array.isArray(assetData.prices) || !Array.isArray(assetData.dates)) {
        throw new Error(`Invalid data structure in Gemini API response for symbol ${symbol}`);
      }
      
      // Ensure the arrays are of the same length
      const minLength = Math.min(assetData.prices.length, assetData.dates.length);
      assetData.prices = assetData.prices.slice(0, minLength);
      assetData.dates = assetData.dates.slice(0, minLength);
      
      results.push(assetData);
    }

    return results;
  } catch (error) {
    console.error('Gemini API historical data error:', error);
    throw new Error('Failed to fetch historical data via Gemini API');
  }
}

/**
 * Get portfolio analysis insights through Gemini
 */
export async function getPortfolioInsights(
  assets: Array<{ symbol: string; name: string; weight: number }>,
  performanceData: any
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Make sure GEMINI_API_KEY is set in environment variables.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const portfolioDescription = assets
      .map(asset => `${asset.name} (${asset.symbol}): ${asset.weight}%`)
      .join('\n');

    const performanceMetrics = `
      Portfolio Performance:
      - Annual Return: ${performanceData.summary.annualReturn.toFixed(2)}%
      - Risk (Volatility): ${performanceData.summary.risk.toFixed(2)}%
      - Sharpe Ratio: ${performanceData.summary.sharpeRatio.toFixed(2)}
      - Maximum Drawdown: ${performanceData.summary.maxDrawdown.toFixed(2)}%
    `;

    const insightsQuery = `
      Analyze the following investment portfolio and provide strategic insights:
      
      Portfolio Composition:
      ${portfolioDescription}
      
      ${performanceMetrics}
      
      Provide a concise analysis (250-300 words) covering:
      1. Overall portfolio evaluation
      2. Risk assessment
      3. Diversification analysis
      4. Strengths and weaknesses
      5. 2-3 specific, actionable recommendations for optimization
      
      Focus on practical advice that could improve performance or reduce risk.
      If the portfolio has Indian stocks (symbols ending with .NS), include specific insights about the Indian market.
      Use clear, professional language. Avoid generic advice.
    `;

    const result = await model.generateContent(insightsQuery);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API insights error:', error);
    return "Unable to generate portfolio insights at this time. Please try again later.";
  }
}
