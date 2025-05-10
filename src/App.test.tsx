import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as useMutualFundsModule from './hooks/useMutualFunds';

const mockFunds = [
  { schemeCode: 123, schemeName: 'Fund 1' },
  { schemeCode: 456, schemeName: 'Fund 2' }
];

describe('App', () => {
  it('always shows the Load Mutual Funds button', () => {
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: [],
      loading: false,
      error: null,
      loadFunds: jest.fn()
    });
    render(<App />);
    expect(screen.getByText('Load Mutual Funds')).toBeInTheDocument();
  });

  it('disables the button and shows spinner while loading', () => {
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: [],
      loading: true,
      error: null,
      loadFunds: jest.fn()
    });
    render(<App />);
    const button = screen.getByText('Load Mutual Funds');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows dropdown after funds are loaded', () => {
    jest.spyOn(useMutualFundsModule, 'useMutualFunds').mockReturnValue({
      funds: mockFunds,
      loading: false,
      error: null,
      loadFunds: jest.fn()
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
      error: 'Failed to fetch mutual funds',
      loadFunds: jest.fn()
    });
    render(<App />);
    expect(screen.getByText('Failed to fetch mutual funds')).toBeInTheDocument();
  });
}); 