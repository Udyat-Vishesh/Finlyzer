import { useMemo } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
  LabelList,
  Legend,
  Label
} from "recharts";

interface RiskReturnChartProps {
  data: {
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

// Function to determine asset category color
const getAssetColor = (symbol: string): string => {
  if (symbol.includes('.NS')) {
    return '#FF8C00'; // Indian stocks (orange)
  } else if (symbol.includes('BTC') || symbol.includes('ETH') || 
             symbol.includes('SOL') || symbol.includes('DOGE')) {
    return '#6A5ACD'; // Crypto (purple)
  } else if (symbol.includes('SPY') || symbol.includes('QQQ') || 
             symbol.includes('VTI') || symbol.includes('VOO') ||
             symbol.includes('BEES')) {
    return '#20B2AA'; // ETFs (teal)
  } else if (symbol.includes('^')) {
    return '#708090'; // Indices (slate gray)
  } else {
    return '#1E90FF'; // US stocks (dodger blue)
  }
};

// Function to determine asset point size
const getAssetSize = (symbol: string): number => {
  if (symbol === "Portfolio") {
    return 180; // Portfolio is largest
  } else if (symbol.includes('AAPL') || symbol.includes('MSFT') || 
             symbol.includes('TCS') || symbol.includes('RELIANCE')) {
    return 120; // Major stocks
  } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
    return 110; // Major crypto
  } else if (symbol.includes('^')) {
    return 100; // Indices
  } else {
    return 80; // Other assets
  }
};

// Function to determine whether to render the label
const shouldShowLabel = (item: any): boolean => {
  return item.isPortfolio || 
         item.symbol.includes('AAPL') || 
         item.symbol.includes('BTC') ||
         item.symbol.includes('TCS.NS') ||
         item.symbol.includes('RELIANCE.NS') ||
         item.symbol.includes('^NSEI') ||
         item.symbol.includes('^GSPC');
};

export default function RiskReturnChart({ data }: RiskReturnChartProps) {
  const { assets, portfolio } = data;

  const chartData = useMemo(() => {
    // Calculate quadrant boundaries as the average of max/min values
    const allRisks = assets.map(a => a.risk).concat(portfolio.risk);
    const allReturns = assets.map(a => a.return).concat(portfolio.return);
    
    const avgRisk = allRisks.reduce((sum, val) => sum + val, 0) / allRisks.length;
    const avgReturn = allReturns.reduce((sum, val) => sum + val, 0) / allReturns.length;
    
    // Assets data for the scatter plot
    return {
      points: [
        ...assets.map((asset) => ({
          x: asset.risk,
          y: asset.return,
          symbol: asset.symbol,
          name: asset.name,
          isPortfolio: false,
          size: getAssetSize(asset.symbol),
          color: getAssetColor(asset.symbol),
          showLabel: shouldShowLabel({symbol: asset.symbol}),
          // Calculate asset category for the legend
          category: asset.symbol.includes('.NS') ? 'Indian Stocks' :
                   asset.symbol.includes('BTC') || asset.symbol.includes('ETH') ||
                   asset.symbol.includes('SOL') || asset.symbol.includes('DOGE') ||
                   asset.symbol.includes('XRP') ? 'Crypto' :
                   asset.symbol.includes('SPY') || asset.symbol.includes('QQQ') ||
                   asset.symbol.includes('BEES') ? 'ETFs' :
                   asset.symbol.includes('^') ? 'Indices' : 'US Stocks'
        })),
        // Add portfolio point
        {
          x: portfolio.risk,
          y: portfolio.return,
          symbol: "Portfolio",
          name: "Your Portfolio",
          isPortfolio: true,
          size: 200,
          color: '#FF4500', // Bright orange-red
          showLabel: true,
          category: 'Portfolio'
        },
      ],
      quadrants: {
        avgRisk,
        avgReturn
      }
    };
  }, [assets, portfolio]);

  // Group chart data by category for the legend
  const categorizedData = useMemo(() => {
    const categories: Record<string, any[]> = {
      'Portfolio': [],
      'US Stocks': [],
      'Indian Stocks': [],
      'ETFs': [],
      'Crypto': [],
      'Indices': []
    };
    
    chartData.points.forEach(point => {
      if (categories[point.category]) {
        categories[point.category].push(point);
      }
    });
    
    return categories;
  }, [chartData]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositiveReturn = data.y >= 0;
      const returnColor = isPositiveReturn ? 'text-green-600' : 'text-red-600';
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg text-sm">
          <p className="font-bold text-base">{data.symbol}</p>
          <p className="text-gray-600 mb-1">{data.name}</p>
          <div className="mt-1 pt-1 border-t border-gray-200">
            <p className="flex justify-between">
              <span className="font-medium">Return:</span> 
              <span className={returnColor}>{data.y.toFixed(2)}%</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Risk:</span> 
              <span>{data.x.toFixed(2)}%</span>
            </p>
            {data.isPortfolio && (
              <p className="mt-1 pt-1 border-t border-gray-200 text-xs text-gray-500">
                This is your combined portfolio
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomizedLabel = (props: any) => {
    const { x, y, width, height, value, index, viewBox, ...rest } = props;
    const { payload } = rest;
    
    // Add null check for payload
    if (!payload || !payload.showLabel) return null;
    
    const fontSize = payload.isPortfolio ? 12 : 10;
    const fontWeight = payload.isPortfolio ? 'bold' : 'normal';
    
    return (
      <text 
        x={payload.x} 
        y={payload.isPortfolio ? payload.y - 12 : payload.y + 12} 
        fill={payload.color}
        textAnchor="middle" 
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {payload.symbol}
      </text>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-start mb-2 px-4">
        <div>
          <h3 className="text-lg font-medium">Risk vs. Return Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Compare risk and return profiles across different assets
          </p>
        </div>
      </div>
      
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 20,
              right: 30,
              bottom: 40,
              left: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.6} stroke="#e5e7eb" />
            
            {/* Quadrant fill colors for better visualization */}
            <defs>
              <linearGradient id="quadrantTopLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#bbf7d0" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#bbf7d0" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="quadrantTopRight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#fef08a" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="quadrantBottomLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#bae6fd" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="quadrantBottomRight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fecaca" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#fecaca" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            {/* Quadrant background rectangles */}
            {/* Top Left - Ideal (High Return, Low Risk) */}
            <rect 
              x={0} 
              y={0} 
              width={chartData.quadrants.avgRisk} 
              height={chartData.quadrants.avgReturn} 
              fill="url(#quadrantTopLeft)" 
            />
            
            {/* Top Right - Growth (High Return, High Risk) */}
            <rect 
              x={chartData.quadrants.avgRisk} 
              y={0} 
              width={50} 
              height={chartData.quadrants.avgReturn} 
              fill="url(#quadrantTopRight)" 
            />
            
            {/* Bottom Left - Conservative (Low Return, Low Risk) */}
            <rect 
              x={0} 
              y={chartData.quadrants.avgReturn} 
              width={chartData.quadrants.avgRisk} 
              height={50} 
              fill="url(#quadrantBottomLeft)" 
            />
            
            {/* Bottom Right - Warning (Low Return, High Risk) */}
            <rect 
              x={chartData.quadrants.avgRisk} 
              y={chartData.quadrants.avgReturn} 
              width={50} 
              height={50} 
              fill="url(#quadrantBottomRight)" 
            />
            
            {/* Quadrant reference lines */}
            <ReferenceLine
              x={chartData.quadrants.avgRisk}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ 
                value: "Average Risk", 
                position: "top", 
                fontSize: 10, 
                fill: "#64748b",
                dy: -5
              }}
            />
            <ReferenceLine
              y={chartData.quadrants.avgReturn}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ 
                value: "Average Return", 
                position: "insideRight", 
                fontSize: 10, 
                dx: 5,
                fill: "#64748b"
              }}
            />
            
            {/* Zero return reference line */}
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
            
            <XAxis
              type="number"
              dataKey="x"
              name="Risk"
              domain={[0, 'auto']}
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            >
              <Label 
                value="Risk (Volatility %)" 
                position="insideBottom" 
                offset={-10}
                style={{ 
                  fontSize: 12, 
                  fill: '#64748b',
                  fontWeight: 500
                }}
              />
            </XAxis>
            
            <YAxis
              type="number"
              dataKey="y"
              name="Return"
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            >
              <Label 
                value="Annual Return (%)" 
                angle={-90} 
                position="insideLeft"
                style={{ 
                  textAnchor: 'middle', 
                  fontSize: 12, 
                  fill: '#64748b',
                  fontWeight: 500
                }}
              />
            </YAxis>
            
            <ZAxis type="number" dataKey="size" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Asset category scatters */}
            {Object.entries(categorizedData).map(([category, points]) => (
              points.length > 0 && (
                <Scatter
                  key={category}
                  name={category}
                  data={points}
                  fill={points[0].color}
                >
                  <LabelList content={<CustomizedLabel />} />
                </Scatter>
              )
            ))}
            
