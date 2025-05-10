import React, { useState } from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NavTable } from './components/NavTable';
import { useMutualFunds } from './hooks/useMutualFunds';
import { useNavData } from './hooks/useNavData';

const App: React.FC = () => {
  const { funds, loading, error, loadFunds } = useMutualFunds();
  const { navData, loading: navLoading, error: navError, loadNavData } = useNavData();
  const [selectedScheme, setSelectedScheme] = useState<number | null>(null);

  const handleFundSelect = (schemeCode: number) => {
    setSelectedScheme(schemeCode);
    loadNavData(schemeCode);
  };

  const handleLoadClick = async () => {
    await loadFunds();
  };

  return (
    <Container>
      <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
      <button onClick={handleLoadClick} style={{ marginBottom: '20px' }} disabled={loading}>
        Load Mutual Funds
      </button>
      {loading && <LoadingSpinner />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && funds.length > 0 && (
        <MutualFundDropdown 
          funds={funds} 
          onSelect={handleFundSelect}
        />
      )}
      {selectedScheme && navLoading && <LoadingSpinner />}
      {selectedScheme && navError && <div style={{ color: 'red' }}>{navError}</div>}
      {selectedScheme && !navLoading && !navError && navData.length > 0 && (
        <NavTable navData={navData} />
      )}
    </Container>
  );
};

export default App;