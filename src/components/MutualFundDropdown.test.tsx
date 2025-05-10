import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MutualFundDropdown } from './MutualFundDropdown';
// If you want to add type safety, you can import { mfapiMutualFund } from '../types/mfapiMutualFund';

describe('MutualFundDropdown', () => {
  const mockFunds = [
    { schemeCode: 123, schemeName: 'Fund 1' },
    { schemeCode: 456, schemeName: 'Fund 2' }
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders with placeholder text', () => {
    render(<MutualFundDropdown funds={mockFunds} onSelect={mockOnSelect} />);
    expect(screen.getByText('Select a mutual fund')).toBeInTheDocument();
  });

  it('displays fund options when clicked', () => {
    render(<MutualFundDropdown funds={mockFunds} onSelect={mockOnSelect} />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.click(dropdown);
    
    expect(screen.getByText('Fund 1')).toBeInTheDocument();
    expect(screen.getByText('Fund 2')).toBeInTheDocument();
  });

  it('calls onSelect with correct scheme code when a fund is selected', () => {
    render(<MutualFundDropdown funds={mockFunds} onSelect={mockOnSelect} />);
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 123 } });
    expect(mockOnSelect).toHaveBeenCalledWith(123);
  });
}); 