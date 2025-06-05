import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MutualFundDropdown } from './MutualFundDropdown';
import { BaseProvider, LightTheme } from 'baseui';
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

  it('renders options', async () => {
    render(
      <BaseProvider theme={LightTheme}>
        <MutualFundDropdown funds={mockFunds} onSelect={() => {}} />
      </BaseProvider>
    );
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    expect(screen.getByText('Fund 1')).toBeInTheDocument();
    expect(screen.getByText('Fund 2')).toBeInTheDocument();
  });

  it('calls onSelect with correct scheme code when a fund is selected', async () => {
    render(
      <BaseProvider theme={LightTheme}>
        <MutualFundDropdown funds={mockFunds} onSelect={mockOnSelect} />
      </BaseProvider>
    );
    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText('Fund 1'));
    expect(mockOnSelect).toHaveBeenCalledWith(123);
  });
}); 