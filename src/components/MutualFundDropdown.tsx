import React from 'react';
import { MutualFund } from '../types/mutualFund';

interface MutualFundDropdownProps {
  funds: MutualFund[];
  onSelect: (schemeCode: number) => void;
}

export const MutualFundDropdown: React.FC<MutualFundDropdownProps> = ({ funds, onSelect }) => {
  // Take only first 10 funds
  const limitedFunds = funds.slice(0, 10);

  return (
    <select 
      style={{ width: '100%', padding: '8px' }}
      onChange={(e) => onSelect(Number(e.target.value))}
    >
      <option value="">Select a mutual fund</option>
      {limitedFunds.map(fund => (
        <option key={fund.schemeCode} value={fund.schemeCode}>
          {fund.schemeName}
        </option>
      ))}
    </select>
  );
}; 