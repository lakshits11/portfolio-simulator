import React from 'react';
import { getQueryParams, setQueryParams } from '../utils/queryParams';

export function usePortfolios(DEFAULT_SCHEME_CODE: number) {
  // Initialize portfolios and years from query params
  const initialParams = React.useMemo(() => getQueryParams(), []);
  const [portfolios, setPortfolios] = React.useState<{ selectedSchemes: (number | null)[] }[]>(
    initialParams.portfolios && initialParams.portfolios.length > 0
      ? initialParams.portfolios.map(schemes => ({ selectedSchemes: schemes.length > 0 ? schemes : [DEFAULT_SCHEME_CODE] }))
      : [{ selectedSchemes: [DEFAULT_SCHEME_CODE] }]
  );
  const [years, setYears] = React.useState<number>(initialParams.years || 1);

  // Handler to add a new portfolio
  const handleAddPortfolio = () => {
    setPortfolios(prev => [
      ...prev,
      { selectedSchemes: [DEFAULT_SCHEME_CODE] }
    ]);
  };

  // Handlers for fund controls per portfolio
  const handleFundSelect = (portfolioIdx: number, idx: number, schemeCode: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, selectedSchemes: p.selectedSchemes.map((s, j) => j === idx ? schemeCode : s) }
        : p
    ));
  };
  const handleAddFund = (portfolioIdx: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, selectedSchemes: [...p.selectedSchemes, null] }
        : p
    ));
  };
  const handleRemoveFund = (portfolioIdx: number, idx: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, selectedSchemes: p.selectedSchemes.filter((_, j) => j !== idx) }
        : p
    ));
  };

  // Sync portfolios and years to query params
  React.useEffect(() => {
    setQueryParams(portfolios.map(p => p.selectedSchemes), years);
  }, [portfolios, years]);

  return {
    portfolios,
    setPortfolios,
    years,
    setYears,
    handleAddPortfolio,
    handleFundSelect,
    handleAddFund,
    handleRemoveFund,
  };
} 