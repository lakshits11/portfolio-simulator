import { mfapiMutualFund } from '../types/mfapiMutualFund';

// Service for fetching mutual fund names from mfapi.in
const API_BASE_URL = 'https://api.mfapi.in';

export const fetchMutualFunds = async (): Promise<mfapiMutualFund[]> => {
  const response = await fetch(`${API_BASE_URL}/mf`);
  if (!response.ok) {
    throw new Error('Failed to fetch mutual funds');
  }
  const allFunds: mfapiMutualFund[] = await response.json();
  return allFunds
    .filter(fund =>
      fund.schemeName.toLowerCase().includes('direct') &&
      fund.schemeName.toLowerCase().includes('growth') &&
      !fund.schemeName.toLowerCase().includes('idcw') &&
      !fund.schemeName.toLowerCase().includes('dividend') &&
      !fund.schemeName.toLowerCase().includes('days') &&
      !fund.schemeName.toLowerCase().includes('fixed') &&
      !fund.schemeName.toLowerCase().includes('series') &&
      !fund.schemeName.toLowerCase().includes('fmp')
    )
    .sort((a, b) => a.schemeName.localeCompare(b.schemeName, undefined, { sensitivity: 'base' }));
}; 