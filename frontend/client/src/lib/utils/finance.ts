/**
 * Checks if the portfolio weights sum to 100%
 */
export function validatePortfolioWeights(weights: number[]): boolean {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  return Math.abs(sum - 100) < 0.001; // Allow for small floating point errors
}

/**
 * Formats a percentage for display
 */
export function formatPercentage(value: number, includeSign = true): string {
  const formatted = Math.abs(value).toFixed(2);
  if (includeSign) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
  return `${formatted}%`;
}

/**
 * Format a decimal ratio (like Sharpe ratio)
 */
export function formatRatio(value: number): string {
  return value.toFixed(2);
}

/**
 * Determines the CSS class for positive or negative values
 */
export function getValueColorClass(value: number): string {
  return value >= 0 ? 'text-positive' : 'text-negative';
}

/**
 * Normalize a data series to start at 100
 */
export function normalizeTimeSeries(data: number[]): number[] {
  if (!data.length) return [];
  const firstValue = data[0];
  return data.map(value => (value / firstValue) * 100);
}

/**
 * Calculate equal weights for a given number of assets
 */
export function calculateEqualWeights(assetCount: number): number[] {
  if (assetCount <= 0) return [];
  const weight = 100 / assetCount;
  return Array(assetCount).fill(Number(weight.toFixed(2)));
}
