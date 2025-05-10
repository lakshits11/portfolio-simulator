import React, { useState, useEffect } from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavTable } from './components/NavTable';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';
import { calculateRollingXirr } from './utils/rollingXirr';
import { RollingXirrTable } from './components/RollingXirrTable';

const DEFAULT_SCHEME_CODE = 120716;

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();
  const { navData, loading: navLoading, error: navError, loadNavData } = useNavData();
  const [selectedScheme, setSelectedScheme] = useState<number>(DEFAULT_SCHEME_CODE);

  useEffect(() => {
    loadNavData(DEFAULT_SCHEME_CODE);
    // eslint-disable-next-line
  }, []);

  const handleFundSelect = (schemeCode: number) => {
    setSelectedScheme(schemeCode);
    loadNavData(schemeCode);
  };

  const rollingXirr = (!navLoading && !navError && navData.length > 0)
    ? calculateRollingXirr(navData)
    : [];

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
          <NavTable navData={navData} />
          <RollingXirrTable data={rollingXirr} />
        </>
      )}
    </Container>
  );
};

export default App;