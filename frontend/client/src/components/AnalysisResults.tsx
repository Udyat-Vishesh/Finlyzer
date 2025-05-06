import { Card, CardContent } from "@/components/ui/card";
import { PortfolioAnalysisResponse } from "@/lib/types";
import { formatPercentage, formatRatio, getValueColorClass } from "@/lib/utils/finance";
import AssetPerformanceTable from "./AssetPerformanceTable";
import PerformanceChart from "./charts/PerformanceChart";
import RiskReturnChart from "./charts/RiskReturnChart";

interface AnalysisResultsProps {
  analysisData: PortfolioAnalysisResponse;
}

export default function AnalysisResults({ analysisData }: AnalysisResultsProps) {
  const { summary, assetPerformance, timeSeriesData, riskReturnData } = analysisData;

  return (
    <div>
      <Card className="bg-white shadow rounded-lg p-6 mb-6">
        <CardContent className="p-0">
          <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-gray-500 mb-1">Annual Return</div>
              <div className={`text-2xl font-bold ${getValueColorClass(summary.annualReturn)}`}>
                {formatPercentage(summary.annualReturn)}
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-gray-500 mb-1">Risk (Std Dev)</div>
              <div className="text-2xl font-bold text-secondary">
                {formatPercentage(summary.risk, false)}
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-gray-500 mb-1">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-primary">
                {formatRatio(summary.sharpeRatio)}
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-gray-500 mb-1">Max Drawdown</div>
              <div className="text-2xl font-bold text-negative">
                {formatPercentage(summary.maxDrawdown)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white shadow rounded-lg p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
            <div className="chart-container h-[300px]">
              <PerformanceChart data={timeSeriesData} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-lg p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold mb-4">Risk vs. Return</h3>
            <div className="chart-container h-[300px]">
              <RiskReturnChart data={riskReturnData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow rounded-lg p-6 mb-6">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold mb-4">Asset Performance</h3>
          <AssetPerformanceTable assetPerformance={assetPerformance} />
        </CardContent>
      </Card>

      <Card className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-primary">
        <CardContent className="p-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-primary text-xl h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                <path d="M12 2a10 10 0 0 1 10 10h-10V2z"/>
                <path d="M12 12 A4 4 0 0 1 8 8 A4 4 0 0 1 16 8 A4 4 0 0 1 12 12 z"/>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                AI-Powered Insights
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">Coming Soon</span>
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Our AI system will analyze your portfolio and provide personalized recommendations for risk management, diversification, and optimization based on market conditions and your investment goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
