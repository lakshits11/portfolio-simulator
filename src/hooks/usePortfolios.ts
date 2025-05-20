import React from 'react';
import { getQueryParams, setQueryParams } from '../utils/queryParams';

function getDefaultAllocations(n: number): number[] {
  const base = Math.floor(100 / n);
  const allocations = Array(n).fill(base);
  allocations[n - 1] = 100 - base * (n - 1);
  return allocations;
}

const DEFAULT_REBALANCING_THRESHOLD = 5;

export function usePortfolios(DEFAULT_SCHEME_CODE: number) {
  // Initialize portfolios and years from query params
  const initialParams = React.useMemo(() => getQueryParams(), []);
  const [portfolios, setPortfolios] = React.useState<
    { selectedSchemes: (number | null)[]; allocations: number[]; rebalancingEnabled: boolean; rebalancingThreshold: number }[]
  >(
    initialParams.portfolios && initialParams.portfolios.length > 0
      ? initialParams.portfolios.map((p: any) => ({
          selectedSchemes: p.selectedSchemes && p.selectedSchemes.length > 0 ? p.selectedSchemes : [DEFAULT_SCHEME_CODE],
          allocations: p.allocations && p.allocations.length > 0 ? p.allocations : [100],
          rebalancingEnabled: typeof p.rebalancingEnabled === 'boolean' ? p.rebalancingEnabled : false,
          rebalancingThreshold: typeof p.rebalancingThreshold === 'number' ? p.rebalancingThreshold : DEFAULT_REBALANCING_THRESHOLD,
        }))
      : [{ selectedSchemes: [DEFAULT_SCHEME_CODE], allocations: [100], rebalancingEnabled: false, rebalancingThreshold: DEFAULT_REBALANCING_THRESHOLD }]
  );
  const [years, setYears] = React.useState<number>(initialParams.years || 1);

  // Handler to add a new portfolio
  const handleAddPortfolio = () => {
    setPortfolios(prev => [
      ...prev,
      { selectedSchemes: [DEFAULT_SCHEME_CODE], allocations: [100], rebalancingEnabled: false, rebalancingThreshold: DEFAULT_REBALANCING_THRESHOLD }
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
      const newSchemes = [...p.selectedSchemes, DEFAULT_SCHEME_CODE];
      // Default: split using getDefaultAllocations
      const n = newSchemes.length;
      const newAlloc = getDefaultAllocations(n);
      return { ...p, selectedSchemes: newSchemes, allocations: newAlloc };
    }));
  };
  const handleRemoveFund = (portfolioIdx: number, idx: number) => {
    setPortfolios(prev => prev.map((p, i) => {
      if (i !== portfolioIdx) return p;
      const newSchemes = p.selectedSchemes.filter((_, j) => j !== idx);
      // Rebalance allocations for remaining funds
      const n = newSchemes.length;
      const newAlloc = n > 0 ? getDefaultAllocations(n) : [];
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

  const handleToggleRebalancing = (portfolioIdx: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, rebalancingEnabled: !p.rebalancingEnabled }
        : p
    ));
  };

  const handleRebalancingThresholdChange = (portfolioIdx: number, value: number) => {
    setPortfolios(prev => prev.map((p, i) =>
      i === portfolioIdx
        ? { ...p, rebalancingThreshold: Math.max(0, value) } // Ensure threshold is not negative
        : p
    ));
  };

  // Sync portfolios and years to query params (schemes and allocations)
  React.useEffect(() => {
    setQueryParams(portfolios, years);
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
    handleToggleRebalancing,
    handleRebalancingThresholdChange,
  };
} 