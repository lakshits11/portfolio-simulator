// Utility functions for reading and writing scheme and years to the query string
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const scheme = params.get('scheme');
  const years = params.get('years');
  return {
    schemes: scheme ? scheme.split(',').map(Number).filter(n => !isNaN(n)) : [],
    years: years ? Number(years) : null,
  };
}

export function setQueryParams(schemes: number[], years: number) {
  const params = new URLSearchParams(window.location.search);
  params.set('scheme', schemes.join(','));
  params.set('years', String(years));
  window.history.replaceState({}, '', `?${params.toString()}`);
} 