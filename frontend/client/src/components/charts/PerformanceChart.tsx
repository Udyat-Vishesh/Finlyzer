import { useMemo, useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine
} from "recharts";
import { Button } from "@/components/ui/button";

interface PerformanceChartProps {
  data: {
    dates: string[];
    portfolioValues: number[];
    benchmarkValues: number[];
  };
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const { dates, portfolioValues, benchmarkValues } = data;
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  
  // Calculate percentage changes from initial values
  const transformedChartData = useMemo(() => {
    if (dates.length === 0 || portfolioValues.length === 0 || benchmarkValues.length === 0) {
      return [];
    }
    
    const initialPortfolioValue = portfolioValues[0];
    const initialBenchmarkValue = benchmarkValues[0];
    
    return dates.map((date, index) => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Calculate percentage change from initial values
      const portfolioChange = ((portfolioValues[index] / initialPortfolioValue) - 1) * 100;
      const benchmarkChange = ((benchmarkValues[index] / initialBenchmarkValue) - 1) * 100;
      
      // Also keep absolute values for the tooltip
      return {
        date: formattedDate,
        fullDate: date,
        portfolioChange: parseFloat(portfolioChange.toFixed(2)),
        benchmarkChange: parseFloat(benchmarkChange.toFixed(2)),
        portfolioValue: portfolioValues[index],
        benchmarkValue: benchmarkValues[index]
      };
    });
  }, [dates, portfolioValues, benchmarkValues]);

  // Find min/max values for better visualization
  const chartStats = useMemo(() => {
    if (transformedChartData.length === 0) return { min: 0, max: 0 };
    
    const allValues = transformedChartData.flatMap(d => [d.portfolioChange, d.benchmarkChange]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    // Add padding to min/max for better visualization
    return {
      min: Math.floor(min * 1.1),
      max: Math.ceil(max * 1.1)
    };
  }, [transformedChartData]);

  // Calculate total gain/loss percentage
  const performanceSummary = useMemo(() => {
    if (transformedChartData.length === 0) return { portfolio: 0, benchmark: 0 };
    
    const lastDataPoint = transformedChartData[transformedChartData.length - 1];
    return {
      portfolio: lastDataPoint.portfolioChange,
      benchmark: lastDataPoint.benchmarkChange
    };
  }, [transformedChartData]);

  // Return a class for coloring the performance number based on positive/negative
  const getPerformanceClass = (value: number) => {
    return value >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
  };

  // Custom tooltip that shows both percentage change and absolute values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg text-sm">
          <p className="font-bold mb-2">{payload[0]?.payload.date}</p>
          
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
              <span className="mr-2">Portfolio:</span>
              <span className={getPerformanceClass(payload[0]?.value)}>
                {payload[0]?.value >= 0 ? '+' : ''}{payload[0]?.value.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
              <span className="mr-2">S&P 500:</span>
              <span className={getPerformanceClass(payload[1]?.value)}>
                {payload[1]?.value >= 0 ? '+' : ''}{payload[1]?.value.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div>Portfolio: ${payload[0]?.payload.portfolioValue.toFixed(2)}</div>
            <div>S&P 500: ${payload[0]?.payload.benchmarkValue.toFixed(2)}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // If there's no data, show a placeholder
  if (transformedChartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No performance data available
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-4">
        <div>
          <h3 className="text-lg font-medium">Performance Comparison</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Portfolio vs S&P 500 (% change)
          </div>
        </div>
        
        <div className="flex space-x-2 text-sm items-center">
          <div className="flex items-center mr-4">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mr-1.5"></span>
            <span className="mr-1">Portfolio:</span>
            <span className={getPerformanceClass(performanceSummary.portfolio)}>
              {performanceSummary.portfolio >= 0 ? '+' : ''}{performanceSummary.portfolio.toFixed(2)}%
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1.5"></span>
            <span className="mr-1">S&P 500:</span>
            <span className={getPerformanceClass(performanceSummary.benchmark)}>
              {performanceSummary.benchmark >= 0 ? '+' : ''}{performanceSummary.benchmark.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <ComposedChart
              data={transformedChartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                tickMargin={10}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value, index) => {
                  // Show fewer ticks for readability
                  if (transformedChartData.length < 10) return value;
                  
                  // For large datasets, show only some dates
                  const interval = Math.ceil(transformedChartData.length / 6);
                  return index % interval === 0 ? value : '';
                }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickMargin={10}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                domain={[chartStats.min, chartStats.max]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '10px' }}
                formatter={(value, entry, index) => (
                  <span className="text-xs font-medium">
                    {value === 'portfolioChange' ? 'Portfolio' : 'S&P 500'}
                  </span>
                )}
              />
              
              {/* Show a reference line at 0% */}
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              
              <Area
                type="monotone"
                dataKey="portfolioChange"
                name="portfolioChange"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#portfolioGradient)"
                activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="benchmarkChange"
                name="benchmarkChange"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#64748b', stroke: 'white', strokeWidth: 2 }}
              />
            </ComposedChart>
          ) : (
            <LineChart
              data={transformedChartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                tickMargin={10}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value, index) => {
                  // Show fewer ticks for readability
                  if (transformedChartData.length < 10) return value;
                  
                  // For large datasets, show only some dates
                  const interval = Math.ceil(transformedChartData.length / 6);
                  return index % interval === 0 ? value : '';
                }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickMargin={10}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                domain={[chartStats.min, chartStats.max]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '10px' }}
                formatter={(value, entry, index) => (
                  <span className="text-xs font-medium">
                    {value === 'portfolioChange' ? 'Portfolio' : 'S&P 500'}
                  </span>
                )}
              />
              
              {/* Show a reference line at 0% */}
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              
              <Line
                type="monotone"
                dataKey="portfolioChange"
                name="portfolioChange"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="benchmarkChange"
                name="benchmarkChange"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 6, fill: '#64748b', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-center space-x-2">
        <Button 
          size="sm" 
          variant={chartType === 'area' ? 'default' : 'outline'} 
          onClick={() => setChartType('area')}
          className="text-xs py-1 h-8"
        >
          Area Chart
        </Button>
        <Button 
          size="sm" 
          variant={chartType === 'line' ? 'default' : 'outline'} 
          onClick={() => setChartType('line')}
          className="text-xs py-1 h-8"
        >
          Line Chart
        </Button>
      </div>
      
      <div className="px-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p className="italic">
          Chart shows percentage change from initial investment date. Toggle between chart types for different visualizations.
        </p>
      </div>
    </div>
  );
}
