import React from 'react';
import { mfapiMutualFund } from '../types/mfapiMutualFund';

interface MutualFundDropdownProps {
  funds: mfapiMutualFund[];
  onSelect: (schemeCode: number) => void;
  value?: number | null;
}

export const MutualFundDropdown: React.FC<MutualFundDropdownProps> = ({ funds, onSelect, value }) => {
  const allFunds = funds;

  return (
    <select
      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
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