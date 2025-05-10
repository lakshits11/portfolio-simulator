import React from 'react';
import { MutualFundDropdown } from './components/MutualFundDropdown';
import { Container } from './components/Container';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useMutualFunds } from './hooks/useMutualFunds';

const App: React.FC = () => {
  const { funds, loading, error } = useMutualFunds();

  const handleFundSelect = (schemeCode: number) => {
    console.log('Selected fund:', schemeCode);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container>
        <div style={{ color: 'red' }}>{error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 style={{ marginBottom: '20px' }}>Mutual Funds</h2>
      <MutualFundDropdown 
        funds={funds} 
        onSelect={handleFundSelect}
      />
    </Container>
  );
};

export default App;