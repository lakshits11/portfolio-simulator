import React from 'react';
import { MutualFund } from '../types/mutualFund';

interface MutualFundDropdownProps {
  funds: MutualFund[];
  onSelect: (schemeCode: number) => void;
}

export const MutualFundDropdown: React.FC<MutualFundDropdownProps> = ({ funds, onSelect }) => {
  return (
    <select 
      style={{ width: '100%', padding: '8px' }}
      onChange={(e) => onSelect(Number(e.target.value))}
    >
      <option value="">Select a mutual fund</option>
      {funds.map(fund => (
        <option key={fund.schemeCode} value={fund.schemeCode}>
          {fund.schemeName}
        </option>
      ))}
    </select>
  );
}; 