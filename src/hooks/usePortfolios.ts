import React from 'react';
import { getQueryParams, setQueryParams } from '../utils/queryParams';

export function usePortfolios(DEFAULT_SCHEME_CODE: number) {
  // Initialize portfolios and years from query params
  const initialParams = React.useMemo(() => getQueryParams(), []);
  const [portfolios, setPortfolios] = React.useState<{ selectedSchemes: (number | null)[]; allocations: number[] }[]>(
    initialParams.portfolios && initialParams.portfolios.length > 0
      ? initialParams.portfolios.map(schemes => ({
          selectedSchemes: schemes.length > 0 ? schemes : [DEFAULT_SCHEME_CODE],
          allocations: schemes.length > 0 ? Array(schemes.length).fill(Math.round(100 / schemes.length)) : [100],
        }))
      : [{ selectedSchemes: [DEFAULT_SCHEME_CODE], allocations: [100] }]
  );
  const [years, setYears] = React.useState<number>(initialParams.years || 1);

  // Handler to add a new portfolio
  const handleAddPortfolio = () => {
    setPortfolios(prev => [
      ...prev,
      { selectedSchemes: [DEFAULT_SCHEME_CODE], allocations: [100] }
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
    setPortfolios(prev => prev.map((p, i) => {
      if (i !== portfolioIdx) return p;
      const newSchemes = [...p.selectedSchemes, null];
      // Default: split equally
      const n = newSchemes.length;
      const newAlloc = Array(n).fill(Math.round(100 / n));
      return { ...p, selectedSchemes: newSchemes, allocations: newAlloc };
    }));
  };
  const handleRemoveFund = (portfolioIdx: number, idx: number) => {
    setPortfolios(prev => prev.map((p, i) => {
      if (i !== portfolioIdx) return p;
      const newSchemes = p.selectedSchemes.filter((_, j) => j !== idx);
      const newAlloc = p.allocations.filter((_, j) => j !== idx);
      return { ...p, selectedSchemes: newSchemes, allocations: newAlloc };
    }));
  };
  const handleAllocationChange = (portfolioIdx: number, fundIdx: number, value: number) => {
    setPortfolios(prev => prev.map((p, i) => {
      if (i !== portfolioIdx) return p;
      const newAlloc = p.allocations.map((a, j) => j === fundIdx ? value : a);
      return { ...p, allocations: newAlloc };
    }));
  };

  // Sync portfolios and years to query params (only schemes, not allocations)
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
    handleAllocationChange,
  };
} 