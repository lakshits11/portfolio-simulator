import React, { useEffect, useState } from 'react';
import { MutualFund } from './types/mutualFund';
import { fetchMutualFunds } from './services/mutualFundService';
import { MutualFundDropdown } from './components/MutualFundDropdown';

const App: React.FC = () => {
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFunds = async () => {
      try {
        const data = await fetchMutualFunds();
        setFunds(data);
      } catch (error) {
        console.error('Error fetching mutual funds:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFunds();
  }, []);

  const handleFundSelect = (schemeCode: number) => {
    console.log('Selected fund:', schemeCode);
    // Add your selection handling logic here
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mutual Funds</h2>
      <MutualFundDropdown 
        funds={funds} 
        onSelect={handleFundSelect}
      />
    </div>
  );
};

export default App;