// Utility functions for reading and writing scheme and years to the query string
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const scheme = params.get('scheme');
  const years = params.get('years');
  return {
    scheme: scheme ? Number(scheme) : null,
    years: years ? Number(years) : null,
  };
}

export function setQueryParams(scheme: number, years: number) {
  const params = new URLSearchParams(window.location.search);
  params.set('scheme', String(scheme));
  params.set('years', String(years));
  window.history.replaceState({}, '', `?${params.toString()}`);
} 