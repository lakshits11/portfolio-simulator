import { MutualFund } from '../types/mutualFund';

const API_BASE_URL = 'https://api.mfapi.in';

export const fetchMutualFunds = async (): Promise<MutualFund[]> => {
  const response = await fetch(`${API_BASE_URL}/mf`);
  if (!response.ok) {
    throw new Error('Failed to fetch mutual funds');
  }
  return response.json();
}; 