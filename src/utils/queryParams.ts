// Utility functions for reading and writing portfolios and years to the query string
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const portfoliosParam = params.get('portfolios');
  const years = params.get('years');
  return {
    portfolios: portfoliosParam
      ? portfoliosParam.split(';').map(p => {
          // Each p: scheme1:alloc1,scheme2:alloc2,...
          const schemes: (number | null)[] = [];
          const allocations: number[] = [];
          p.split(',').forEach(pair => {
            const [schemeStr, allocStr] = pair.split(':');
            const n = Number(schemeStr);
            schemes.push(isNaN(n) ? null : n);
            const alloc = Number(allocStr);
            allocations.push(isNaN(alloc) ? 0 : alloc);
          });
          return { selectedSchemes: schemes, allocations };
        })
      : [],
    years: years ? Number(years) : null,
  };
}

export function setQueryParams(portfolios: { selectedSchemes: (number | null)[]; allocations: number[] }[], years: number) {
  const params = new URLSearchParams(window.location.search);
  const portfoliosStr = portfolios
    .map(p => p.selectedSchemes.map((scheme, idx) => `${scheme}:${p.allocations[idx]}`).join(','))
    .join(';');
  params.set('portfolios', portfoliosStr);
  params.set('years', String(years));
  window.history.replaceState({}, '', `?${params.toString()}`);
} 