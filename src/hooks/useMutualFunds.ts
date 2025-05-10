import { useState, useCallback } from 'react';
import { MutualFund } from '../types/mutualFund';
import { fetchMutualFunds } from '../services/mutualFundService';

export const useMutualFunds = () => {
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMutualFunds();
      setFunds(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch mutual funds');
      console.error('Error fetching mutual funds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { funds, loading, error, loadFunds };
}; 