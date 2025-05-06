import { useState } from 'react';
import { DateRange } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

type TimeUnit = 'days' | 'weeks' | 'months' | 'years';
type TimeSpan = {value: number, unit: TimeUnit};

export default function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("presets");
  const [customTimeSpan, setCustomTimeSpan] = useState<TimeSpan>({value: 1, unit: 'years'});
  const [customTimeUnit, setCustomTimeUnit] = useState<TimeUnit>('years');
  const [customTimeValue, setCustomTimeValue] = useState<number>(1);
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      endDate: e.target.value,
    });
  };

  const handleCustomTimeUnitChange = (value: string) => {
    setCustomTimeUnit(value as TimeUnit);
    setCustomTimeSpan({...customTimeSpan, unit: value as TimeUnit});
  };

  const handleCustomTimeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCustomTimeValue(value);
      setCustomTimeSpan({...customTimeSpan, value});
    }
  };

  const applyCustomTimeSpan = () => {
    onDateRangeChange(getCustomDateRange(customTimeSpan));
  };

  const getCustomDateRange = (timeSpan: TimeSpan): DateRange => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeSpan.unit) {
      case 'days':
        startDate.setDate(endDate.getDate() - timeSpan.value);
        break;
      case 'weeks':
        startDate.setDate(endDate.getDate() - (timeSpan.value * 7));
        break;
      case 'months':
        startDate.setMonth(endDate.getMonth() - timeSpan.value);
        break;
      case 'years':
        startDate.setFullYear(endDate.getFullYear() - timeSpan.value);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const getPresetDateRange = (preset: string): DateRange => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (preset) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '2W':
        startDate.setDate(endDate.getDate() - 14);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'YTD':
        startDate.setMonth(0, 1); // January 1st of current year
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '3Y':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case '10Y':
        startDate.setFullYear(endDate.getFullYear() - 10);
        break;
      case '20Y':
        startDate.setFullYear(endDate.getFullYear() - 20);
        break;
      case 'MAX':
        startDate.setFullYear(endDate.getFullYear() - 30); // 30 years as max
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Format date display nicely
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get button style based on active status
  const getPresetButtonStyle = (preset: string) => {
    // Get the range for this preset
    const presetRange = getPresetDateRange(preset);
    
    // Check if this preset matches the current date range (within 1 day for rounding errors)
    const currentStart = new Date(dateRange.startDate).getTime();
    const currentEnd = new Date(dateRange.endDate).getTime();
    const presetStart = new Date(presetRange.startDate).getTime();
    const presetEnd = new Date(presetRange.endDate).getTime();
    
    const startDiff = Math.abs(currentStart - presetStart);
    const endDiff = Math.abs(currentEnd - presetEnd);
    
    // 86400000 ms = 1 day
    const isActive = startDiff < 86400000 && endDiff < 86400000;
    
    return isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
      : "text-xs bg-white hover:bg-gray-50";
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white dark:bg-gray-800 shadow-sm transition-all">
      <h3 className="text-sm font-medium flex items-center mb-3 text-gray-800 dark:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 text-primary">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
        </svg>
        Date Range
      </h3>
      
      <Tabs defaultValue="presets" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
          <TabsTrigger value="presets" className="text-xs py-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
              <path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-8"></path>
            </svg>
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs py-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
              <path d="M2 12h10"></path><path d="M16 12h6"></path><path d="M12 2v20"></path>
            </svg>
            Custom
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs py-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="space-y-4">
          <div className="space-y-2">
            {/* Short term periods - days/weeks */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('1D')}
                onClick={() => onDateRangeChange(getPresetDateRange('1D'))}
              >
                1D
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('1W')}
                onClick={() => onDateRangeChange(getPresetDateRange('1W'))}
              >
                1W
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('2W')}
                onClick={() => onDateRangeChange(getPresetDateRange('2W'))}
              >
                2W
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('1M')}
                onClick={() => onDateRangeChange(getPresetDateRange('1M'))}
              >
                1M
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('3M')}
                onClick={() => onDateRangeChange(getPresetDateRange('3M'))}
              >
                3M
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('6M')}
                onClick={() => onDateRangeChange(getPresetDateRange('6M'))}
              >
                6M
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={getPresetButtonStyle('YTD')}
                onClick={() => onDateRangeChange(getPresetDateRange('YTD'))}
              >
                YTD
              </Button>
            </div>
            
            {/* Long term periods - years */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Long term:</div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={getPresetButtonStyle('1Y')}
                  onClick={() => onDateRangeChange(getPresetDateRange('1Y'))}
                >
                  1Y
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={getPresetButtonStyle('3Y')}
                  onClick={() => onDateRangeChange(getPresetDateRange('3Y'))}
                >
                  3Y
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={getPresetButtonStyle('5Y')}
                  onClick={() => onDateRangeChange(getPresetDateRange('5Y'))}
                >
                  5Y
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={getPresetButtonStyle('10Y')}
                  onClick={() => onDateRangeChange(getPresetDateRange('10Y'))}
                >
                  10Y
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={getPresetButtonStyle('20Y')}
                  onClick={() => onDateRangeChange(getPresetDateRange('20Y'))}
                >
                  20Y
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={getPresetButtonStyle('MAX')}
                  onClick={() => onDateRangeChange(getPresetDateRange('MAX'))}
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                value={customTimeValue}
                onChange={handleCustomTimeValueChange}
                className="w-full"
              />
            </div>
            <div className="w-1/2">
              <Select value={customTimeUnit} onValueChange={handleCustomTimeUnitChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={applyCustomTimeSpan} 
              className="whitespace-nowrap"
              variant="default"
            >
              Apply
            </Button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-300">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
              Set any custom period from 1 day up to 30 years
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={handleStartDateChange}
                className="w-full bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={handleEndDateChange}
                className="w-full bg-white dark:bg-gray-700"
                min={dateRange.startDate}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-md text-xs font-medium">
            {formatDisplayDate(dateRange.startDate)}
          </span>
          <span className="text-gray-400">to</span>
          <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-md text-xs font-medium">
            {formatDisplayDate(dateRange.endDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
