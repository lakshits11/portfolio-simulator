import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./hooks/useMutualFunds', () => ({
  useMutualFunds: () => ({
    funds: [
      { schemeCode: 1, schemeName: 'Test Fund 1' },
      { schemeCode: 2, schemeName: 'Test Fund 2' },
    ],
    loading: false,
    error: null,
  }),
}));

jest.mock('./hooks/useNavData', () => ({
  useNavData: () => ({
    navData: [],
    loading: false,
    error: null,
    loadNavData: jest.fn(),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Mutual Funds/i)).toBeInTheDocument();
  });

  it('shows the Plot button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /plot/i })).toBeInTheDocument();
  });

  it('renders the years input', () => {
    render(<App />);
    expect(screen.getByLabelText(/Rolling Period/i)).toBeInTheDocument();
  });

  it('renders the MutualFundDropdown when funds are loaded', () => {
    render(<App />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
}); 