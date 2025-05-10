import React from 'react';
import { MutualFund } from '../types/mutualFund';

interface MutualFundDropdownProps {
  funds: MutualFund[];
  onSelect: (schemeCode: number) => void;
  value?: number | null;
}

export const MutualFundDropdown: React.FC<MutualFundDropdownProps> = ({ funds, onSelect, value }) => {
  const allFunds = funds;

  return (
    <select 
      style={{ width: '100%', padding: '8px' }}
      onChange={(e) => onSelect(Number(e.target.value))}
      value={value ?? ''}
    >
      {(value === null || value === undefined) && (
        <option value="">Select a mutual fund</option>
      )}
      {allFunds.map(fund => (
        <option key={fund.schemeCode} value={fund.schemeCode}>
          {fund.schemeName}
        </option>
      ))}
    </select>
  );
}; 