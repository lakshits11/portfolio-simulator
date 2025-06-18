import { Portfolio } from '../types/portfolio';

// Utility functions for reading and writing portfolios and years to the query string
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const portfoliosParam = params.get('portfolios');
  const years = params.get('years');
  const defaultThreshold = 5; // Default threshold if not in query params

  return {
    portfolios: portfoliosParam
      ? portfoliosParam.split(';').map(p_str => {
          // Legacy format: scheme1:alloc1,scheme2:alloc2,...|rebalFlag|rebalThreshold
          // For now, we'll parse legacy format but return empty selectedInstruments
          const parts = p_str.split('|');
          const fundsStr = parts[0];
          const rebalFlagStr = parts[1]; 
          const rebalThresholdStr = parts[2];

          const allocations: number[] = [];

          if (fundsStr) {
            fundsStr.split(',').forEach(pair => {
              const [, allocStr] = pair.split(':');
              const alloc = Number(allocStr);
              allocations.push(isNaN(alloc) ? 0 : alloc);
            });
          }
          
          // Default rebalancingEnabled to false if not present or not '1'
          const rebalancingEnabled = rebalFlagStr === '1';
          const rebalancingThreshold = rebalThresholdStr ? parseInt(rebalThresholdStr, 10) : defaultThreshold;
          
          return {
            selectedInstruments: allocations.map(() => null), // Start with null instruments, let user select
            allocations,
            rebalancingEnabled,
            rebalancingThreshold: isNaN(rebalancingThreshold) ? defaultThreshold : rebalancingThreshold
          };
        }).filter(p => p.allocations.length > 0) // Filter out empty portfolios
      : [],
    years: years ? Number(years) : null,
  };
}

export function setQueryParams(portfolios: Portfolio[], years: number) {
  // For simplicity, we'll store a minimal representation
  // Format: alloc1,alloc2,...|rebalFlag|rebalThreshold
  const portfoliosStr = portfolios
    .map(p => {
      const allocStr = p.allocations.join(',');
      return `${allocStr}|${p.rebalancingEnabled ? '1' : '0'}|${p.rebalancingThreshold}`;
    })
    .join(';');
  
  // Construct URL manually since we're using safe characters now
  const urlParams = `portfolios=${portfoliosStr}&years=${years}`;
  window.history.replaceState({}, '', `?${urlParams}`);
}