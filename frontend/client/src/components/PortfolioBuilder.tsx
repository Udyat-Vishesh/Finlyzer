import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Asset, DateRange, SelectedAsset } from '@/lib/types';
import { validatePortfolioWeights, calculateEqualWeights } from '@/lib/utils/finance';
import SearchAssets from './SearchAssets';
import DateRangeSelector from './DateRangeSelector';
import { PulseSpinner } from '@/components/ui/spinner';
import { X, BarChart3 } from 'lucide-react';

interface PortfolioBuilderProps {
  onAnalyze: (assets: SelectedAsset[], dateRange: DateRange) => void;
  isAnalyzing: boolean;
}

// Extend SelectedAsset type to include active status
interface ExtendedSelectedAsset extends SelectedAsset {
  active: boolean;
}

export default function PortfolioBuilder({ onAnalyze, isAnalyzing }: PortfolioBuilderProps) {
  const [selectedAssets, setSelectedAssets] = useState<ExtendedSelectedAsset[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: (() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 3);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0],
  });
  const [totalWeight, setTotalWeight] = useState(0);
  const { toast } = useToast();

  // Calculate total weight and redistribute if necessary
  useEffect(() => {
    const activeAssets = selectedAssets.filter(asset => asset.active);
    
    if (activeAssets.length === 0) {
      setTotalWeight(0);
      return;
    }
    
    const sum = activeAssets.reduce((acc, asset) => acc + asset.weight, 0);
    setTotalWeight(sum);
  }, [selectedAssets]);

  // Redistribute weights among active assets
  const redistributeWeights = (assets: ExtendedSelectedAsset[]) => {
    const activeAssets = assets.filter(asset => asset.active);
    
    if (activeAssets.length === 0) {
      return assets;
    }
    
    const equalWeight = 100 / activeAssets.length;
    const fixedWeight = Number(equalWeight.toFixed(2));
    
    return assets.map(asset => {
      if (!asset.active) {
        return { ...asset, weight: 0 };
      }
      
      if (asset === activeAssets[activeAssets.length - 1]) {
        // Make sure the last active asset ensures total is exactly 100%
        const totalOthers = fixedWeight * (activeAssets.length - 1);
        return { ...asset, weight: Number((100 - totalOthers).toFixed(2)) };
      }
      
      return { ...asset, weight: fixedWeight };
    });
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAssets((prev) => {
      // Create new asset with active status
      const newAsset: ExtendedSelectedAsset = { 
        ...asset, 
        weight: 0, 
        active: true 
      };
      
      const updatedAssets = [...prev, newAsset];
      
      // Redistribute weights
      return redistributeWeights(updatedAssets);
    });
  };

  const handleRemoveAsset = (symbol: string) => {
    setSelectedAssets((prev) => {
      const filteredAssets = prev.filter((asset) => asset.symbol !== symbol);
      
      // Redistribute weights
      return redistributeWeights(filteredAssets);
    });
  };

  const handleWeightChange = (symbol: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return;
    }
    
    setSelectedAssets((prev) => {
      const updatedAssets = prev.map((asset) => 
        asset.symbol === symbol ? { ...asset, weight: numValue } : asset
      );
      
      return updatedAssets;
    });
  };

  const handleToggleAsset = (symbol: string, isActive: boolean) => {
    setSelectedAssets((prev) => {
      // Update the active status of the selected asset
      const updatedAssets = prev.map((asset) => 
        asset.symbol === symbol ? { ...asset, active: isActive, weight: isActive ? asset.weight : 0 } : asset
      );
      
      // Redistribute weights among active assets
      return redistributeWeights(updatedAssets);
    });
  };

  const handleClearAll = () => {
    setSelectedAssets([]);
  };

  const handleAnalyze = () => {
    // Filter to only active assets for analysis
    const activeAssets = selectedAssets.filter(asset => asset.active);
    
    if (activeAssets.length === 0) {
      toast({
        title: "No active assets selected",
        description: "Please select and enable at least one asset to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePortfolioWeights(activeAssets.map(a => a.weight))) {
      toast({
        title: "Invalid weights",
        description: "Portfolio weights must sum to 100%.",
        variant: "destructive",
      });
      return;
    }

    // Only include active assets in the analysis
    onAnalyze(activeAssets, dateRange);
  };

  return (
    <Card className="bg-white shadow rounded-lg p-6 mb-6">
      <CardContent className="p-0">
        <h2 className="text-xl font-semibold mb-4">Finlyzer Portfolio Builder</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Assets
          </label>
          <SearchAssets 
            onAssetSelect={handleAssetSelect} 
            selectedAssets={selectedAssets} 
          />
          
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Assets</div>
            {selectedAssets.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                No assets selected yet. Search and select assets to build your portfolio.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedAssets.map((asset) => (
                  <div 
                    key={asset.symbol}
                    className={`flex items-center justify-between p-3 rounded-lg border
                      ${asset.active 
                        ? "bg-neutral-50 border-neutral-200" 
                        : "bg-neutral-100 border-neutral-200 opacity-75"}`}
                  >
                    <div className="flex items-center">
                      <Switch 
                        checked={asset.active}
                        onCheckedChange={(checked) => handleToggleAsset(asset.symbol, checked)}
                        className="mr-3"
                      />
                      <span className={`font-medium ${!asset.active && "text-gray-500"}`}>
                        {asset.symbol}
                      </span>
                      <span className={`ml-2 text-sm ${asset.active ? "text-gray-600" : "text-gray-500"}`}>
                        {asset.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <label className={`mr-2 text-sm ${asset.active ? "text-gray-600" : "text-gray-500"}`}>
                          Weight:
                        </label>
                        <Input
                          type="number"
                          className={`w-16 p-1 text-sm border rounded ${asset.active 
                            ? "border-gray-300" 
                            : "border-gray-200 bg-gray-100 text-gray-500"}`}
                          value={asset.weight}
                          min="0"
                          max="100"
                          disabled={!asset.active}
                          onChange={(e) => handleWeightChange(asset.symbol, e.target.value)}
                        />
                        <span className={`ml-1 ${asset.active ? "text-gray-600" : "text-gray-500"}`}>%</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 h-8 w-8"
                        onClick={() => handleRemoveAsset(asset.symbol)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedAssets.length > 0 && (
              <div className="mt-2 text-sm text-gray-600 flex justify-between items-center">
                <span className={totalWeight !== 100 && selectedAssets.some(a => a.active) ? "text-red-500 font-medium" : ""}>
                  Total: {totalWeight}%
                  {totalWeight !== 100 && selectedAssets.some(a => a.active) && " (must be 100%)"}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-red-600 hover:text-red-800"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !selectedAssets.some(a => a.active)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Analyzing...
              </>
            ) : (
              "Analyze Portfolio"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
