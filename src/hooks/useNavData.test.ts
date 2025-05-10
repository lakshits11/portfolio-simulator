import { renderHook, act } from '@testing-library/react';
import { useNavData } from './useNavData';
import * as navService from '../services/navService';

describe('useNavData', () => {
  const mockNavData = [
    { date: '2025-05-09', nav: '166.29450' },
    { date: '2025-05-08', nav: '168.13110' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not fetch on mount', () => {
    const fetchSpy = jest.spyOn(navService, 'fetchNavData');
    renderHook(() => useNavData());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches and sets navData when loadNavData is called', async () => {
    jest.spyOn(navService, 'fetchNavData').mockResolvedValueOnce(mockNavData);
    const { result } = renderHook(() => useNavData());
    await act(async () => {
      await result.current.loadNavData(120716);
    });
    expect(result.current.navData).toEqual(mockNavData);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles error when fetchNavData fails', async () => {
    jest.spyOn(navService, 'fetchNavData').mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useNavData());
    await act(async () => {
      await result.current.loadNavData(120716);
    });
    expect(result.current.navData).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch NAV data');
    expect(result.current.loading).toBe(false);
  });
}); 