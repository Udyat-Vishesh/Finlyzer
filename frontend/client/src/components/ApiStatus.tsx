import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getApiStatus } from '@/lib/api';

type ApiStatusType = {
  dataSource: 'gemini' | 'yahoo';
  ready: boolean;
  message: string;
};

export default function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setIsLoading(true);
        const data = await getApiStatus();
        setStatus(data as ApiStatusType);
        setError(null);
      } catch (err) {
        setError('Could not connect to API');
        console.error('API status check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center text-xs text-gray-500">
        <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
        Checking API status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-xs">
        <Badge variant="destructive" className="mr-1">Error</Badge>
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="flex items-center text-xs">
      {status.ready ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1">
          {status.dataSource === 'gemini' ? 'Gemini API' : 'Yahoo Finance'}
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-1">
          Limited
        </Badge>
      )}
      <span className="text-gray-600">{status.message}</span>
    </div>
  );
}