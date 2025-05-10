import React, { useState, useEffect } from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavTable } from './components/NavTable';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';
import { calculateLumpSumRollingXirr, RollingXirrEntry } from './utils/lumpSumRollingXirr';
import { RollingXirrTable } from './components/RollingXirrTable';
import { fillMissingNavDates } from './utils/fillMissingNavDates';
import { NavEntry } from './types/navData';
import { calculateSipRollingXirr, SipRollingXirrEntry } from './utils/sipRollingXirr';
import { SipRollingXirrTable } from './components/SipRollingXirrTable';
import { getQueryParams, setQueryParams } from './utils/queryParams';
import { useRollingXirr } from './hooks/useRollingXirr';

const DEFAULT_SCHEME_CODE = 120716;

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { navData, loading: navLoading, error: navError, loadNavData } = useNavData();

  // Initialize from query string
  const initialParams = getQueryParams();
  const [selectedScheme, setSelectedScheme] = useState<number>(
    initialParams.scheme || DEFAULT_SCHEME_CODE
  );
  const [years, setYears] = useState<number>(initialParams.years || 1);

  // Use custom hook for XIRR logic
  const {
    xirrError,
    lumpSumRollingXirr,
    sipRollingXirr,
    filledNavData,
    rollingLoading,
    hasPlotted,
    navRequested,
    setNavRequested,
    setHasPlotted,
    setLumpSumRollingXirr,
    setSipRollingXirr,
    setXirrError,
    setFilledNavData,
    handlePlot,
  } = useRollingXirr(navData, navLoading, navError, years);

  // Sync state to query string
  useEffect(() => {
    setQueryParams(selectedScheme, years);
  }, [selectedScheme, years]);

  // Auto-trigger plot if params are present in URL
  useEffect(() => {
    if (initialParams.scheme && initialParams.years) {
      setNavRequested(true);
      loadNavData(initialParams.scheme);
    }
    // eslint-disable-next-line
  }, []);

  const handleFundSelect = (schemeCode: number) => {
    setSelectedScheme(schemeCode);
    setHasPlotted(false);
    setLumpSumRollingXirr([]);
    setSipRollingXirr([]);
    setXirrError(null);
    setFilledNavData([]);
    setNavRequested(false);
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYears(Math.max(1, Math.floor(Number(e.target.value))));
    setHasPlotted(false);
    setLumpSumRollingXirr([]);
    setSipRollingXirr([]);
    setXirrError(null);
    setFilledNavData([]);
    setNavRequested(false);
  };

  return (
    <Container>
      <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="years-input">Rolling Period (years): </label>
        <input
          id="years-input"
          type="number"
          min={1}
          max={30}
          value={years}
          onChange={handleYearsChange}
          style={{ width: 60, marginLeft: 8 }}
        />
        <button
          style={{ marginLeft: 16, padding: '4px 16px', fontSize: 16 }}
          onClick={() => handlePlot(loadNavData, selectedScheme)}
          disabled={navLoading || loading || rollingLoading}
        >
          Plot
        </button>
      </div>
      {loading && <LoadingSpinner text="Loading list of mutual funds..." />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && funds.length > 0 && (
        <MutualFundDropdown 
          funds={funds} 
          onSelect={handleFundSelect}
          value={selectedScheme}
        />
      )}
      {navRequested && navLoading && <LoadingSpinner text="Loading NAV data..." />}
      {selectedScheme && navError && <div style={{ color: 'red' }}>{navError}</div>}
      {(hasPlotted || rollingLoading) && selectedScheme && !navLoading && !navError && navData.length > 0 && (
        rollingLoading ? <LoadingSpinner text="Calculating XIRR..." /> : (
          <>
            <NavTable navData={filledNavData} />
            <RollingXirrTable data={lumpSumRollingXirr} />
            <SipRollingXirrTable data={sipRollingXirr} />
            {xirrError && <div style={{ color: 'red', marginTop: 16 }}>{xirrError}</div>}
          </>
        )
      )}
    </Container>
  );
};

export default App;