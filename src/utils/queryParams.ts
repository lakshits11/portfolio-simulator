// Utility functions for reading and writing portfolios and years to the query string
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const portfoliosParam = params.get('portfolios');
  const years = params.get('years');
  return {
    portfolios: portfoliosParam
      ? portfoliosParam.split(';').map(p_str => {
          // Each p_str: scheme1:alloc1,scheme2:alloc2,...#rebalFlag
          const parts = p_str.split('#');
          const fundsStr = parts[0];
          const rebalStr = parts[1]; // Could be undefined if '#' is not present

          const schemes: (number | null)[] = [];
          const allocations: number[] = [];

          if (fundsStr) {
            fundsStr.split(',').forEach(pair => {
              const [schemeStr, allocStr] = pair.split(':');
              const n = Number(schemeStr);
              // Handle empty scheme string from "null" value during setQueryParams
              schemes.push(schemeStr === '' ? null : (isNaN(n) ? null : n));
              const alloc = Number(allocStr);
              allocations.push(isNaN(alloc) ? 0 : alloc);
            });
          }
          // Default rebalancingEnabled to false if not present or not '1'
          const rebalancingEnabled = rebalStr === '1';
          return { selectedSchemes: schemes, allocations, rebalancingEnabled };
        }).filter(p => p.selectedSchemes.length > 0 || p.allocations.length > 0) // Filter out potentially empty portfolios from bad params
      : [],
    years: years ? Number(years) : null,
  };
}

export function setQueryParams(portfolios: { selectedSchemes: (number | null)[]; allocations: number[]; rebalancingEnabled: boolean }[], years: number) {
  const params = new URLSearchParams(window.location.search);
  const portfoliosStr = portfolios
    .map(p => {
      const fundsStr = p.selectedSchemes.map((scheme, idx) => `${scheme === null ? '' : scheme}:${p.allocations[idx]}`).join(',');
      return `${fundsStr}#${p.rebalancingEnabled ? '1' : '0'}`;
    })
    .join(';');
  params.set('portfolios', portfoliosStr);
  params.set('years', String(years));
  window.history.replaceState({}, '', `?${params.toString()}`);
} 