import React from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useMutualFunds } from './hooks/useMutualFunds';

const App: React.FC = () => {
  const { funds, loading, error, loadFunds } = useMutualFunds();

  const handleFundSelect = (schemeCode: number) => {
    console.log('Selected fund:', schemeCode);
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
    </Container>
  );
};

export default App;