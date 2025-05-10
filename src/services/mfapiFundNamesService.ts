import { mfapiMutualFund } from '../types/mfapiMutualFund';

// Service for fetching mutual fund names from mfapi.in
const API_BASE_URL = 'https://api.mfapi.in';

export const fetchMutualFunds = async (): Promise<mfapiMutualFund[]> => {
  const response = await fetch(`${API_BASE_URL}/mf`);
  if (!response.ok) {
    throw new Error('Failed to fetch mutual funds');
  }
  return response.json();
}; 