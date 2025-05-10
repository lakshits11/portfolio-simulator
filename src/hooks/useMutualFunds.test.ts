import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutualFunds } from './useMutualFunds';
import { fetchMutualFunds } from '../services/mutualFundService';

// Mock the mutual fund service
jest.mock('../services/mutualFundService', () => ({
  fetchMutualFunds: jest.fn()
}));

describe('useMutualFunds', () => {
  const mockFunds = [
    { schemeCode: 123, schemeName: 'Fund 1' },
    { schemeCode: 456, schemeName: 'Fund 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch funds on mount', () => {
    renderHook(() => useMutualFunds());
    expect(fetchMutualFunds).not.toHaveBeenCalled();
  });

  it('fetches mutual funds successfully when loadFunds is called', async () => {
    (fetchMutualFunds as jest.Mock).mockResolvedValueOnce(mockFunds);
    const { result } = renderHook(() => useMutualFunds());

    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.funds).toEqual([]);

    // Trigger loading
    await act(async () => {
      await result.current.loadFunds();
    });

    // Final state
    expect(result.current.funds).toEqual(mockFunds);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(fetchMutualFunds).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error when loadFunds is called', async () => {
    const errorMessage = 'Failed to fetch funds';
    (fetchMutualFunds as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    const { result } = renderHook(() => useMutualFunds());

    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.funds).toEqual([]);

    // Trigger loading
    await act(async () => {
      await result.current.loadFunds();
    });

    // Final state
    expect(result.current.funds).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch mutual funds');
    expect(result.current.loading).toBe(false);
    expect(fetchMutualFunds).toHaveBeenCalledTimes(1);
  });
}); 