import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Asset, SelectedAsset } from '@/lib/types';
import { searchAssets } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

interface SearchAssetsProps {
  onAssetSelect: (asset: Asset) => void;
  selectedAssets: Array<SelectedAsset & { active?: boolean }>;
}

export default function SearchAssets({ onAssetSelect, selectedAssets }: SearchAssetsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    stocks: Asset[];
    etfs: Asset[];
    crypto: Asset[];
    indices: Asset[];
  }>({
    stocks: [],
    etfs: [],
    crypto: [],
    indices: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const searchResults = await searchAssets(query);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          toast({
            title: "Search failed",
            description: "Could not fetch search results. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ stocks: [], etfs: [], crypto: [], indices: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, toast]);

  const handleAssetClick = (asset: Asset) => {
    if (selectedAssets.some(selectedAsset => selectedAsset.symbol === asset.symbol)) {
      toast({
        title: "Asset already selected",
        description: `${asset.symbol} is already in your portfolio.`,
      });
    } else {
      onAssetSelect(asset);
      setQuery('');
      setShowResults(false);
    }
  };

  const hasResults = 
    results.stocks.length > 0 || 
    results.etfs.length > 0 || 
    results.crypto.length > 0 || 
    results.indices.length > 0;

  return (
    <div className="w-full relative" ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks, ETFs, crypto, or indices..."
          className="w-full px-4 py-2 border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {showResults && (
        <Card className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto">
          {!hasResults && !loading && query.trim().length >= 2 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {results.stocks.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">Stocks</div>
              {results.stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center"
                  onClick={() => handleAssetClick(stock)}
                >
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="ml-2 text-sm text-gray-600">{stock.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.etfs.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">ETFs</div>
              {results.etfs.map((etf) => (
                <div
                  key={etf.symbol}
                  className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center"
                  onClick={() => handleAssetClick(etf)}
                >
                  <span className="font-medium">{etf.symbol}</span>
                  <span className="ml-2 text-sm text-gray-600">{etf.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.crypto.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">Crypto</div>
              {results.crypto.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center"
                  onClick={() => handleAssetClick(crypto)}
                >
                  <span className="font-medium">{crypto.symbol}</span>
                  <span className="ml-2 text-sm text-gray-600">{crypto.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.indices.length > 0 && (
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700">Indices</div>
              {results.indices.map((index) => (
                <div
                  key={index.symbol}
                  className="p-2 hover:bg-blue-50 rounded cursor-pointer flex items-center"
                  onClick={() => handleAssetClick(index)}
                >
                  <span className="font-medium">{index.symbol}</span>
                  <span className="ml-2 text-sm text-gray-600">{index.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
