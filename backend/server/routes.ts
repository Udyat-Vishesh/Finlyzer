import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchYahooFinance, getHistoricalData } from "./services/yahooFinance";
import { searchWithGemini, getHistoricalDataWithGemini, getPortfolioInsights } from "./services/geminiFinance";
import { analyzePortfolio } from "./services/portfolioAnalysis";

// Environment flag to choose data source
const USE_GEMINI_API = process.env.GEMINI_API_KEY ? true : false;

export async function registerRoutes(app: Express): Promise<Server> {
  // Search for assets (stocks, ETFs, crypto, indices)
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ 
          error: "Search query must be at least 2 characters" 
        });
      }
      
      let results;
      if (USE_GEMINI_API) {
        results = await searchWithGemini(query);
      } else {
        results = await searchYahooFinance(query);
      }
      
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ 
        error: "Failed to search for assets",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get historical data for assets
  app.get('/api/assets', async (req, res) => {
    try {
      const symbols = (req.query.symbols as string || '').split(',').filter(Boolean);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (symbols.length === 0) {
        return res.status(400).json({ error: "No symbols provided" });
      }
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }
      
      let data;
      if (USE_GEMINI_API) {
        data = await getHistoricalDataWithGemini(symbols, { startDate, endDate });
      } else {
        data = await getHistoricalData(symbols, startDate, endDate);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Asset data error:', error);
      res.status(500).json({ 
        error: "Failed to fetch asset data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Analyze portfolio
  app.post('/api/analyze', async (req, res) => {
    try {
      const { assets, dateRange } = req.body;
      
      if (!assets || !Array.isArray(assets) || assets.length === 0) {
        return res.status(400).json({ error: "Assets are required and must be non-empty array" });
      }
      
      if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }
      
      // Validate portfolio weights
      const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.1) {
        return res.status(400).json({ error: "Portfolio weights must sum to 100%" });
      }
      
      const analysis = await analyzePortfolio(assets, dateRange);
      res.json(analysis);
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      res.status(500).json({ 
        error: "Failed to analyze portfolio",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get portfolio AI insights
  app.post('/api/insights', async (req, res) => {
    try {
      const { assets, analysisData } = req.body;
      
      if (!assets || !Array.isArray(assets) || assets.length === 0) {
        return res.status(400).json({ error: "Assets are required and must be non-empty array" });
      }
      
      if (!analysisData) {
        return res.status(400).json({ error: "Analysis data is required" });
      }
      
      // Only available with Gemini API
      if (!USE_GEMINI_API) {
        return res.status(501).json({ 
          error: "Portfolio insights require Gemini API",
          message: "This feature requires the GEMINI_API_KEY environment variable to be set."
        });
      }
      
      const insights = await getPortfolioInsights(assets, analysisData);
      res.json({ insights });
    } catch (error) {
      console.error('Portfolio insights error:', error);
      res.status(500).json({ 
        error: "Failed to generate portfolio insights",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Check data source API status
  app.get('/api/status', (req, res) => {
    res.json({ 
      dataSource: USE_GEMINI_API ? 'gemini' : 'yahoo',
      ready: true,
      message: USE_GEMINI_API 
        ? 'Using Gemini API for real financial data'
        : 'Using Yahoo Finance API with mock data fallback'
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
