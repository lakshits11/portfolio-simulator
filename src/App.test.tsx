import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';
import * as useMutualFundsModule from './hooks/useMutualFunds';
import * as useNavDataModule from './hooks/useNavData';

const mockFunds = [
  { schemeCode: 123, schemeName: 'Fund 1' },
  { schemeCode: 456, schemeName: 'Fund 2' }
];

const mockNavData = [
  { date: new Date('2025-05-09'), nav: 166.2945 },
  { date: new Date('2025-05-08'), nav: 168.1311 }
];

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows spinner while loading funds on mount', () => {
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: [],
      loading: true,
      error: null
    });
    jest.spyOn(useNavDataModule, 'useNavData').mockReturnValue({
      navData: [],
      loading: false,
      error: null,
      loadNavData: jest.fn()
    });
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows dropdown after funds are loaded', () => {
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: mockFunds,
      loading: false,
      error: null
    });
    jest.spyOn(useNavDataModule, 'useNavData').mockReturnValue({
      navData: [],
      loading: false,
      error: null,
      loadNavData: jest.fn()
    });
    render(<App />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Fund 1')).toBeInTheDocument();
    expect(screen.getByText('Fund 2')).toBeInTheDocument();
  });

  it('shows error message if error occurs', () => {
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: [],
      loading: false,
      error: 'Failed to fetch mutual funds'
    });
    jest.spyOn(useNavDataModule, 'useNavData').mockReturnValue({
      navData: [],
      loading: false,
      error: null,
      loadNavData: jest.fn()
    });
    render(<App />);
    expect(screen.getByText('Failed to fetch mutual funds')).toBeInTheDocument();
  });

  it('shows spinner when a fund is selected and nav data is loading', () => {
    const loadNavData = jest.fn();
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: mockFunds,
      loading: false,
      error: null
    });
    jest.spyOn(useNavDataModule, 'useNavData').mockReturnValue({
      navData: [],
      loading: true,
      error: null,
      loadNavData
    });
    render(<App />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 123 } });
    expect(loadNavData).toHaveBeenCalledWith(123);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows NAV table when nav data is loaded after fund selection', () => {
    const loadNavData = jest.fn();
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: mockFunds,
      loading: false,
      error: null
    });
    jest.spyOn(useNavDataModule, 'useNavData').mockReturnValue({
      navData: mockNavData,
      loading: false,
      error: null,
      loadNavData
    });
    render(<App />);
    // Simulate fund selection
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 123 } });
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    const tableUtils = within(table);
    expect(tableUtils.getByText('2025-05-09')).toBeInTheDocument();
    expect(tableUtils.getByText('166.29450')).toBeInTheDocument();
    expect(tableUtils.getByText('2025-05-08')).toBeInTheDocument();
    expect(tableUtils.getByText('168.13110')).toBeInTheDocument();
  });
}); 