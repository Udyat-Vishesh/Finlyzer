import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PortfolioBuilder from '@/components/PortfolioBuilder';
import AnalysisResults from '@/components/AnalysisResults';
import ApiStatus from '@/components/ApiStatus';
import PortfolioInsights from '@/components/PortfolioInsights';
import Spinner, { BarSpinner } from '@/components/ui/spinner';
import { DateRange, PortfolioAnalysisResponse, SelectedAsset } from '@/lib/types';
import { analyzePortfolio } from '@/lib/api';

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState<PortfolioAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (assets: SelectedAsset[], dateRange: DateRange) => {
    setIsAnalyzing(true);
    setSelectedAssets(assets); // Store selected assets for insights
    setSelectedDateRange(dateRange); // Store date range for reference
    
    try {
      const results = await analyzePortfolio(assets, dateRange);
      setAnalysisResults(results);
      
      toast({
        title: "Analysis complete",
        description: "Your portfolio analysis has been generated successfully.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your portfolio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow relative">
        {/* Full screen loading overlay during analysis */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <BarSpinner 
              size="lg" 
              text={`Analyzing portfolio of ${selectedAssets.length} assets...`} 
            />
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Finlyzer</h1>
            <ApiStatus />
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Build and analyze your investment portfolio with real-time data. 
              Compare stocks, ETFs, cryptocurrencies, and indices from global markets including Indian stocks.
              Track performance across any time period from days to decades.
            </p>
          </div>
          
          <PortfolioBuilder 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
          
          {analysisResults && (
            <div className="mt-12 relative">
              <AnalysisResults analysisData={analysisResults} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                  <PortfolioInsights
                    assets={selectedAssets}
                    analysisData={analysisResults}
                  />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                  <h3 className="text-xl font-medium mb-4 dark:text-gray-100">Analysis Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Annual Return</p>
                      <p className={`text-lg font-semibold ${analysisResults.summary.annualReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {analysisResults.summary.annualReturn >= 0 ? '+' : ''}{analysisResults.summary.annualReturn.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Risk (Volatility)</p>
                      <p className="text-lg font-semibold dark:text-gray-200">
                        {analysisResults.summary.risk.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</p>
                      <p className="text-lg font-semibold dark:text-gray-200">
                        {analysisResults.summary.sharpeRatio.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Maximum Drawdown</p>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {analysisResults.summary.maxDrawdown.toFixed(2)}%
                      </p>
                    </div>
                    <div className="pt-4 border-t dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Analysis based on data from {selectedAssets.length} assets 
                        {selectedDateRange && (
                          <span> from {new Date(selectedDateRange.startDate).toLocaleDateString()} to {new Date(selectedDateRange.endDate).toLocaleDateString()}</span>
                        )}.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Data provided through Gemini API or Yahoo Finance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