            <Legend 
              align="center" 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span className="text-xs font-medium">
                  {value}
                </span>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-full px-4 mt-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 border border-green-200 rounded bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <div className="font-medium text-green-800 dark:text-green-400 mb-1">High Return, Low Risk</div>
            <p className="text-green-700 dark:text-green-300 opacity-80">Ideal investments with strong returns and lower volatility</p>
          </div>
          <div className="p-2 border border-yellow-200 rounded bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">High Return, High Risk</div>
            <p className="text-yellow-700 dark:text-yellow-300 opacity-80">Growth potential with increased volatility and uncertainty</p>
          </div>
          <div className="p-2 border border-blue-200 rounded bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="font-medium text-blue-800 dark:text-blue-400 mb-1">Low Return, Low Risk</div>
            <p className="text-blue-700 dark:text-blue-300 opacity-80">Conservative investments with stable but modest performance</p>
          </div>
          <div className="p-2 border border-red-200 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="font-medium text-red-800 dark:text-red-400 mb-1">Low Return, High Risk</div>
            <p className="text-red-700 dark:text-red-300 opacity-80">Underperforming assets with high volatility - consider alternatives</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
        <p>Bubble size indicates relative importance of the asset. Hover over bubbles for detailed metrics.</p>
      </div>
    </div>
  );
}
