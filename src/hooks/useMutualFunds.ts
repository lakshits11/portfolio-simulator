import { useState, useEffect } from 'react';
import { MutualFund } from '../types/mutualFund';
import { fetchMutualFunds } from '../services/mutualFundService';

export const useMutualFunds = () => {
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFunds = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMutualFunds();
        setFunds(data);
      } catch (err) {
        setError('Failed to fetch mutual funds');
        setFunds([]);
        console.error('Error fetching mutual funds:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFunds();
  }, []);

  return { funds, loading, error };
}; 