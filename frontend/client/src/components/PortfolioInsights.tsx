import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner, { BarSpinner } from '@/components/ui/spinner';
import { getPortfolioInsights } from '@/lib/api';
import { SelectedAsset, PortfolioAnalysisResponse } from '@/lib/types';
import { Lightbulb, BarChart3 } from 'lucide-react';

interface PortfolioInsightsProps {
  assets: SelectedAsset[];
  analysisData: PortfolioAnalysisResponse | null;
}

export default function PortfolioInsights({ assets, analysisData }: PortfolioInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!analysisData || assets.length === 0) {
      setError('No portfolio data available for insights');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getPortfolioInsights(assets, analysisData);
      
      if (data && data.insights) {
        setInsights(data.insights);
      } else {
        setError('Failed to generate insights');
      }
    } catch (err: any) {
      if (err.status === 501) {
        setError('AI-powered insights require Gemini API. Please set up the GEMINI_API_KEY environment variable.');
      } else {
        setError('An error occurred while generating portfolio insights');
        console.error('Portfolio insights error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          AI Portfolio Insights
        </CardTitle>
        <CardDescription>
          Get AI-powered analysis and recommendations for your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] relative">
        {/* Initial empty state */}
        {!insights && !loading && !error && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="mb-4 flex justify-center">
              <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="mb-2">Ready to analyze your portfolio with AI?</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click the button below to generate tailored insights based on your selected assets.
            </p>
          </div>
        )}

        {/* Loading state with spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <Spinner size="lg" text="Analyzing your portfolio with AI..." />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 border rounded-md bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Success state with insights */}
        {insights && !loading && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{insights}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={fetchInsights} 
          disabled={loading || !analysisData}
          className="w-full"
          size="lg"
        >
          {loading ? 'Generating insights...' : 'Generate Portfolio Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}