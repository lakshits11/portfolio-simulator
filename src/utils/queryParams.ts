// Utility functions for reading and writing portfolios and years to the query string
export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const portfoliosParam = params.get('portfolios');
  const years = params.get('years');
  return {
    portfolios: portfoliosParam
      ? portfoliosParam.split(';').map(p =>
          p.split(',').map(s => {
            const n = Number(s);
            return isNaN(n) ? null : n;
          })
        )
      : [],
    years: years ? Number(years) : null,
  };
}

export function setQueryParams(portfolios: (number | null)[][], years: number) {
  const params = new URLSearchParams(window.location.search);
  const portfoliosStr = portfolios
    .map(schemes => schemes.filter(x => x !== null && x !== undefined).join(','))
    .join(';');
  params.set('portfolios', portfoliosStr);
  params.set('years', String(years));
  window.history.replaceState({}, '', `?${params.toString()}`);
} 