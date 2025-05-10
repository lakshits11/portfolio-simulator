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

const DEFAULT_SCHEME_CODE = 120716;

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { navData, loading: navLoading, error: navError, loadNavData } = useNavData();
  const [selectedScheme, setSelectedScheme] = useState<number>(DEFAULT_SCHEME_CODE);
  const [xirrError, setXirrError] = useState<string | null>(null);
  const [lumpSumRollingXirr, setLumpSumRollingXirr] = useState<RollingXirrEntry[]>([]);
  const [filledNavData, setFilledNavData] = useState<NavEntry[]>([]);

  useEffect(() => {
    loadNavData(DEFAULT_SCHEME_CODE);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!navLoading && !navError && navData.length > 0) {
      try {
        const filled = fillMissingNavDates(navData);
        setFilledNavData(filled);
        const rolling = calculateLumpSumRollingXirr(filled);
        setLumpSumRollingXirr(rolling);
        setXirrError(null);
      } catch (err: any) {
        setXirrError(err.message || 'Error calculating lump sum rolling XIRR');
        setLumpSumRollingXirr([]);
      }
    } else {
      setLumpSumRollingXirr([]);
      setFilledNavData(navData);
    }
  }, [navData, navLoading, navError]);

  const handleFundSelect = (schemeCode: number) => {
    setSelectedScheme(schemeCode);
    loadNavData(schemeCode);
  };

  return (
    <Container>
      <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
      {loading && <LoadingSpinner />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && funds.length > 0 && (
        <MutualFundDropdown 
          funds={funds} 
          onSelect={handleFundSelect}
          value={selectedScheme}
        />
      )}
      {selectedScheme && navLoading && <LoadingSpinner />}
      {selectedScheme && navError && <div style={{ color: 'red' }}>{navError}</div>}
      {selectedScheme && !navLoading && !navError && navData.length > 0 && (
        <>
          <NavTable navData={filledNavData} />
          <RollingXirrTable data={lumpSumRollingXirr} />
          {xirrError && <div style={{ color: 'red', marginTop: 16 }}>{xirrError}</div>}
        </>
      )}
    </Container>
  );
};

export default App;